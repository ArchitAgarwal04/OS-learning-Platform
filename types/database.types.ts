export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          progress_percentage: number
          completed: boolean
          last_accessed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: string
          progress_percentage?: number
          completed?: boolean
          last_accessed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          progress_percentage?: number
          completed?: boolean
          last_accessed?: string
          created_at?: string
          updated_at?: string
        }
      }
      study_streaks: {
        Row: {
          id: string
          user_id: string
          streak_count: number
          last_study_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_count?: number
          last_study_date: string
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_count?: number
          last_study_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      module_completions: {
        Row: {
          id: string
          user_id: string
          module_id: string
          module_type: 'notes' | 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement' | 'comparison'
          completed_at: string
          time_spent: number
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          module_type: 'notes' | 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement' | 'comparison'
          completed_at?: string
          time_spent?: number
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          module_type?: 'notes' | 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement' | 'comparison'
          completed_at?: string
          time_spent?: number
          score?: number | null
          created_at?: string
        }
      }
      algorithm_runs: {
        Row: {
          id: string
          user_id: string
          algorithm_type: 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement'
          algorithm_name: string
          input_data: any
          output_data: any
          execution_time: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          algorithm_type: 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement'
          algorithm_name: string
          input_data: any
          output_data: any
          execution_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          algorithm_type?: 'cpu-scheduling' | 'disk-scheduling' | 'page-replacement'
          algorithm_name?: string
          input_data?: any
          output_data?: any
          execution_time?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}