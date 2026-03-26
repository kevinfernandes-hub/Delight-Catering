import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-dev-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes
  const publicRoutes = ['/', '/menu', '/api/reviews', '/api/contacts', '/api/auth/login'];
  
  if (publicRoutes.some(route => request.nextUrl.pathname === route)) {
    return NextResponse.next();
  }

  // Protect /admin routes (UI)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      // Redirect to login if accessing admin pages without token
      if (request.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.next();
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      // Invalid token, redirect to login
      if (request.nextUrl.pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.next();
    }
  }

  // Protect /api routes (except public ones)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/customers/:path*',
    '/api/orders/:path*',
    '/api/invoices/:path*',
    '/api/menu/:path*',
    '/api/stats/:path*',
  ],
};
