export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BetOutcomeStatusEnum = 'rate' | 'good_result' | 'perfect_score'

export type MatchBetFormatEnum = 'regulation_1x2' | 'knockout_decider'

export type MatchTournamentPhaseEnum =
  | 'group'
  | 'round_of_16'
  | 'round_of_8'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      bets: {
        Row: {
          bet_playoff_winner: string | null
          bet_team_a: number | null
          bet_team_b: number | null
          competition_id: string | null
          id: string
          match_id: string | null
          outcome_status: BetOutcomeStatusEnum | null
          points_won: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bet_playoff_winner?: string | null
          bet_team_a?: number | null
          bet_team_b?: number | null
          competition_id?: string | null
          id: string
          match_id?: string | null
          outcome_status?: BetOutcomeStatusEnum | null
          points_won?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bet_playoff_winner?: string | null
          bet_team_a?: number | null
          bet_team_b?: number | null
          competition_id?: string | null
          id?: string
          match_id?: string | null
          outcome_status?: BetOutcomeStatusEnum | null
          points_won?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bets_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bets_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches_with_teams'
            referencedColumns: ['id']
          },
        ]
      }
      competition_profiles: {
        Row: {
          competition_id: string
          final_winner_points: number
          user_id: string
          score: number
          winner_team: string | null
        }
        Insert: {
          competition_id: string
          final_winner_points?: number
          user_id: string
          score?: number
          winner_team?: string | null
        }
        Update: {
          competition_id?: string
          final_winner_points?: number
          user_id?: string
          score?: number
          winner_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'competition_profiles_competition_id_fkey'
            columns: ['competition_id']
            isOneToOne: false
            referencedRelation: 'competitions'
            referencedColumns: ['id']
          },
        ]
      }
      competitions: {
        Row: {
          final_winner_team: string | null
          id: string
          launch_bet: string | null
          name: string
          active: boolean
          start_date: string | null
        }
        Insert: {
          final_winner_team?: string | null
          id?: string
          launch_bet?: string | null
          name?: string
          active?: boolean
          start_date?: string | null
        }
        Update: {
          final_winner_team?: string | null
          id?: string
          launch_bet?: string | null
          name?: string
          active?: boolean
          start_date?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          status: string
          joined_at: string | null
        }
        Insert: {
          group_id: string
          user_id: string
          status?: string
          joined_at?: string | null
        }
        Update: {
          group_id?: string
          user_id?: string
          status?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
        ]
      }
      group_apply: {
        Row: {
          group_id: string | null
          id: string
          status: string | null
          user_id: string | null
          validated_at: string | null
        }
        Insert: {
          group_id?: string | null
          id: string
          status?: string | null
          user_id?: string | null
          validated_at?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'group_apply_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          join_key: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          join_key?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          join_key?: string | null
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          api_id: string | null
          bet_format: MatchBetFormatEnum
          city: string | null
          competition_id: string | null
          date_time: string | null
          finished: boolean | null
          id: string
          odds_a: number | null
          odds_b: number | null
          odds_draw: number | null
          playoff_winner: string | null
          pre_match_reminder_sent_at: string | null
          score_a: number | null
          score_b: number | null
          score_checked_at: string | null
          score_payload: Json | null
          score_provider: string | null
          streaming: string | null
          team_a: string | null
          team_b: string | null
          tournament_phase: MatchTournamentPhaseEnum
          visible_to_users: boolean | null
        }
        Insert: {
          api_id?: string | null
          bet_format?: MatchBetFormatEnum
          city?: string | null
          competition_id?: string | null
          date_time?: string | null
          finished?: boolean | null
          id: string
          odds_a?: number | null
          odds_b?: number | null
          odds_draw?: number | null
          playoff_winner?: string | null
          pre_match_reminder_sent_at?: string | null
          score_a?: number | null
          score_b?: number | null
          score_checked_at?: string | null
          score_payload?: Json | null
          score_provider?: string | null
          streaming?: string | null
          team_a?: string | null
          team_b?: string | null
          tournament_phase?: MatchTournamentPhaseEnum
          visible_to_users?: boolean | null
        }
        Update: {
          api_id?: string | null
          bet_format?: MatchBetFormatEnum
          city?: string | null
          competition_id?: string | null
          date_time?: string | null
          finished?: boolean | null
          id?: string
          odds_a?: number | null
          odds_b?: number | null
          odds_draw?: number | null
          playoff_winner?: string | null
          pre_match_reminder_sent_at?: string | null
          score_a?: number | null
          score_b?: number | null
          score_checked_at?: string | null
          score_payload?: Json | null
          score_provider?: string | null
          streaming?: string | null
          team_a?: string | null
          team_b?: string | null
          tournament_phase?: MatchTournamentPhaseEnum
          visible_to_users?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'matches_team_a_fkey'
            columns: ['team_a']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_team_b_fkey'
            columns: ['team_b']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          email: string | null
          id: string
          last_connection: string | null
          nb_connections: number | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          last_connection?: string | null
          nb_connections?: number | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          last_connection?: string | null
          nb_connections?: number | null
          role?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          code: string
          competition_id: string | null
          elimination: boolean | null
          group_name: string | null
          id: string
          name: string
          unveiled: boolean | null
          win_odd: number | null
        }
        Insert: {
          code: string
          competition_id?: string | null
          elimination?: boolean | null
          group_name?: string | null
          id: string
          name: string
          unveiled?: boolean | null
          win_odd?: number | null
        }
        Update: {
          code?: string
          competition_id?: string | null
          elimination?: boolean | null
          group_name?: string | null
          id?: string
          name?: string
          unveiled?: boolean | null
          win_odd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'teams_competition_id_fkey'
            columns: ['competition_id']
            isOneToOne: false
            referencedRelation: 'competitions'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      bets_with_profiles: {
        Row: {
          bet_team_a: number | null
          bet_team_b: number | null
          id: string | null
          match_id: string | null
          outcome_status: BetOutcomeStatusEnum | null
          points_won: number | null
          updated_at: string | null
          user_avatar_url: string | null
          user_display_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bets_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bets_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches_with_teams'
            referencedColumns: ['id']
          },
        ]
      }
      matches_with_teams: {
        Row: {
          api_id: string | null
          bet_format: MatchBetFormatEnum | null
          city: string | null
          competition_id: string | null
          date_time: string | null
          finished: boolean | null
          id: string | null
          odds_a: number | null
          odds_b: number | null
          odds_draw: number | null
          playoff_winner: string | null
          pre_match_reminder_sent_at: string | null
          score_a: number | null
          score_b: number | null
          streaming: string | null
          team_a: string | null
          team_a_code: string | null
          team_a_name: string | null
          team_b: string | null
          team_b_code: string | null
          team_b_name: string | null
          group_name: string | null
          tournament_phase: MatchTournamentPhaseEnum | null
          visible_to_users: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'matches_team_a_fkey'
            columns: ['team_a']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_team_b_fkey'
            columns: ['team_b']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      ranking: {
        Row: {
          competition_id: string | null
          avatar_url: string | null
          display_name: string | null
          id: string | null
          rank: number | null
          score: number | null
          winner_team: string | null
          winner_team_code: string | null
          winner_team_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_email_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      validate_group_apply: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: undefined
      }
      admin_recalculate_all_scores: {
        Args: Record<string, never>
        Returns: Json
      }
      admin_recalculate_all_odds: {
        Args: Record<string, never>
        Returns: Json
      }
      admin_delete_user: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      bet_outcome_status: BetOutcomeStatusEnum
      match_bet_format: MatchBetFormatEnum
      match_tournament_phase: MatchTournamentPhaseEnum
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  T extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends T extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[T['schema']]['Tables'] &
        DatabaseWithoutInternals[T['schema']]['Views'])
    : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[T['schema']]['Tables'] &
      DatabaseWithoutInternals[T['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : T extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[T] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  T extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends T extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[T['schema']]['Tables']
    : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[T['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : T extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][T] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  T extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends T extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[T['schema']]['Tables']
    : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[T['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : T extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][T] extends { Update: infer U }
      ? U
      : never
    : never
