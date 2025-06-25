
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Lock } from "lucide-react"
import { DatabaseService } from "@/lib/database"

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const isValidAdmin = await DatabaseService.authenticateAdmin(email, password)
        if (isValidAdmin) {
        // Store admin session in localStorage (in production, use secure tokens)
        const adminData = {
          email,
          loginTime: new Date().toISOString()
        }
        localStorage.setItem('admin_session', JSON.stringify(adminData))
        
        // Also set a cookie for middleware to detect admin session
        document.cookie = `admin_session=${JSON.stringify(adminData)}; path=/; max-age=86400; SameSite=Strict`
        
        router.push('/admin')
      } else {
        setError('Invalid admin credentials')
      }
    } catch (error) {
      setError('Login failed. Please try again.')    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white dark:text-black" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">OSimulate Admin</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="mb-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}          {/* Admin Login Form */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-slate-800">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-red-600" />
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Admin Access</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                Restricted area - Admin credentials required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@osimulate.com"
                    className="mt-1.5 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="pr-10 dark:bg-slate-700 dark:border-gray-600 dark:text-white"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
                </Button>
              </form>
            </CardContent>
          </Card>          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Not an admin?{' '}
              <a href="/auth/login" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium underline">
                User Login
              </a>
            </p>
          </div>

          {/* Security Warning */}
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">Security Notice</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This is a restricted administrative area. All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Admin Dashboard Preview */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>        {/* Admin Dashboard Preview */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full">
          {/* Header */}
          <div className="bg-gray-900 dark:bg-slate-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Admin Dashboard</div>
                  <div className="text-xs text-gray-300 dark:text-gray-400">System Administration</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Analytics</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total Users</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">89%</div>
                <div className="text-xs text-green-600 dark:text-green-400">System Health</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium dark:text-white">User Analytics</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Real-time monitoring</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Live</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium dark:text-white">Algorithm Runs</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Performance metrics</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Active</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium dark:text-white">System Logs</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Security monitoring</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Secure</div>
              </div>
            </div>
          </div></div>
      </div>
    </div>
  )
}
