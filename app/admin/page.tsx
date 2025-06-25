
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Activity,
  BarChart3,
  FileText,
  Play,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Ban,
  UserX,
  Shield,
  DollarSign,
  CreditCard,
  Gift,
  Video,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DatabaseService } from "@/lib/database"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface UserAnalytics {
  user_id: string
  email: string
  full_name: string
  created_at: string
  is_banned: boolean
  access_revoked: boolean
  banned_at: string | null
  access_revoked_at: string | null
  total_modules_completed: number
  total_algorithm_runs: number
  total_notes_created: number
  last_activity: string
  study_streak: number
  completion_percentage: number
  favorite_algorithm: string
  time_spent_learning: number
  subscription: any
}

interface AlgorithmRun {
  id: string
  user_email: string
  algorithm_type: string
  algorithm_name: string
  execution_time: number
  created_at: string
  input_data: any
  output_data: any
}

interface ModuleProgress {
  user_email: string
  module_id: string
  module_type: string
  completion_percentage: number
  time_spent: number
  completed_at: string
}

interface NotesData {
  user_email: string
  chapter_id: string
  notes_count: number
  last_updated: string
  word_count: number
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([])
  const [algorithmRuns, setAlgorithmRuns] = useState<AlgorithmRun[]>([])
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [notesData, setNotesData] = useState<NotesData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('7d')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminSession, setAdminSession] = useState<any>(null)

  // Check admin session
  useEffect(() => {
    const session = localStorage.getItem('admin_session')
    if (!session) {
      router.push('/admin/login')
      return
    }
    
    try {
      const parsed = JSON.parse(session)
      setAdminSession(parsed)
    } catch {
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    if (adminSession) {
      loadAdminData()
    }
  }, [adminSession])

  const loadAdminData = async () => {
    try {
      setLoadingData(true)
      const [analytics, algorithms, modules, notes] = await Promise.all([
        DatabaseService.getAllUserAnalytics(),
        DatabaseService.getAllAlgorithmRuns(dateRange),
        DatabaseService.getAllModuleProgress(),
        DatabaseService.getAllNotesData()
      ])

      setUserAnalytics(analytics)
      setAlgorithmRuns(algorithms)
      setModuleProgress(modules)
      setNotesData(notes)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'revoke' | 'restore') => {
    setActionLoading(userId)
    try {
      switch (action) {
        case 'ban':
          await DatabaseService.banUser(userId, user?.id || '')
          toast.success('User banned successfully')
          break
        case 'unban':
          await DatabaseService.unbanUser(userId)
          toast.success('User unbanned successfully')
          break
        case 'revoke':
          await DatabaseService.revokeUserAccess(userId, user?.id || '')
          toast.success('User access revoked successfully')
          break
        case 'restore':
          await DatabaseService.restoreUserAccess(userId)
          toast.success('User access restored successfully')
          break
      }
      await loadAdminData()
    } catch (error) {
      toast.error(`Failed to ${action} user`)
    } finally {
      setActionLoading(null)
    }
  }
  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    // Also clear the admin session cookie
    document.cookie = 'admin_session=; path=/; max-age=0; SameSite=Strict'
    router.push('/admin/login')
  }

  const filteredUsers = userAnalytics.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUsers = userAnalytics.length
  const activeUsers = userAnalytics.filter(u => 
    new Date(u.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length
  const bannedUsers = userAnalytics.filter(u => u.is_banned).length
  const subscribedUsers = userAnalytics.filter(u => u.subscription?.is_active).length
  const totalAlgorithmRuns = algorithmRuns.length
  const avgCompletionRate = userAnalytics.reduce((sum, u) => sum + u.completion_percentage, 0) / totalUsers || 0

  const exportData = () => {
    const csvData = userAnalytics.map(user => ({
      Email: user.email,
      Name: user.full_name,
      'Modules Completed': user.total_modules_completed,
      'Algorithm Runs': user.total_algorithm_runs,
      'Notes Created': user.total_notes_created,
      'Study Streak': user.study_streak,
      'Completion %': user.completion_percentage,
      'Time Spent (mins)': Math.round(user.time_spent_learning / 60000),      'Is Banned': user.is_banned ? 'Yes' : 'No',
      'Access Revoked': user.access_revoked ? 'Yes' : 'No',
      'Subscription': user.subscription?.is_active ? user.subscription.plan_type : 'None'
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading admin dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (!adminSession) {
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Monitor platform analytics and manage users</p>
            <Badge variant="outline" className="mt-2 border-green-600 text-green-600 bg-green-50 dark:bg-green-950 dark:border-green-400 dark:text-green-400">
              Logged in as: {adminSession.email}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
              Logout
            </Button>
          </div>
        </motion.div>        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activeUsers} active this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{subscribedUsers}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Active subscribers
              </p>
            </CardContent>
          </Card>          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Algorithm Runs</CardTitle>
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAlgorithmRuns}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Last {dateRange}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{bannedUsers}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Requires attention
              </p>
            </CardContent>
          </Card>          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgCompletionRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Course progress
              </p>
            </CardContent>
          </Card>
        </motion.div>        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
              <TabsTrigger value="users" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400">Users</TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400">Payments</TabsTrigger>
              <TabsTrigger value="algorithms" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400">Algorithms</TabsTrigger>
              <TabsTrigger value="modules" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400">Modules</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400">Analytics</TabsTrigger>
            </TabsList>            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">User Management</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-64 bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="text-gray-700 dark:text-gray-300">User</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Progress</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Subscription</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Last Active</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.user_id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                          <TableCell>
                            <div>
                              <div className="font-medium text-white">{user.full_name || 'Unknown'}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.is_banned ? (
                                <Badge variant="destructive" className="w-fit">
                                  <Ban className="h-3 w-3 mr-1" />
                                  Banned
                                </Badge>
                              ) : user.access_revoked ? (
                                <Badge variant="secondary" className="w-fit">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Access Revoked
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="w-fit border-green-400 text-green-400">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={user.completion_percentage} className="w-20" />
                              <span className="text-xs text-gray-400">
                                {user.completion_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.subscription?.is_active ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-400">
                                {user.subscription.plan_type}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-400 text-gray-400">
                                Free
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-300">
                              {new Date(user.last_activity).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!user.is_banned ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUserAction(user.user_id, 'ban')}
                                  disabled={actionLoading === user.user_id}
                                  className="h-8"
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(user.user_id, 'unban')}
                                  disabled={actionLoading === user.user_id}
                                  className="h-8 border-green-400 text-green-400 hover:bg-green-400/10"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                              {!user.access_revoked ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(user.user_id, 'revoke')}
                                  disabled={actionLoading === user.user_id}
                                  className="h-8 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                                >
                                  <UserX className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserAction(user.user_id, 'restore')}
                                  disabled={actionLoading === user.user_id}
                                  className="h-8 border-blue-400 text-blue-400 hover:bg-blue-400/10"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedUser(user.user_id)}
                                className="h-8 text-gray-400 hover:text-white"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      Stripe Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {userAnalytics.filter(u => u.subscription?.payment_method === 'stripe').length}
                    </div>
                    <p className="text-sm text-gray-300">Active Stripe subscriptions</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gift className="h-5 w-5 text-purple-400" />
                      Referral Coupons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {userAnalytics.filter(u => u.subscription?.payment_method === 'referral').length}
                    </div>
                    <p className="text-sm text-gray-300">Referral redemptions</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-400" />
                      Ad Completions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {userAnalytics.filter(u => u.subscription?.payment_method === 'ads').length}
                    </div>
                    <p className="text-sm text-gray-300">Ad-based subscriptions</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Payment Analytics</CardTitle>
                  <CardDescription className="text-gray-300">Track subscription methods and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Plan</TableHead>
                        <TableHead className="text-gray-300">Payment Method</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userAnalytics.filter(u => u.subscription?.is_active).map((user) => (
                        <TableRow key={user.user_id} className="border-white/20">
                          <TableCell className="text-white">{user.email}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-400 border-green-400">
                              {user.subscription.plan_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-blue-400 text-blue-400">
                              {user.subscription.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-400 border-green-400">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(user.subscription.expires_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Algorithms Tab - Keep existing content but with improved styling */}
            <TabsContent value="algorithms" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Algorithm Execution Analytics</CardTitle>
                  <CardDescription className="text-gray-300">Monitor algorithm usage and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Algorithm</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Execution Time</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {algorithmRuns.slice(0, 50).map((run) => (
                        <TableRow key={run.id} className="border-white/20">
                          <TableCell className="text-white">{run.user_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-blue-400 text-blue-400">{run.algorithm_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-400">{run.algorithm_type}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{run.execution_time}ms</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(run.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modules Tab - Keep existing content but with improved styling */}
            <TabsContent value="modules" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Module Progress</CardTitle>
                  <CardDescription className="text-gray-300">Track completion rates across different modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Module</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Progress</TableHead>
                        <TableHead className="text-gray-300">Time Spent</TableHead>
                        <TableHead className="text-gray-300">Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {moduleProgress.slice(0, 50).map((module, index) => (
                        <TableRow key={index} className="border-white/20">
                          <TableCell className="text-white">{module.user_email}</TableCell>
                          <TableCell className="text-gray-300">{module.module_id}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-400">{module.module_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Progress value={module.completion_percentage} className="w-20" />
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {Math.round(module.time_spent / 60000)}m
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {module.completed_at && new Date(module.completed_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Revenue (Monthly)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ${userAnalytics.filter(u => u.subscription?.payment_method === 'stripe').length * 10}
                    </div>
                    <p className="text-xs text-gray-300">From Stripe payments</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {((subscribedUsers / totalUsers) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-300">Free to paid conversion</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">2.1%</div>
                    <p className="text-xs text-gray-300">Monthly churn</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Avg Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">24m</div>
                    <p className="text-xs text-gray-300">Average study time</p>
                  </CardContent>
                </Card>
              </div>              <Alert className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Platform performing well with {((activeUsers / totalUsers) * 100).toFixed(1)}% weekly active users
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
