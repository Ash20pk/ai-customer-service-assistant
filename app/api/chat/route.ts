import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import crypto from 'crypto';
import { decrypt } from '@/lib/encryption';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Session {
  _id: ObjectId;
  botId: ObjectId;
  clientSecret: string;
  sessionId: string;
  threadId: string;
  createdAt: Date;
  lastActivity: Date;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const botId = searchParams.get('botId');
  const message = searchParams.get('message');
  const encryptedClientSecret = searchParams.get('clientSecret');
  const sessionId = searchParams.get('sessionId');
  const isWidget = searchParams.get('widget') === 'true';

  if (!botId || !message) {
    return new Response('Missing required parameters', { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ai_chat_app');

    // Get bot data first
    const bot = await db.collection('bots').findOne({
      _id: new ObjectId(botId)
    });

    if (!bot) {
      return new Response('Bot not found', { status: 404 });
    }

    // Verify client secret if it's a widget request
    if (isWidget) {
      if (!encryptedClientSecret) {
        return new Response('Unauthorized: Missing client secret', { status: 401 });
      }

      try {
        const decryptedSecret = decrypt(encryptedClientSecret);
        if (decryptedSecret !== bot.clientSecret) {
          return new Response('Unauthorized: Invalid client secret', { status: 401 });
        }
      } catch (error) {
        console.error('Error decrypting client secret:', error);
        return new Response('Unauthorized: Invalid encryption', { status: 401 });
      }
    }

    // Get or create session
    let session = null;
    if (sessionId) {
      session = await db.collection('sessions').findOne({
        sessionId,
        botId: new ObjectId(botId)
      });
    }

    if (!session) {
      // Create new session
      session = {
        botId: new ObjectId(botId),
        sessionId: crypto.randomBytes(16).toString('hex'),
        threadId: (await openai.beta.threads.create()).id,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      await db.collection('sessions').insertOne(session);
    }

    // Update last activity
    await db.collection('sessions').updateOne(
      { _id: session._id },
      { $set: { lastActivity: new Date() } }
    );

    // Use session's thread ID for the conversation
    await openai.beta.threads.messages.create(session.threadId, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(session.threadId, {
      assistant_id: bot.assistantId,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send session ID first if it's a new session
        if (!sessionId) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: session.sessionId })}\n\n`));
        }

        const sendSSE = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        while (true) {
          const runStatus = await openai.beta.threads.runs.retrieve(session.threadId, run.id);
          
          if (runStatus.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(session.threadId);
            const lastMessage = messages.data[0];

            if (lastMessage?.role === "assistant" && lastMessage.content?.[0]?.type === "text") {
              const text = lastMessage.content[0].text.value;
              // Split the text into words and send each word immediately
              const words = text.split(' ');
              for (const word of words) {
                sendSSE({ content: word });
                // Small delay between words for natural reading flow
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }
            sendSSE({ content: '[DONE]' });
            controller.close();
            break;
          } else if (runStatus.status === 'failed') {
            sendSSE({ error: runStatus.last_error?.message || 'Run failed' });
            controller.close();
            break;
          }

          // Check status every 500ms
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('An error occurred while processing your request.', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
