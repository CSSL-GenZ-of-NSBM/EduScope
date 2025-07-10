import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      // Redirect to sign in if not authenticated
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Check if user has admin, superadmin, or moderator privileges
    const userRole = token.role
    if (!userRole || !['admin', 'superadmin', 'moderator'].includes(userRole)) {
      // Redirect to dashboard if not admin/superadmin/moderator
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Additional check for user management - only admins and superadmins can access
    if (pathname.startsWith('/admin/users') && !['admin', 'superadmin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
