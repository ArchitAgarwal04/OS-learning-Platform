
import { DatabaseService } from '@/lib/database'

export class LearningTracker {
  private static startTime: number | null = null
  private static userId: string | null = null

  static setUserId(userId: string) {
    this.userId = userId
  }

  static startModule() {
    this.startTime = Date.now()
  }

  static async completeModule(
    moduleId: string,
    moduleType: 'notes' | 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement' | 'comparison',
    score?: number
  ) {
    if (!this.userId || !this.startTime) return

    const timeSpent = Date.now() - this.startTime
    
    try {
      await DatabaseService.markModuleComplete(
        this.userId,
        moduleId,
        moduleType,
        timeSpent,
        score
      )
      
      this.startTime = null
    } catch (error) {
      console.error('Error completing module:', error)
    }
  }

  static async trackAlgorithmRun(
    algorithmType: 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement',
    algorithmName: string,
    inputData: any,
    outputData: any,
    executionTime: number
  ) {
    if (!this.userId) return

    try {
      await DatabaseService.saveAlgorithmRun(
        this.userId,
        algorithmType,
        algorithmName,
        inputData,
        outputData,
        executionTime
      )
    } catch (error) {
      console.error('Error tracking algorithm run:', error)
    }
  }

  static async getLearningHistory() {
    if (!this.userId) return null

    try {
      const [moduleStats, algorithmHistory] = await Promise.all([
        DatabaseService.getModuleCompletionStats(this.userId),
        DatabaseService.getAlgorithmHistory(this.userId)
      ])

      return {
        modules: moduleStats,
        algorithms: algorithmHistory
      }
    } catch (error) {
      console.error('Error getting learning history:', error)
      return null
    }
  }
}
