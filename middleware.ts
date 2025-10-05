import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Check if user is trying to access manager/admin pages
    if (pathname.startsWith('/manager') || pathname.startsWith('/api/admin')) {
      // Allow access only for manager, CEO, and Co-founder roles
      if (!token?.role || !['manager', 'CEO', 'Co-founder'].includes(token.role as string)) {
        // Redirect to access denied page with original URL
        const url = new URL('/access-denied', req.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public pages that don't require authentication
        const publicPages = ['/login', '/api/auth/signin', '/access-denied'];
        
        if (publicPages.includes(pathname)) {
          return true;
        }
        
        // If no token, redirect to login
        if (!token) {
          const url = new URL('/login', req.url);
          url.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(url);
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ]
};
