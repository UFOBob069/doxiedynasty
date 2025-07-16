import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication or subscription
const publicRoutes = ['/signin', '/signup', '/subscription-required', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for user session (placeholder: check for a session cookie)
  const hasSession = Boolean(request.cookies.get('session')?.value);
  if (!hasSession) {
    // Not signed in, redirect to signin
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Subscription check placeholder (since we can't check Firestore in middleware)
  // In production, you would check the user's subscription status via a JWT, session, or custom header
  const hasActiveSubscription = Boolean(request.cookies.get('hasActiveSubscription')?.value);
  if (!hasActiveSubscription) {
    // No active/trialing subscription, redirect to subscription required page
    return NextResponse.redirect(new URL('/subscription-required', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 