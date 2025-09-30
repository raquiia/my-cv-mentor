export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adaptations: {
        Row: {
          adapted_resume_id: string | null
          created_at: string
          credits_used: number | null
          gap_analysis: Json | null
          id: string
          job_post_id: string
          keyword_coverage: Json | null
          resume_id: string
          suggestions: string[] | null
          user_id: string
        }
        Insert: {
          adapted_resume_id?: string | null
          created_at?: string
          credits_used?: number | null
          gap_analysis?: Json | null
          id?: string
          job_post_id: string
          keyword_coverage?: Json | null
          resume_id: string
          suggestions?: string[] | null
          user_id: string
        }
        Update: {
          adapted_resume_id?: string | null
          created_at?: string
          credits_used?: number | null
          gap_analysis?: Json | null
          id?: string
          job_post_id?: string
          keyword_coverage?: Json | null
          resume_id?: string
          suggestions?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adaptations_adapted_resume_id_fkey"
            columns: ["adapted_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptations_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptations_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_used: number | null
          duration_minutes: number | null
          id: string
          mode: Database["public"]["Enums"]["coach_mode"]
          next_steps: string[] | null
          summary: string | null
          transcript: Json
          turn_count: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          duration_minutes?: number | null
          id?: string
          mode: Database["public"]["Enums"]["coach_mode"]
          next_steps?: string[] | null
          summary?: string | null
          transcript: Json
          turn_count?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          duration_minutes?: number | null
          id?: string
          mode?: Database["public"]["Enums"]["coach_mode"]
          next_steps?: string[] | null
          summary?: string | null
          transcript?: Json
          turn_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          metadata: Json | null
          user_id: string
          version: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          metadata?: Json | null
          user_id: string
          version: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          metadata?: Json | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          feature: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          feature?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          feature?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          actual_duration_seconds: number | null
          audio_replay_url: string | null
          badges_earned: string[] | null
          completed_at: string | null
          created_at: string
          credits_used: number | null
          difficulty: Database["public"]["Enums"]["interview_difficulty"] | null
          duration_minutes: number | null
          id: string
          job_title: string
          overall_score: number | null
          scenario: string | null
          score_breakdown: Json | null
          transcript: Json | null
          user_id: string
        }
        Insert: {
          actual_duration_seconds?: number | null
          audio_replay_url?: string | null
          badges_earned?: string[] | null
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          difficulty?:
            | Database["public"]["Enums"]["interview_difficulty"]
            | null
          duration_minutes?: number | null
          id?: string
          job_title: string
          overall_score?: number | null
          scenario?: string | null
          score_breakdown?: Json | null
          transcript?: Json | null
          user_id: string
        }
        Update: {
          actual_duration_seconds?: number | null
          audio_replay_url?: string | null
          badges_earned?: string[] | null
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          difficulty?:
            | Database["public"]["Enums"]["interview_difficulty"]
            | null
          duration_minutes?: number | null
          id?: string
          job_title?: string
          overall_score?: number | null
          scenario?: string | null
          score_breakdown?: Json | null
          transcript?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          company: string | null
          created_at: string
          id: string
          keywords: string[] | null
          parsed_json: Json | null
          raw_text: string
          required_skills: string[] | null
          seniority_level: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          parsed_json?: Json | null
          raw_text: string
          required_skills?: string[] | null
          seniority_level?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          parsed_json?: Json | null
          raw_text?: string
          required_skills?: string[] | null
          seniority_level?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          headline: string | null
          id: string
          languages: string[] | null
          linkedin_url: string | null
          locale: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          skills: string[] | null
          summary: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          headline?: string | null
          id: string
          languages?: string[] | null
          linkedin_url?: string | null
          locale?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          summary?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          languages?: string[] | null
          linkedin_url?: string | null
          locale?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          summary?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string
          credits_purchased: number
          currency: string | null
          id: string
          invoice_url: string | null
          pack_name: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          created_at?: string
          credits_purchased: number
          currency?: string | null
          id?: string
          invoice_url?: string | null
          pack_name: string
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string
          credits_purchased?: number
          currency?: string | null
          id?: string
          invoice_url?: string | null
          pack_name?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_designs: {
        Row: {
          ai_generation_cost: number | null
          ats_friendly: boolean | null
          created_at: string
          description: string | null
          design_tokens: Json
          id: string
          is_ai_generated: boolean | null
          is_premium: boolean | null
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          ai_generation_cost?: number | null
          ats_friendly?: boolean | null
          created_at?: string
          description?: string | null
          design_tokens: Json
          id?: string
          is_ai_generated?: boolean | null
          is_premium?: boolean | null
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          ai_generation_cost?: number | null
          ats_friendly?: boolean | null
          created_at?: string
          description?: string | null
          design_tokens?: Json
          id?: string
          is_ai_generated?: boolean | null
          is_premium?: boolean | null
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content_json: Json
          created_at: string
          design_id: string | null
          docx_url: string | null
          id: string
          is_current: boolean | null
          pdf_url: string | null
          share_expires_at: string | null
          share_token: string | null
          title: string
          updated_at: string
          user_id: string
          version_number: number | null
        }
        Insert: {
          content_json: Json
          created_at?: string
          design_id?: string | null
          docx_url?: string | null
          id?: string
          is_current?: boolean | null
          pdf_url?: string | null
          share_expires_at?: string | null
          share_token?: string | null
          title: string
          updated_at?: string
          user_id: string
          version_number?: number | null
        }
        Update: {
          content_json?: Json
          created_at?: string
          design_id?: string | null
          docx_url?: string | null
          id?: string
          is_current?: boolean | null
          pdf_url?: string | null
          share_expires_at?: string | null
          share_token?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "resume_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string
          total_purchased: number | null
          total_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          _amount: number
          _reference_id?: string
          _transaction_type?: Database["public"]["Enums"]["credit_transaction_type"]
          _user_id: string
        }
        Returns: boolean
      }
      deduct_credits: {
        Args: {
          _amount: number
          _feature: string
          _reference_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      coach_mode: "text" | "vocal"
      credit_transaction_type: "purchase" | "usage" | "refund" | "bonus"
      interview_difficulty: "easy" | "standard" | "hard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      coach_mode: ["text", "vocal"],
      credit_transaction_type: ["purchase", "usage", "refund", "bonus"],
      interview_difficulty: ["easy", "standard", "hard"],
    },
  },
} as const
