import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for:', pathname, 'Role:', token?.role);

    // Check if user is trying to access manager/admin pages
    if (pathname.startsWith('/manager') || pathname.startsWith('/api/admin')) {
      console.log('Checking manager access for:', pathname);
      // Allow access only for manager, CEO, and Co-founder roles
      if (!token?.role || !['manager', 'CEO', 'Co-founder'].includes(token.role as string)) {
        console.log('Access denied, redirecting to access-denied page');
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
        // Allow access to public pages without authentication
        const { pathname } = req.nextUrl;
        
        // Public pages that don't require authentication
        const publicPages = ['/login', '/api/auth/signin', '/', '/access-denied'];
        
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
    '/manager/:path*',
    '/api/admin/:path*',
    '/dashboard',
    '/reports',
    '/leave',
    '/profile',
    '/calendar'
  ]
};
