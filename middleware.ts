import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // Get session instead of just user to ensure proper authentication state
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    const user = session?.user || null

    if (sessionError) {
      console.error('Supabase session error:', sessionError);
    }    // Admin route protection - check for admin session in cookies or allow client-side validation
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
      // Check if there's an admin session cookie (we'll set this during login)
      const adminSession = request.cookies.get('admin_session')
      
      // If no admin session cookie and no regular user, redirect to admin login
      if (!adminSession && !user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/payment', '/notes', '/cpu-scheduling', '/disk-scheduling', '/page-replacement', '/comparison']
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
    
    if (!user && isProtectedRoute) {
      const loginUrl = new URL('/auth/login', request.url)
      // Add current path as redirect after login
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // If user is signed in and trying to access auth pages, redirect to dashboard
    // Exclude callback route and other auth processing routes
    if (user && request.nextUrl.pathname.startsWith('/auth/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error with session validation, allow the request to continue
    // The client-side auth will handle the redirect if needed
    return response
  }
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
