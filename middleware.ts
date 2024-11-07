import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Public routes that don't need authentication
  const publicPaths = [
    '/api/auth',
    '/auth',
    '/',
    '/widget',
    '/api/widget',
  ];

  // Check if the current path matches any public paths
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token');

  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    await verifyToken(token.value);
    return NextResponse.next();
  } catch (error) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/create-bot/:path*',
    '/bot/:path*',
    '/widget/:path*'
  ],
}; 