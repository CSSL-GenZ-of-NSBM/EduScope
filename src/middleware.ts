import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      // Redirect to sign in if not authenticated
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Check if user has admin or moderator privileges
    const userRole = token.role
    if (!userRole || (userRole !== 'admin' && userRole !== 'moderator')) {
      // Redirect to dashboard if not admin/moderator
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Additional check for user management - only admins can access
    if (request.nextUrl.pathname.startsWith('/admin/users') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
