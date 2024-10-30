import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';

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
    
    const chatbots = await db.collection('chatbots').find({ userId }).toArray();

    return NextResponse.json({ chatbots });
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
