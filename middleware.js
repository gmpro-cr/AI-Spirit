import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route =>
    route === '/' ? req.nextUrl.pathname === '/' : req.nextUrl.pathname.startsWith(route)
  )

  // If user is not signed in and trying to access a protected route
  if (!session && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', req.url)
    // Store the original URL to redirect back after sign in
    signInUrl.searchParams.set('returnTo', req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user is signed in and trying to access sign-in page, redirect to home
  if (session && req.nextUrl.pathname === '/auth/signin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

// Specify which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
