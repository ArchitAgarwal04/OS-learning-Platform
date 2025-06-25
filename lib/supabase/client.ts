import { createBrowserClient } from '@supabase/ssr'

// Dynamic environment detection
function getEnvironmentConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.startsWith('192.168.') ||
     window.location.hostname.endsWith('.local'))

  // Auto-detect site URL for auth redirects
  let siteUrl: string
  
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    siteUrl = window.location.origin
  } else {
    // Server-side: fallback to environment variable or default
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
              (isDevelopment ? 'http://localhost:3000' : 'https://os.priyanshuthapliyal.me')
  }

  return {
    isDevelopment,
    isLocalhost,
    siteUrl
  }
}

export function createClient() {
  const { siteUrl, isDevelopment, isLocalhost } = getEnvironmentConfig()
  
  // Debug log for development
  if (isDevelopment) {
    console.log('🔧 Supabase Client Config:', {
      siteUrl,
      isDevelopment,
      isLocalhost,
      callbackUrl: `${siteUrl}/auth/callback`
    })
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}

// Export the callback URL for use in auth methods
export function getAuthCallbackUrl() {
  const { siteUrl } = getEnvironmentConfig()
  return `${siteUrl}/auth/callback`
}
