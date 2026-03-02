export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          company_name: string;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Update: {
          company_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      assessment_responses: {
        Row: {
          id: string;
          user_id: string;
          responses: Json;
          score: number;
          breakdown: Json | null;
          pdf_generated: boolean;
          pdf_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          responses: Json;
          score: number;
          breakdown?: Json | null;
          pdf_generated?: boolean;
          pdf_path?: string | null;
          created_at?: string;
        };
        Update: {
          responses?: Json;
          score?: number;
          breakdown?: Json | null;
          pdf_generated?: boolean;
          pdf_path?: string | null;
        };
        Relationships: [];
      };
      pending_assessments: {
        Row: {
          id: string;
          session_token_hash: string;
          responses: Json;
          score: number;
          breakdown: Json | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          session_token_hash: string;
          responses: Json;
          score: number;
          breakdown?: Json | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          responses?: Json;
          score?: number;
          breakdown?: Json | null;
          expires_at?: string;
        };
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          contract_path: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          contract_path: string;
          uploaded_at?: string;
        };
        Update: {
          file_name?: string;
          contract_path?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_scores: {
        Row: {
          id: string;
          company_name: string;
          role: Database["public"]["Enums"]["user_role"];
          score: number | null;
          assessment_date: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      user_scores_with_email: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string;
          company_name: string;
          role: Database["public"]["Enums"]["user_role"];
          score: number | null;
          assessment_date: string | null;
        }[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "user" | "admin";
    };
  };
};
