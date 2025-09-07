import { supabase, TABLES, handleSupabaseError } from '../lib/supabase'

// User API functions
export const userApi = {
  // Get user by wallet address
  async getUserByWallet(walletAddress) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        handleSupabaseError(error)
      }

      return data
    } catch (error) {
      console.error('Error fetching user by wallet:', error)
      throw error
    }
  },

  // Create a new user
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([{
          wallet_address: userData.walletAddress,
          username: userData.username,
          farcaster_profile: userData.farcasterProfile,
          email: userData.email,
          preferences: userData.preferences || {}
        }])
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Update user profile
  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Get user's token balances
  async getUserTokens(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_TRANSACTIONS)
        .select(`
          *,
          businesses (
            id,
            name,
            category
          ),
          tokens (
            id,
            name,
            symbol,
            contract_address
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) handleSupabaseError(error)

      // Calculate token balances
      const balances = {}
      data.forEach(transaction => {
        const tokenId = transaction.token_id
        if (!balances[tokenId]) {
          balances[tokenId] = {
            tokenId,
            business: transaction.businesses,
            token: transaction.tokens,
            balance: 0,
            totalMinted: 0,
            totalRedeemed: 0
          }
        }

        if (transaction.type === 'mint') {
          balances[tokenId].balance += transaction.amount
          balances[tokenId].totalMinted += transaction.amount
        } else if (transaction.type === 'redeem') {
          balances[tokenId].balance -= transaction.amount
          balances[tokenId].totalRedeemed += transaction.amount
        }
      })

      return Object.values(balances)
    } catch (error) {
      console.error('Error fetching user tokens:', error)
      throw error
    }
  },

  // Record a loyalty transaction
  async recordTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_TRANSACTIONS)
        .insert([{
          user_id: transactionData.userId,
          business_id: transactionData.businessId,
          token_id: transactionData.tokenId,
          type: transactionData.type,
          amount: transactionData.amount,
          transaction_hash: transactionData.transactionHash,
          metadata: transactionData.metadata || {}
        }])
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error recording transaction:', error)
      throw error
    }
  },

  // Get user's transaction history
  async getUserTransactions(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_TRANSACTIONS)
        .select(`
          *,
          businesses (
            id,
            name,
            category
          ),
          tokens (
            id,
            name,
            symbol
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching user transactions:', error)
      throw error
    }
  },

  // Add business to favorites
  async addFavoriteBusiness(userId, businessId) {
    try {
      // Get current user data
      const user = await this.getUserById(userId)
      const currentFavorites = user.favorite_businesses || []
      
      if (!currentFavorites.includes(businessId)) {
        const updatedFavorites = [...currentFavorites, businessId]
        
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .update({ favorite_businesses: updatedFavorites })
          .eq('id', userId)
          .select()
          .single()

        if (error) handleSupabaseError(error)
        return data
      }
      
      return user
    } catch (error) {
      console.error('Error adding favorite business:', error)
      throw error
    }
  },

  // Remove business from favorites
  async removeFavoriteBusiness(userId, businessId) {
    try {
      const user = await this.getUserById(userId)
      const currentFavorites = user.favorite_businesses || []
      const updatedFavorites = currentFavorites.filter(id => id !== businessId)
      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ favorite_businesses: updatedFavorites })
        .eq('id', userId)
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error removing favorite business:', error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      throw error
    }
  },

  // Get user's favorite businesses
  async getUserFavoriteBusinesses(userId) {
    try {
      const user = await this.getUserById(userId)
      const favoriteIds = user.favorite_businesses || []
      
      if (favoriteIds.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from(TABLES.BUSINESSES)
        .select(`
          *,
          tokens (*)
        `)
        .in('id', favoriteIds)
        .eq('status', 'active')

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching favorite businesses:', error)
      throw error
    }
  }
}
