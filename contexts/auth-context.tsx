'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'
import { useRouter, usePathname } from 'next/navigation'
import { trackAuthEvent } from '@/lib/analytics'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error.message)
        setAuthError(error.message)
        return
      }
      
      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)
        
        // Create or update profile on session refresh if we have a user
        if (data.session.user) {
          try {
            await DatabaseService.createOrUpdateProfile(data.session.user.id, {
              email: data.session.user.email || '',
              full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
              avatar_url: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture || '',
            })
          } catch (profileError: any) {
            console.error('Error updating profile on session refresh:', profileError)
            // Don't throw or redirect here
          }
        }
      } else {
        // No session - clear user data
        setSession(null)
        setUser(null)
      }
    } catch (err: any) {
      console.error('Error in refreshSession:', err.message)
      setAuthError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial session check
    refreshSession().then(() => {
      console.log('Initial session fetched:', session);
    }).catch((error) => {
      console.error('Error fetching initial session:', error);
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email)
      
      setLoading(false)
      
      // Handle sign in - only redirect on actual SIGNED_IN event, not TOKEN_REFRESHED
      if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession)
        setUser(newSession.user)
        
        // Track login with Google Analytics
        trackAuthEvent('login');
        
        try {
          console.log('User signed in, creating/updating profile...')
          await DatabaseService.createOrUpdateProfile(newSession.user.id, {
            email: newSession.user.email || '',
            full_name: newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name || '',
            avatar_url: newSession.user.user_metadata?.avatar_url || newSession.user.user_metadata?.picture || '',
          })
          
          // Only redirect if we're actually on a login/signup page
          // Add a small delay to ensure state is properly set
          setTimeout(() => {
            if (pathname === '/auth/login' || pathname === '/auth/signup') {
              console.log('Redirecting to dashboard after successful login')
              router.replace('/dashboard')
            }
          }, 200)
        } catch (error: any) {
          console.error('Error creating/updating profile:', {
            message: error?.message || 'Unknown error',
            userId: newSession.user.id,
            userEmail: newSession.user.email,
            // Add more detailed error logging
            errorString: JSON.stringify(error, null, 2),
            stack: error?.stack,
            name: error?.name,
            cause: error?.cause
          })
          // Don't throw here to prevent breaking the auth flow
        }
      }
      
      // Handle token refresh - just update state, no redirect
      if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession)
        setUser(newSession.user)
      }
      
      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log('Auth state: SIGNED_OUT event received');
        
        // Clear state immediately on sign out
        setSession(null)
        setUser(null)
        
        // Redirect to home page on sign out if on a protected page
        if (pathname && !pathname.startsWith('/auth') && pathname !== '/') {
          console.log('Redirecting to home after sign out');
          router.push('/')
        }
      }
      
      // Handle other auth events that might need attention
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Auth state: PASSWORD_RECOVERY event received');
      }
      
      if (event === 'USER_UPDATED') {
        console.log('Auth state: USER_UPDATED event received');
        // Update the user object if we have a session
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
        }
      }
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  // Helper function to forcefully clear auth state locally
  const forceLocalSignOut = () => {
    // Clear state
    setUser(null);
    setSession(null);
    
    // Clear any Supabase session data from localStorage
    try {
      // Remove Supabase tokens from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('supabase.auth.') || key.startsWith('sb-'))) {
          localStorage.removeItem(key);
        }
      }
      console.log('Cleared local auth state');
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  };
  
  const signOut = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Set a timeout to force completion if Supabase takes too long
      const signOutPromise = new Promise<void>((resolve, reject) => {
        // Attempt to sign out with Supabase
        supabase.auth.signOut()
          .then(({ error }) => {
            if (error) {
              console.error('Error signing out:', error.message);
              reject(error);
            } else {
              resolve();
            }
          })
          .catch(reject);
        
        // Set a timeout to resolve after 3 seconds if Supabase is stuck
        timeoutId = setTimeout(() => {
          console.warn('Sign out operation timed out after 3 seconds, forcing completion');
          resolve();
        }, 3000);
      });
      
      // Wait for signout or timeout
      await signOutPromise;
      
      // Track user logout with Google Analytics
      trackAuthEvent('logout');
      
      // Force local signout regardless of what happened with Supabase
      forceLocalSignOut();
      
      // Force redirect to home
      router.push('/');
    } catch (err: any) {
      console.error('Error in signOut:', err.message);
      
      // Force local signout even on error to ensure the user can log out
      forceLocalSignOut();
      
      router.push('/');
    } finally {
      // Clear the timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}