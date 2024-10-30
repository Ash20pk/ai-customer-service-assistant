import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { verifyToken } from '../../../../../lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { context } = await request.json();
    const chatbotId = new ObjectId(params.id);

    const client = await clientPromise;
    const db = client.db('ai_chat_app');
    
    const result = await db.collection('chatbots').updateOne(
      { _id: chatbotId, userId },
      { $set: { context, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Context updated successfully' });
  } catch (error) {
    console.error('Error updating context:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
