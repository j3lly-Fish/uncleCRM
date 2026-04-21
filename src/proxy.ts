import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let needsMfa = false
  if (user) {
    const { data: mfa } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (mfa?.currentLevel === 'aal1' && mfa?.nextLevel === 'aal2') {
      needsMfa = true
    }
  }

  // Protect all routes under /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (needsMfa) {
      const url = request.nextUrl.clone()
      url.pathname = '/mfa'
      return NextResponse.redirect(url)
    }
  }
  
  // If user is logged in and trying to access /login, redirect to dashboard
  if (request.nextUrl.pathname.startsWith('/login') && user && !needsMfa) {
     const url = request.nextUrl.clone()
     url.pathname = '/dashboard'
     return NextResponse.redirect(url)
  }

  // Prevent accessing /mfa if not needed
  if (request.nextUrl.pathname.startsWith('/mfa') && !needsMfa) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
