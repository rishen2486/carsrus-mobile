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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attractions: {
        Row: {
          country: string | null
          created_at: string
          details: string | null
          hours: number | null
          id: string
          image_url: string | null
          name: string
          photos: string[] | null
          region: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          details?: string | null
          hours?: number | null
          id?: string
          image_url?: string | null
          name: string
          photos?: string[] | null
          region?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          details?: string | null
          hours?: number | null
          id?: string
          image_url?: string | null
          name?: string
          photos?: string[] | null
          region?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string | null
          car_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          dropoff_location: string
          end_date: string
          id: string
          item_id: string | null
          item_type: string | null
          payment_status: string | null
          pickup_location: string
          start_date: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date?: string | null
          car_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          dropoff_location: string
          end_date: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          payment_status?: string | null
          pickup_location: string
          start_date: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string | null
          car_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          dropoff_location?: string
          end_date?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          payment_status?: string | null
          pickup_location?: string
          start_date?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_availability: {
        Row: {
          booking_id: string | null
          car_id: string | null
          created_at: string | null
          end_date: string
          google_event_id: string | null
          id: string
          start_date: string
        }
        Insert: {
          booking_id?: string | null
          car_id?: string | null
          created_at?: string | null
          end_date: string
          google_event_id?: string | null
          id?: string
          start_date: string
        }
        Update: {
          booking_id?: string | null
          car_id?: string | null
          created_at?: string | null
          end_date?: string
          google_event_id?: string | null
          id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_availability_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_availability_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          available: boolean | null
          brand: string | null
          country: string | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          image_url: string | null
          large_bags: number | null
          mileage: string | null
          name: string
          photos: string[] | null
          price_per_day: number
          price_per_km: number | null
          price_publish: number | null
          seats: number | null
          small_bags: number | null
          transmission: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available?: boolean | null
          brand?: string | null
          country?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          large_bags?: number | null
          mileage?: string | null
          name: string
          photos?: string[] | null
          price_per_day: number
          price_per_km?: number | null
          price_publish?: number | null
          seats?: number | null
          small_bags?: number | null
          transmission?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available?: boolean | null
          brand?: string | null
          country?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          large_bags?: number | null
          mileage?: string | null
          name?: string
          photos?: string[] | null
          price_per_day?: number
          price_per_km?: number | null
          price_publish?: number | null
          seats?: number | null
          small_bags?: number | null
          transmission?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Location: {
        Row: {
          Country: string | null
          id: number
          Region: string | null
        }
        Insert: {
          Country?: string | null
          id?: number
          Region?: string | null
        }
        Update: {
          Country?: string | null
          id?: number
          Region?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          name: string
          superuser: boolean | null
          telephone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          name: string
          superuser?: boolean | null
          telephone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string
          superuser?: boolean | null
          telephone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tours: {
        Row: {
          country: string | null
          created_at: string
          details: string | null
          hours: number | null
          id: string
          image_url: string | null
          name: string
          photos: string[] | null
          region: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          details?: string | null
          hours?: number | null
          id?: string
          image_url?: string | null
          name: string
          photos?: string[] | null
          region?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          details?: string | null
          hours?: number | null
          id?: string
          image_url?: string | null
          name?: string
          photos?: string[] | null
          region?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
