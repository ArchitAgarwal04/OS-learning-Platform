import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  console.log('Auth callback received:', { code: !!code, next })
  
  if (!code) {
    console.error('No auth code in callback URL')
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=no_code`)
  }
  try {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Session exchange result:', { 
      user: data?.user?.id, 
      session: !!data?.session, 
      error 
    })
    
    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
      )
    }

    console.log('Successfully authenticated user:', data.user?.email)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
    
  } catch (err) {
    console.error('Auth callback exception:', err)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=unknown_error`
    )
  }
}
