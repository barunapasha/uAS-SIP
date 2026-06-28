import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('evenin_token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isProfilePage = request.nextUrl.pathname.startsWith('/profile');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isCheckoutPage = request.nextUrl.pathname.startsWith('/checkout');

  if (!token) {
    if (isProfilePage || isAdminPage || isCheckoutPage) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    if (isAdminPage) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        if (payload.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (e) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/checkout/:path*', '/auth/:path*'],
};
