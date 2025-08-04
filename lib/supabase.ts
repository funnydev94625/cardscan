import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zxscejbxgriqexnimgmv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4c2NlamJ4Z3JpcWV4bmltZ212Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg5Nzk4MCwiZXhwIjoyMDY5NDczOTgwfQ._CP4yVBkCC1oGUReZK45odGBHoQ2czbwz9-S3l2BySE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string
          card_number: string
        //   masked_card_number: string
          bin: string
          expiry_month: string
          expiry_year: string
          cvv: string
          name: string
          address_line1: string
          address_line2: string
          phone: string
          city: string
          state: string
          zipcode: string
          email: string
          country: string
        //   bank: string | null
        //   latitude: number | null
        //   longitude: number | null
          created_at: string
        }
        // Insert: {
        //   id?: string
        //   card_number: string
        //   masked_card_number: string
        //   bin: string
        //   expiry: string
        //   cvv: string
        //   cardholder_name: string
        //   address: string
        //   phone: string
        //   city: string
        //   state: string
        //   zip_code: string
        //   email: string
        //   country?: string
        //   bank?: string | null
        //   latitude?: number | null
        //   longitude?: number | null
        //   created_at?: string
        //   updated_at?: string
        // }
        // Update: {
        //   id?: string
        //   card_number?: string
        //   masked_card_number?: string
        //   bin?: string
        //   expiry?: string
        //   cvv?: string
        //   cardholder_name?: string
        //   address?: string
        //   phone?: string
        //   city?: string
        //   state?: string
        //   zip_code?: string
        //   email?: string
        //   country?: string
        //   bank?: string | null
        //   latitude?: number | null
        //   longitude?: number | null
        //   created_at?: string
        //   updated_at?: string
        // }
      }
    }
  }
}
