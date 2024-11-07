import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');

  if (!token) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }

  try {
    const userId = await verifyToken(token.value);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from the result
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        token: token.value
      }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
} 