import { createClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  db: {
    schema: 'public'
  }
})

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
