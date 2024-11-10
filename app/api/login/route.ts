import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { getDatabase } from '../../../lib/mongodb';

/**
 * @dev Handles the POST request for user login.
 * @param request - The incoming HTTP request.
 * @returns A JSON response containing the JWT token if login is successful, otherwise an error response.
 */
export async function POST(request: Request) {
  // Parse the request body to extract email and password.
  const { email, password } = await request.json();

  try {
    // Connect to the database and fetch the user by email.
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });

    // If no user is found, return a user not found error.
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compare the provided password with the hashed password stored in the database.
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return an invalid credentials error.
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Create a JWT token for the authenticated user.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    // Return the JWT token in the response.
    return NextResponse.json({ token });
  } catch (error) {
    // Log any errors that occur during the login process and return an internal server error.
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}