import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const bot = await db.collection('bots').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Generate or retrieve client secret
    if (!bot.clientSecret) {
      const clientSecret = crypto.randomBytes(32).toString('hex');
      await db.collection('bots').updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { clientSecret } }
      );
      return NextResponse.json({ clientSecret });
    }

    return NextResponse.json({ clientSecret: bot.clientSecret });
  } catch (error) {
    console.error('Error generating client secret:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 