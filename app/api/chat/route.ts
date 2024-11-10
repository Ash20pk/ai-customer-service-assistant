import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');
  const searchParams = request.nextUrl.searchParams;
  const botId = searchParams.get('botId');
  const message = searchParams.get('message');
  const isWidget = searchParams.get('widget') === 'true';

  if (!isWidget) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  if (!botId || !message) {
    return new Response('Missing required parameters', { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    const bot = await db.collection('bots').findOne({ 
      _id: new ObjectId(botId),
    });
    
    if (!bot) {
      return new Response('Bot not found', { status: 404 });
    }

    if (!bot.assistantId) {
      return new Response('Assistant not created for this bot', { status: 400 });
    }

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: bot.assistantId,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendSSE = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        while (true) {
          const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
          
          if (runStatus.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
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
