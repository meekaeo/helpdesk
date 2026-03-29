import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth  = request.headers.get('authorization');
    const valid = 'Basic ' + Buffer.from(
      process.env.ADMIN_USER + ':' + process.env.ADMIN_PASS
    ).toString('base64');

    if (auth !== valid) {
      return new NextResponse('Unauthorized', {
        status : 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
      });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };