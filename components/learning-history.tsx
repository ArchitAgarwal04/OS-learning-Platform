
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DatabaseService } from '@/lib/database'
import { useAuth } from '@/contexts/auth-context'
import { Clock, BookOpen, Play, Award, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LearningStats {
  modules: {
    totalCompleted: number
    byType: {
      notes: number
      'cpu-scheduling': number
      'disk-scheduling': number
      'page-replacement': number
      comparison: number
    }
    recentActivity: any[]
  }
  algorithms: {
    totalRuns: number
    averageExecutionTime: number
    mostUsedAlgorithm: string
    byType: {
      'cpu-scheduling': number
      'disk-scheduling': number
      'page-replacement': number
    }
    recentRuns: any[]
  }
}

export default function LearningHistory() {
  const { user } = useAuth()
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  const loadStats = async () => {
    try {
      const [moduleStats, algorithmStats] = await Promise.all([
        DatabaseService.getModuleCompletionStats(user!.id),
        DatabaseService.getAlgorithmStats(user!.id)
      ])

      setStats({
        modules: moduleStats,
        algorithms: algorithmStats
      })
    } catch (error) {
      console.error('Error loading learning stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const moduleTypeLabels = {
    notes: 'Theory Notes',
    'cpu-scheduling': 'CPU Scheduling',
    'disk-scheduling': 'Disk Scheduling',
    'page-replacement': 'Page Replacement',
    comparison: 'Algorithm Comparison'
  }

  const algorithmTypeLabels = {
    'cpu-scheduling': 'CPU Scheduling',
    'disk-scheduling': 'Disk Scheduling',
    'page-replacement': 'Page Replacement'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Learning History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.modules.totalCompleted}</div>
                <div className="text-sm text-muted-foreground">Modules Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.algorithms.totalRuns}</div>
                <div className="text-sm text-muted-foreground">Algorithm Runs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.algorithms.averageExecutionTime.toFixed(1)}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Execution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.algorithms.mostUsedAlgorithm || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Favorite Algorithm</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(stats.modules.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{moduleTypeLabels[type as keyof typeof moduleTypeLabels]}</span>
                  </div>
                  <Badge variant="secondary">{count} completed</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="algorithms" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(stats.algorithms.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>{algorithmTypeLabels[type as keyof typeof algorithmTypeLabels]}</span>
                  </div>
                  <Badge variant="secondary">{count} runs</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Recent Module Completions
                </h4>
                <div className="space-y-2">
                  {stats.modules.recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{moduleTypeLabels[activity.module_type as keyof typeof moduleTypeLabels]}</span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                  {stats.modules.recentActivity.length === 0 && (
                    <p className="text-muted-foreground text-sm">No completed modules yet</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Recent Algorithm Runs
                </h4>
                <div className="space-y-2">
                  {stats.algorithms.recentRuns.slice(0, 3).map((run, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{run.algorithm_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{run.execution_time}ms</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.algorithms.recentRuns.length === 0 && (
                    <p className="text-muted-foreground text-sm">No algorithm runs yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
