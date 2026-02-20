import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const decoded = jwtDecode(token);
    
    if (!decoded || !decoded.roles || !Array.isArray(decoded.roles)) {
      throw new Error('Invalid token structure');
    }
    
    const roles = decoded.roles;

    // ROLE BASED ACCESS
    if (pathname.startsWith('/dashboard/admin') && !roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/dashboard/hr') && !roles.includes("HR") && !roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/dashboard/employee') && !roles.includes("EMPLOYEE") && !roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Token validation error:', err);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

}


export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
