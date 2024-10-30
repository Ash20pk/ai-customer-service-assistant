import { NextRequest } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import { verifyToken } from '../../../lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const botId = searchParams.get('botId');
  const message = searchParams.get('message');
  const token = searchParams.get('token');

  if (!botId || !message) {
    return new Response('Missing required parameters', { status: 400 });
  }

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const userId = await verifyToken(token);
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

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
    let previousText = '';
    let citations: string[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        const sendSSE = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        const processMessageUpdate = async () => {
          const messages = await openai.beta.threads.messages.list(thread.id);
          const lastMessage = messages.data[0];

          console.log('Last message:', lastMessage); // Debugging statement
          if (lastMessage && lastMessage.role === "assistant" && lastMessage.content && lastMessage.content[0] && lastMessage.content[0].type === "text") {
            const { value: textValue, annotations } = lastMessage.content[0].text;
            let processedText = textValue;

            if (annotations && annotations.length > 0) {
              citations = [];
              let index = 0;
              for (let annotation of annotations) {
                processedText = processedText.replace(annotation.text, `[${index}]`);
                if (annotation.type === 'file_citation') {
                  const citedFile = await openai.files.retrieve(annotation.file_citation.file_id);
                  citations.push(`[${index}]${citedFile.filename}`);
                }
                index++;
              }
            }

            if (processedText !== previousText) {
              const newContent = processedText.slice(previousText.length).trim();
              const words = newContent.split(' ');

              for (let i = 0; i < words.length; i++) {
                const word = words[i];
                if (word) {
                  if (i > 0) {
                    sendSSE('message', { content: ' ' + word }); // Add space before every word after the first word
                  } else {
                    sendSSE('message', { content: word }); // Send the first word without a space
                  }
                }
              }
              
              previousText = processedText;
            }
          }
        };

        while (true) {
          const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
          
          if (runStatus.status === 'completed') {
            await processMessageUpdate();
            sendSSE('message', { content: '[DONE]' });
            controller.close();
            break;
          } else if (runStatus.status === 'failed') {
            sendSSE('error', { message: runStatus.last_error?.message || 'Run failed' });
            controller.close();
            break;
          } else if (runStatus.status === 'in_progress') {
            await processMessageUpdate();
          }

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