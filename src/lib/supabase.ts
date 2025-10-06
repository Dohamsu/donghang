import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      travel_plans: {
        Row: {
          id: string;
          title: string;
          start_date: string;
          end_date: string;
          region: string;
          weather_summary: Record<string, unknown> | null;
          confirmed: boolean;
          owner_id: string;
          members: Record<string, unknown>[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          start_date: string;
          end_date: string;
          region: string;
          weather_summary?: Record<string, unknown> | null;
          confirmed?: boolean;
          owner_id: string;
          members?: Record<string, unknown>[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          start_date?: string;
          end_date?: string;
          region?: string;
          weather_summary?: Record<string, unknown> | null;
          confirmed?: boolean;
          owner_id?: string;
          members?: Record<string, unknown>[];
          created_at?: string;
          updated_at?: string;
        };
      };
      places: {
        Row: {
          id: string;
          name: string;
          category: string;
          latitude: number;
          longitude: number;
          description: string | null;
          images: string[];
          address: string | null;
          phone: string | null;
          website: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          latitude: number;
          longitude: number;
          description?: string | null;
          images?: string[];
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          latitude?: number;
          longitude?: number;
          description?: string | null;
          images?: string[];
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          plan_id: string;
          date: string;
          place_id: string | null;
          start_time: string;
          end_time: string;
          eta: number | null;
          order: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          date: string;
          place_id?: string | null;
          start_time: string;
          end_time: string;
          eta?: number | null;
          order: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          date?: string;
          place_id?: string | null;
          start_time?: string;
          end_time?: string;
          eta?: number | null;
          order?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      budget_items: {
        Row: {
          id: string;
          plan_id: string;
          day: string | null;
          place_id: string | null;
          amount: number;
          description: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          day?: string | null;
          place_id?: string | null;
          amount: number;
          description: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          day?: string | null;
          place_id?: string | null;
          amount?: number;
          description?: string;
          category?: string;
          created_at?: string;
        };
      };
      packing_items: {
        Row: {
          id: string;
          plan_id: string;
          text: string;
          image_url: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          text: string;
          image_url?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          text?: string;
          image_url?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          plan_id: string;
          place_id: string | null;
          content: string;
          images: string[];
          written_at: string;
          author_id: string;
          rating: number | null;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          place_id?: string | null;
          content: string;
          images?: string[];
          written_at?: string;
          author_id: string;
          rating?: number | null;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          place_id?: string | null;
          content?: string;
          images?: string[];
          written_at?: string;
          author_id?: string;
          rating?: number | null;
          type?: string;
          created_at?: string;
        };
      };
      temporary_places: {
        Row: {
          id: string;
          plan_id: string;
          place: Record<string, unknown>;
          added_at: string;
          is_recommended: boolean;
        };
        Insert: {
          id?: string;
          plan_id: string;
          place: Record<string, unknown>;
          added_at?: string;
          is_recommended?: boolean;
        };
        Update: {
          id?: string;
          plan_id?: string;
          place?: Record<string, unknown>;
          added_at?: string;
          is_recommended?: boolean;
        };
      };
    };
  };
};
