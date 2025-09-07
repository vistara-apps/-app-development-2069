import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USERS: 'users',
  BUSINESSES: 'businesses',
  TOKENS: 'tokens',
  LOYALTY_TRANSACTIONS: 'loyalty_transactions',
  EVENTS: 'events',
  USER_EVENTS: 'user_events'
}

// Error handling helper
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'Database operation failed')
}
