import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database table names
export const TABLES = {
  USERS: 'users',
  BUSINESSES: 'businesses',
  TOKENS: 'tokens',
  LOYALTY_TRANSACTIONS: 'loyalty_transactions',
  EVENTS: 'events',
  USER_EVENTS: 'user_events'
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'An unexpected error occurred')
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) handleSupabaseError(error)
  return user
}

export const signInWithWallet = async (walletAddress) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${walletAddress}@wallet.local`,
    password: walletAddress
  })
  if (error) handleSupabaseError(error)
  return data
}

export const signUpWithWallet = async (walletAddress, username) => {
  const { data, error } = await supabase.auth.signUp({
    email: `${walletAddress}@wallet.local`,
    password: walletAddress,
    options: {
      data: {
        wallet_address: walletAddress,
        username: username
      }
    }
  })
  if (error) handleSupabaseError(error)
  return data
}
