import { supabase } from './supabase'
import { Database } from '@/types/database.types'

type UserProgress = Database['public']['Tables']['user_progress']['Row']
type StudyStreak = Database['public']['Tables']['study_streaks']['Row']
type ModuleCompletion = Database['public']['Tables']['module_completions']['Row']
type AlgorithmRun = Database['public']['Tables']['algorithm_runs']['Row']

export class DatabaseService {
  // Admin Authentication
  static async authenticateAdmin(email: string, password: string): Promise<boolean> {
    try {
      // First check if it's the default admin
      if (email === 'admin@osimulate.com' && password === 'admin123') {
        return true;
      }
      
      // Check if it's the owner admin
      if (email === 'hdbro125@gmail.com' && password === 'hdbro125@gmail.com') {
        return true;
      }
      
      // Try to authenticate with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error || !data.user) {
        return false;
      }
      
      // Check if user has admin privileges
      const isAdmin = await this.isUserAdmin(email);
      
      // Sign out the user since this is just for admin verification
      await supabase.auth.signOut();
      
      return isAdmin;
    } catch (error) {
      console.error('Admin authentication error:', error);
      return false;
    }
  }

  static async isUserAdmin(email: string): Promise<boolean> {
    // Default admin accounts
    const adminEmails = ['admin@osimulate.com', 'hdbro125@gmail.com'];
    
    if (adminEmails.includes(email)) {
      return true;
    }
    
    // Check database for admin users
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('email', email)
        .single();
        
      if (error) return false;
      
      return data?.is_admin || false;
    } catch (error) {
      return false;
    }
  }

  // User Management
  static async banUser(userId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  }

  static async unbanUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  }

  static async revokeUserAccess(userId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        access_revoked: true,
        access_revoked_at: new Date().toISOString(),
        access_revoked_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  }

  static async restoreUserAccess(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        access_revoked: false,
        access_revoked_at: null,
        access_revoked_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  }

  // Payment and Subscription Management
  static async createSubscription(userId: string, plan: 'monthly' | 'referral', paymentMethod: 'stripe' | 'referral' | 'ads'): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_type: plan,
        payment_method: paymentMethod,
        is_active: true,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })

    if (error) throw error
  }

  static async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateAdProgress(userId: string, adsWatched: number): Promise<void> {
    const { error } = await supabase
      .from('ad_progress')
      .upsert({
        user_id: userId,
        ads_watched: adsWatched,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error

    // If user watched 5 ads, grant free subscription
    if (adsWatched >= 5) {
      await this.createSubscription(userId, 'monthly', 'ads')
    }
  }

  static async getAdProgress(userId: string) {
    const { data, error } = await supabase
      .from('ad_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || { ads_watched: 0 }
  }

  static async validateReferralCoupon(couponCode: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('referral_coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (error) return false
    
    // Check if coupon is not expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false
    }

    return true
  }

  static async redeemReferralCoupon(userId: string, couponCode: string): Promise<void> {
    const isValid = await this.validateReferralCoupon(couponCode)
    if (!isValid) throw new Error('Invalid or expired coupon code')

    // Create subscription
    await this.createSubscription(userId, 'referral', 'referral')

    // Mark coupon as used
    const { error } = await supabase
      .from('referral_coupons')
      .update({
        used_by: userId,
        used_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('code', couponCode)

    if (error) throw error
  }

  // User Progress
  static async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  }

  static async updateProgress(
    userId: string,
    chapterId: string,
    progressPercentage: number,
    completed: boolean = false
  ): Promise<void> {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        chapter_id: chapterId,
        progress_percentage: progressPercentage,
        completed,
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
  }

  static async getChapterProgress(userId: string, chapterId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Study Streaks
  static async getStudyStreak(userId: string): Promise<StudyStreak | null> {
    const { data, error } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateStudyStreak(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const existing = await this.getStudyStreak(userId)

    if (!existing) {
      // Create new streak
      const { error } = await supabase
        .from('study_streaks')
        .insert({
          user_id: userId,
          streak_count: 1,
          last_study_date: today,
        })
      if (error) throw error
    } else {
      const lastStudyDate = new Date(existing.last_study_date)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastStudyDate.getTime()) / (1000 * 3600 * 24))

      let newStreakCount = existing.streak_count

      if (diffDays === 1) {
        // Continue streak
        newStreakCount = existing.streak_count + 1
      } else if (diffDays > 1) {
        // Reset streak
        newStreakCount = 1
      }
      // If diffDays === 0, same day, no change needed

      if (diffDays >= 1) {
        const { error } = await supabase
          .from('study_streaks')
          .update({
            streak_count: newStreakCount,
            last_study_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) throw error
      }
    }
  }

  // User Profile
  static async createOrUpdateProfile(userId: string, profileData: {
    email: string
    full_name: string
    avatar_url: string
  }) {
    try {
      console.log('Creating/updating profile for user:', userId, 'with data:', profileData)
      
      // Use upsert to handle both insert and update in one operation
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: profileData.email,
            full_name: profileData.full_name || '',
            avatar_url: profileData.avatar_url || '',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single()

      // Handle errors
      if (error) {
        console.error('Error upserting profile:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          // Add more detailed error logging
          errorString: JSON.stringify(error, null, 2),
          userId,
          profileData
        })
        
        // Handle permission errors
        if (error.code === '42501' || error.code === '42503') { // Permission denied errors
          throw new Error('Permission denied: You don\'t have the necessary permissions to create or update this profile.')
        }
        
        // Handle constraint errors
        if (error.code === '23505') { // Unique violation
          console.log('Profile already exists, retrying with update...')
          
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({
              email: profileData.email,
              full_name: profileData.full_name || '',
              avatar_url: profileData.avatar_url || '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single()
            
          if (updateError) {
            console.error('Error updating profile after conflict:', {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
              hint: updateError.hint,
              errorString: JSON.stringify(updateError, null, 2)
            })
            throw updateError
          }
          
          console.log('Profile updated successfully after conflict:', updateData)
          return updateData
        }
        
        throw error
      }
      
      console.log('Profile upserted successfully:', data)
      return data
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        code?: string;
        details?: string;
        hint?: string;
        stack?: string;
      };
      
      console.error('Error in createOrUpdateProfile:', {
        message: errorObj?.message || 'Unknown error',
        code: errorObj?.code,
        details: errorObj?.details,
        hint: errorObj?.hint,
        stack: errorObj?.stack,
        // Add full error object serialization
        fullError: JSON.stringify(errorObj, null, 2),
        originalError: error
      })
      
      // If it's a table doesn't exist error, log a more helpful message
      if (errorObj?.code === '42P01') { // 42P01 is undefined_table in PostgreSQL
        console.error('The profiles table does not exist. Please run the database migrations first.')
        throw new Error('Database configuration error: Required tables are missing. Please contact support.')
      }
      
      throw error
    }
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  static async updateUserProfile(userId: string, updates: any) {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  }

  // Module Completions
  static async getModuleCompletions(userId: string): Promise<ModuleCompletion[]> {
    const { data, error } = await supabase
      .from('module_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async markModuleComplete(
    userId: string,
    moduleId: string,
    moduleType: 'notes' | 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement' | 'comparison',
    timeSpent: number,
    score?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('module_completions')
      .insert({
        user_id: userId,
        module_id: moduleId,
        module_type: moduleType,
        completed_at: new Date().toISOString(),
        time_spent: timeSpent,
        score,
      })

    if (error) throw error
  }

  static async getModuleCompletionStats(userId: string) {
    const { data, error } = await supabase
      .from('module_completions')
      .select('module_type, completed_at')
      .eq('user_id', userId)

    if (error) throw error

    const stats = {
      totalCompleted: data?.length || 0,
      byType: {
        'notes': 0,
        'cpu-scheduling': 0,
        'disk-scheduling': 0,
        'page-replacement': 0,
        'comparison': 0,
      } as Record<string, number>,
      recentActivity: data?.slice(0, 5) || [],
    }

    data?.forEach((completion: { module_type: string }) => {
      const moduleType = completion.module_type as keyof typeof stats.byType;
      if (moduleType in stats.byType) {
        stats.byType[moduleType]++;
      }
    })

    return stats
  }

  // Algorithm Runs
  static async saveAlgorithmRun(
    userId: string,
    algorithmType: 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement',
    algorithmName: string,
    inputData: any,
    outputData: any,
    executionTime: number
  ): Promise<void> {
    const { error } = await supabase
      .from('algorithm_runs')
      .insert({
        user_id: userId,
        algorithm_type: algorithmType,
        algorithm_name: algorithmName,
        input_data: inputData,
        output_data: outputData,
        execution_time: executionTime,
        created_at: new Date().toISOString(),
      })

    if (error) throw error
  }

  static async getAlgorithmHistory(userId: string, algorithmType?: string): Promise<AlgorithmRun[]> {
    let query = supabase
      .from('algorithm_runs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (algorithmType) {
      query = query.eq('algorithm_type', algorithmType)
    }

    const { data, error } = await query.limit(50)

    if (error) throw error
    return data || []
  }

  // Admin Analytics Methods
  static async getAllUserAnalytics() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        created_at,
        updated_at,
        is_banned,
        access_revoked,
        banned_at,
        access_revoked_at,
        user_progress (
          progress_percentage,
          completed,
          last_accessed
        ),
        module_completions (
          module_type,
          completed_at,
          time_spent,
          score
        ),
        algorithm_runs (
          algorithm_type,
          algorithm_name,
          execution_time,
          created_at
        ),
        study_streaks (
          streak_count,
          last_study_date
        ),
        user_subscriptions (
          plan_type,
          payment_method,
          is_active,
          expires_at
        )
      `)

    if (error) throw error

    return data?.map(user => {
      const totalModules = user.module_completions?.filter(m => m.completed_at).length || 0
      const totalAlgorithmRuns = user.algorithm_runs?.length || 0
      const totalNotesCreated = 0 // Will be updated when notes table is implemented
      const lastActivity = user.study_streaks?.[0]?.last_study_date || user.updated_at
      const studyStreak = user.study_streaks?.[0]?.streak_count || 0
      const completionPercentage = user.user_progress?.reduce((sum: number, p: any) => sum + p.progress_percentage, 0) / (user.user_progress?.length || 1) || 0
      const favoriteAlgorithm = this.getMostUsedAlgorithm(user.algorithm_runs || [])
      const timeSpentLearning = user.module_completions?.reduce((sum: number, m: any) => sum + (m.time_spent || 0), 0) || 0
      const subscription = user.user_subscriptions?.[0]

      return {
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        is_banned: user.is_banned || false,
        access_revoked: user.access_revoked || false,
        banned_at: user.banned_at,
        access_revoked_at: user.access_revoked_at,
        total_modules_completed: totalModules,
        total_algorithm_runs: totalAlgorithmRuns,
        total_notes_created: totalNotesCreated,
        last_activity: lastActivity,
        study_streak: studyStreak,
        completion_percentage: completionPercentage,
        favorite_algorithm: favoriteAlgorithm,
        time_spent_learning: timeSpentLearning,
        subscription: subscription
      }
    }) || []
  }

  static async getAllAlgorithmRuns(dateRange: string = '7d') {
    const days = parseInt(dateRange.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('algorithm_runs')
      .select(`
        id,
        algorithm_type,
        algorithm_name,
        input_data,
        output_data,
        execution_time,
        created_at,
        profiles!inner (
          email
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((run: any) => ({
      id: run.id,
      user_email: run.profiles?.[0]?.email || '',
      algorithm_type: run.algorithm_type,
      algorithm_name: run.algorithm_name,
      execution_time: run.execution_time,
      created_at: run.created_at,
      input_data: run.input_data,
      output_data: run.output_data
    }))
  }

  static async getAllModuleProgress(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('module_completions')
        .select(`
          module_type,
          time_spent,
          completed_at,
          score,
          profiles!inner (
            email
          )
        `)
        .order('completed_at', { ascending: false })

      if (error) throw error

      return (data || []).map((module: any) => ({
        user_email: module.profiles?.[0]?.email || '',
        module_id: module.module_type,
        module_type: module.module_type,
        completion_percentage: module.score || 0,
        time_spent: module.time_spent || 0,
        completed_at: module.completed_at
      }))
    } catch (error) {
      console.error('Error fetching module progress:', error)
      return []
    }
  }

  static async getAllNotesData(): Promise<any[]> {
    try {
      const { data: studyNotes, error } = await supabase
        .from('study_notes')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Group notes by user and chapter
      const notesMap = new Map<string, any>()
      
      studyNotes?.forEach(note => {
        const key = `${note.profiles?.email}-${note.chapter_id}`
        if (notesMap.has(key)) {
          const existing = notesMap.get(key)
          existing.notes_count += 1
          existing.word_count += note.content?.length || 0
          if (note.updated_at > existing.last_updated) {
            existing.last_updated = note.updated_at
          }
        } else {
          notesMap.set(key, {
            user_email: note.profiles?.email || '',
            chapter_id: note.chapter_id,
            notes_count: 1,
            last_updated: note.updated_at,
            word_count: note.content?.length || 0
          })
        }
      })

      return Array.from(notesMap.values())
    } catch (error) {
      console.error('Error fetching notes data:', error)
      return []
    }
  }

  private static getMostUsedAlgorithm(algorithmRuns: Array<{algorithm_type: string, algorithm_name: string}>): string {
    if (!algorithmRuns?.length) return 'None';
    
    const algorithmCounts = algorithmRuns.reduce<Record<string, number>>((acc, run) => {
      const key = `${run.algorithm_type}.${run.algorithm_name}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const [mostUsed] = Object.entries(algorithmCounts)
      .sort((a, b) => b[1] - a[1])[0] || ['None', 0];
      
    return mostUsed;
  }

  // Admin data fetching methods
  static async getAllUserAnalytics(): Promise<any[]> {
    try {
      // Get all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      // Get profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      if (profilesError) throw profilesError

      // Get user progress data
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
      if (progressError) throw progressError

      // Get algorithm runs
      const { data: algorithmRuns, error: algorithmError } = await supabase
        .from('algorithm_runs')
        .select('*')
      if (algorithmError) throw algorithmError

      // Get module completions
      const { data: moduleCompletions, error: moduleError } = await supabase
        .from('module_completions')
        .select('*')
      if (moduleError) throw moduleError

      // Get study notes
      const { data: studyNotes, error: notesError } = await supabase
        .from('study_notes')
        .select('*')
      if (notesError) throw notesError

      // Combine data for each user
      const userAnalytics = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        const progress = userProgress?.filter(p => p.user_id === user.id) || []
        const runs = algorithmRuns?.filter(r => r.user_id === user.id) || []
        const completions = moduleCompletions?.filter(m => m.user_id === user.id) || []
        const notes = studyNotes?.filter(n => n.user_id === user.id) || []

        return {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || profile?.full_name || '',
          created_at: user.created_at,
          is_banned: profile?.is_banned || false,
          access_revoked: profile?.access_revoked || false,
          banned_at: profile?.banned_at,
          access_revoked_at: profile?.access_revoked_at,
          total_modules_completed: completions.length,
          total_algorithm_runs: runs.length,
          total_notes_created: notes.length,
          last_activity: user.last_sign_in_at || user.created_at,
          study_streak: 0, // Would need streak calculation
          completion_percentage: progress.length > 0 ? 
            progress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / progress.length : 0,
          favorite_algorithm: this.getMostUsedAlgorithm(runs),
          time_spent_learning: progress.reduce((sum, p) => sum + (p.time_spent || 0), 0),
          subscription: null // Would need subscription data
        }
      })

      return userAnalytics
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return []
    }
  }

  static async getAllAlgorithmRuns(dateRange: string = '7d'): Promise<any[]> {
    try {
      let startDate = new Date()
      switch (dateRange) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        default:
          startDate.setDate(startDate.getDate() - 7)
      }

      const { data: algorithmRuns, error } = await supabase
        .from('algorithm_runs')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return algorithmRuns?.map(run => ({
        id: run.id,
        user_email: run.profiles?.email || '',
        algorithm_type: run.algorithm_type,
        algorithm_name: run.algorithm_name,
        execution_time: run.execution_time || 0,
        created_at: run.created_at,
        input_data: run.input_data,
        output_data: run.output_data
      })) || []
    } catch (error) {
      console.error('Error fetching algorithm runs:', error)
      return []
    }
  }

  static async getAllModuleProgress(): Promise<any[]> {
    try {
      const { data: userProgress, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return userProgress?.map(progress => ({
        user_email: progress.profiles?.email || '',
        module_id: progress.module_id,
        module_type: progress.module_type,
        completion_percentage: progress.completion_percentage || 0,
        time_spent: progress.time_spent || 0,
        completed_at: progress.updated_at
      })) || []
    } catch (error) {
      console.error('Error fetching module progress:', error)
      return []
    }
  }

  static async getAllNotesData(): Promise<any[]> {
    try {
      const { data: studyNotes, error } = await supabase
        .from('study_notes')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Group notes by user and chapter
      const notesMap = new Map<string, any>()
      
      studyNotes?.forEach(note => {
        const key = `${note.profiles?.email}-${note.chapter_id}`
        if (notesMap.has(key)) {
          const existing = notesMap.get(key)
          existing.notes_count += 1
          existing.word_count += note.content?.length || 0
          if (note.updated_at > existing.last_updated) {
            existing.last_updated = note.updated_at
          }
        } else {
          notesMap.set(key, {
            user_email: note.profiles?.email || '',
            chapter_id: note.chapter_id,
            notes_count: 1,
            last_updated: note.updated_at,
            word_count: note.content?.length || 0
          })
        }
      })

      return Array.from(notesMap.values())
    } catch (error) {
      console.error('Error fetching notes data:', error)
      return []
    }
  }
}
