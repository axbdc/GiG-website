import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Reservation = {
  id: string
  name: string
  email: string
  phone: string | null
  date: string
  time: string
  guests: number
  message: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show'
  created_at: string
}

export type ClosedDate = {
  id: string
  date: string
  reason: string | null
  created_at: string
}
