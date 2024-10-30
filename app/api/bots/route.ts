import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, description, instructions } = await request.json();

    // Create OpenAI Assistant
    const assistant = await openai.beta.assistants.create({
      name: name,
      instructions: instructions || "You are an expert customer service agent. Use your knowledge base to answer questions about product/service according to the docs uploaded.",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });

    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    const result = await db.collection('bots').insertOne({
      userId: new ObjectId(userId),
      name,
      description,
      assistantId: assistant.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ botId: result.insertedId, assistantId: assistant.id });
  } catch (error) {
    console.error('Error creating bot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    const bots = await db.collection('bots').find({ userId: new ObjectId(userId) }).toArray();

    return NextResponse.json({ bots });
  } catch (error) {
    console.error('Error fetching bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
