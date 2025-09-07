import { supabase, TABLES, handleSupabaseError } from '../lib/supabase'

// Business API functions
export const businessApi = {
  // Get all businesses with optional filtering
  async getBusinesses(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.BUSINESSES)
        .select(`
          *,
          tokens (*)
        `)
        .eq('status', 'active')

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching businesses:', error)
      throw error
    }
  },

  // Get a single business by ID
  async getBusinessById(businessId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.BUSINESSES)
        .select(`
          *,
          tokens (*),
          events (*)
        `)
        .eq('id', businessId)
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching business:', error)
      throw error
    }
  },

  // Create a new business
  async createBusiness(businessData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.BUSINESSES)
        .insert([{
          name: businessData.name,
          description: businessData.description,
          location: businessData.location,
          contact_info: businessData.contactInfo,
          category: businessData.category,
          reward_scheme: businessData.rewardScheme,
          owner_wallet: businessData.ownerWallet,
          status: 'pending_approval'
        }])
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error creating business:', error)
      throw error
    }
  },

  // Update business profile
  async updateBusiness(businessId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.BUSINESSES)
        .update(updates)
        .eq('id', businessId)
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error updating business:', error)
      throw error
    }
  },

  // Get businesses owned by a wallet address
  async getBusinessesByOwner(walletAddress) {
    try {
      const { data, error } = await supabase
        .from(TABLES.BUSINESSES)
        .select(`
          *,
          tokens (*),
          events (*)
        `)
        .eq('owner_wallet', walletAddress)
        .order('created_at', { ascending: false })

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching owned businesses:', error)
      throw error
    }
  },

  // Search businesses
  async searchBusinesses(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(TABLES.BUSINESSES)
        .select(`
          *,
          tokens (*)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error searching businesses:', error)
      throw error
    }
  },

  // Get business analytics
  async getBusinessAnalytics(businessId) {
    try {
      const { data: transactions, error } = await supabase
        .from(TABLES.LOYALTY_TRANSACTIONS)
        .select('*')
        .eq('business_id', businessId)

      if (error) handleSupabaseError(error)

      // Calculate analytics
      const totalTokensMinted = transactions
        .filter(t => t.type === 'mint')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalTokensRedeemed = transactions
        .filter(t => t.type === 'redeem')
        .reduce((sum, t) => sum + t.amount, 0)

      const uniqueUsers = new Set(transactions.map(t => t.user_id)).size

      return {
        totalTokensMinted,
        totalTokensRedeemed,
        uniqueUsers,
        totalTransactions: transactions.length,
        transactions
      }
    } catch (error) {
      console.error('Error fetching business analytics:', error)
      throw error
    }
  }
}
