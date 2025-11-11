import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/auth/')
  const isHomePage = req.nextUrl.pathname === '/'
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')

  // API routes should handle their own auth - don't redirect them
  if (isApiRoute) {
    return res
  }

  // If user is not authenticated and trying to access protected pages
  if (!session && !isAuthPage) {
    const redirectUrl = new URL('/auth/signin', req.url)
    // Store the original URL to redirect back after sign in
    if (req.nextUrl.pathname !== '/') {
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to personas
  if (session && isAuthPage && !req.nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/personas', req.url))
  }

  // If user is authenticated and on home page, redirect to personas
  if (session && isHomePage) {
    return NextResponse.redirect(new URL('/personas', req.url))
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
