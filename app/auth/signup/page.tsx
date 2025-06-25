'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Settings, BarChart3, Users, Link as LinkIcon, Eye, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { trackAuthEvent } from '@/lib/analytics'

export default function SignUpPage() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (session?.user?.email_confirmed_at) {
          setAuthMessage({ type: 'success', message: 'Successfully signed in! Redirecting...' })
          toast.success('Successfully signed in!')
          // No need to track login here as it's already tracked in auth context
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          setAuthMessage({ type: 'success', message: 'Account created successfully! Please check your email for a confirmation link.' })
          toast.success('Account created! Check your email.')
          // Track signup event
          trackAuthEvent('signup')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error)
    
    if (error?.message?.includes('User already registered')) {
      setAuthMessage({ type: 'error', message: 'An account with this email already exists. Please try logging in instead.' })
      toast.error('Account already exists')
    } else if (error?.message?.includes('Password should be')) {
      setAuthMessage({ type: 'error', message: 'Password should be at least 6 characters long.' })
      toast.error('Password too short')
    } else if (error?.message?.includes('Invalid email')) {
      setAuthMessage({ type: 'error', message: 'Please enter a valid email address.' })
      toast.error('Invalid email')
    } else {
      setAuthMessage({ type: 'error', message: error?.message || 'An error occurred during sign up.' })
      toast.error('Sign up failed')
    }
  }
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white dark:text-black" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">OSimulate</span>
            </div>
          </div>

          {/* Auth Messages */}
          {authMessage.type && (
            <Alert className={`mb-6 ${authMessage.type === 'success' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2">
                {authMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <AlertDescription className={authMessage.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  {authMessage.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Auth Form */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Join OSimulate</h2>            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
              Sign up to turn any OS concept into reality — in minutes.
            </p>

            {origin && (
              <div className="space-y-4">
                <Auth
                  supabaseClient={supabase}
                  view="sign_up"
                  appearance={{ 
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#000000',
                          brandAccent: '#333333',
                          inputBackground: 'white',
                          inputBorder: '#e5e7eb',
                          inputBorderHover: '#d1d5db',
                          inputBorderFocus: '#000000',
                          inputText: '#111827',
                          inputLabelText: '#374151',
                          inputPlaceholder: '#9ca3af',
                        },
                      },
                    },
                    className: {
                      container: 'space-y-4',
                      label: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5',
                      button: 'w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium py-2.5 px-4 rounded-lg transition-colors duration-200',
                      input: 'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white',
                      anchor: 'text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium',
                      divider: 'border-gray-200 dark:border-gray-600 my-4',
                      message: 'text-gray-600 dark:text-gray-400 text-sm',
                    },
                  }}
                  providers={['google', 'github']}
                  redirectTo={`${origin}/auth/callback`}
                  theme="light"
                  onlyThirdPartyProviders={false}
                  magicLink={false}
                  showLinks={true}
                  additionalData={{
                    full_name: '',
                  }}
                />
              </div>
            )}
          </div>          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium underline">
                Log in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing up, you agree to our{' '}
              <a href="#" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline">Privacy Policy</a>{' '}
              and <a href="#" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline">Terms of Service</a>.
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 OSimulate Technologies, Inc.
            </p>
          </div>

          {/* Partner logos */}
          <div className="mt-8 flex justify-center items-center gap-6 opacity-40">
            <div className="text-xs font-semibold text-gray-400">perplexity</div>
            <div className="text-xs font-semibold text-gray-400">▲ Prisma</div>
            <div className="text-xs font-semibold text-gray-400">𝕏 tinybird</div>
            <div className="text-xs font-semibold text-gray-400">◇ hashnode</div>
          </div>
        </div>
      </div>

      {/* Right side - Dashboard Preview */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Main dashboard mockup */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">OSimulate</div>
                  <div className="text-xs text-gray-500">Learning Platform</div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-gray-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Dashboard</span>
                <Button size="sm" variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex">
            <div className="w-48 bg-gray-50 border-r border-gray-200 py-4">
              <div className="px-4 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700">
                  <LinkIcon className="w-4 h-4" />
                  Modules
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
                  <Brain className="w-4 h-4" />
                  Simulator
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500">
                  <Settings className="w-4 h-4" />
                  Settings
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search modules..." 
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Process Management
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Memory Management
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">OS</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Operating System Concepts</div>
                    <div className="text-xs text-gray-500">Introduction to OS fundamentals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small floating card */}
        <div className="absolute bottom-8 right-8 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Quick Access</div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Algorithm Visualizer</div>
            <div className="text-sm font-medium">Progress Tracker</div>
            <div className="text-sm font-medium">Study Notes</div>
          </div>
        </div>
      </div>
    </div>
  )
}
