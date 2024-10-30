import * as jose from 'jose';

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
