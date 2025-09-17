import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an authenticated route
  if (request.nextUrl.pathname.startsWith('/authenticated')) {
    // Check for authentication in cookies or headers
    // Since we're using localStorage, we'll need to handle this on the client side
    // This middleware will just ensure the route structure is protected
    
    // For now, let the client-side authentication handle the redirect
    // The layout.tsx in authenticated folder will handle the actual auth check
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};