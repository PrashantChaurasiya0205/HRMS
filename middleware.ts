import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Check if user is trying to access manager/admin pages
    if (pathname.startsWith('/manager') || pathname.startsWith('/api/admin')) {
      // Allow access only for manager, CEO, Co-founder, and CFO roles (case-insensitive)
      const userRole = (token?.role || '').toLowerCase();
      const allowedRoles = ['manager', 'ceo', 'co-founder', 'cfo'];
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to access denied page with original URL
        const url = new URL('/access-denied', req.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }

    // Check if user is trying to access CEO page
    if (pathname.startsWith('/ceo')) {
      const userRole = (token?.role || '').toLowerCase();
      if (userRole !== 'ceo') {
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
        
        // All other pages require authentication
        return !!token;
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
