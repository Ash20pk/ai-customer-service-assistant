import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { getDatabase } from '@/lib/mongodb';

/**
 * @dev Handles the POST request for user signup.
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the JWT token if signup is successful, otherwise an error response.
 */
export async function POST(request: Request) {
  // Parse the request body to extract email and password.
  const { email, password } = await request.json();

  try {
    // Connect to the database.
    const db = await getDatabase();
    
    // Check if the email is already in use.
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash the password before storing it in the database.
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new user into the database.
    const result = await db.collection('users').insertOne({ 
      email, 
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create a JWT token for the newly registered user.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ userId: result.insertedId.toString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    // Return the JWT token in the response.
    return NextResponse.json({ token });
  } catch (error) {
    // Log any errors that occur during the signup process and return an internal server error.
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}