import { supabase, TABLES, handleSupabaseError } from '../lib/supabase'

// User API functions
export const userApi = {
  // Get user profile by wallet address
  async getUserByWallet(walletAddress) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select(`
          *,
          loyalty_transactions (
            *,
            businesses (name),
            tokens (name, symbol)
          )
        `)
        .eq('wallet_address', walletAddress)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  // Create or update user profile
  async upsertUser(userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .upsert([{
          wallet_address: userData.walletAddress,
          username: userData.username,
          farcaster_profile: userData.farcasterProfile,
          email: userData.email,
          preferences: userData.preferences || {},
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error upserting user:', error)
      throw error
    }
  },

  // Update user profile
  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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
          tokens (
            *,
            businesses (name, location)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) handleSupabaseError(error)

      // Calculate token balances
      const tokenBalances = {}
      data.forEach(transaction => {
        const tokenId = transaction.token_id
        if (!tokenBalances[tokenId]) {
          tokenBalances[tokenId] = {
            token: transaction.tokens,
            balance: 0,
            totalEarned: 0,
            totalRedeemed: 0
          }
        }

        if (transaction.type === 'mint') {
          tokenBalances[tokenId].balance += transaction.amount
          tokenBalances[tokenId].totalEarned += transaction.amount
        } else if (transaction.type === 'redeem') {
          tokenBalances[tokenId].balance -= transaction.amount
          tokenBalances[tokenId].totalRedeemed += transaction.amount
        }
      })

      return Object.values(tokenBalances).filter(tb => tb.balance > 0)
    } catch (error) {
      console.error('Error fetching user tokens:', error)
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
          tokens (name, symbol),
          businesses (name, location)
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

  // Get user analytics
  async getUserAnalytics(userId) {
    try {
      const { data: transactions, error } = await supabase
        .from(TABLES.LOYALTY_TRANSACTIONS)
        .select('*')
        .eq('user_id', userId)

      if (error) handleSupabaseError(error)

      const totalTokensEarned = transactions
        .filter(t => t.type === 'mint')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalTokensRedeemed = transactions
        .filter(t => t.type === 'redeem')
        .reduce((sum, t) => sum + t.amount, 0)

      const uniqueBusinesses = new Set(transactions.map(t => t.business_id)).size

      // Calculate weekly activity
      const weeklyActivity = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))
        
        const dayTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.created_at)
          return transactionDate >= dayStart && transactionDate <= dayEnd
        })

        weeklyActivity.push({
          day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          tokens: dayTransactions.reduce((sum, t) => sum + (t.type === 'mint' ? t.amount : 0), 0)
        })
      }

      return {
        totalTokensEarned,
        totalTokensRedeemed,
        uniqueBusinesses,
        totalTransactions: transactions.length,
        weeklyActivity
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      throw error
    }
  },

  // Add favorite business
  async addFavoriteBusiness(userId, businessId) {
    try {
      const user = await this.getUserById(userId)
      const favorites = user.favorite_businesses || []
      
      if (!favorites.includes(businessId)) {
        favorites.push(businessId)
        
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .update({ favorite_businesses: favorites })
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

  // Remove favorite business
  async removeFavoriteBusiness(userId, businessId) {
    try {
      const user = await this.getUserById(userId)
      const favorites = (user.favorite_businesses || []).filter(id => id !== businessId)
      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ favorite_businesses: favorites })
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

  // Record token transaction
  async recordTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_TRANSACTIONS)
        .insert([{
          user_id: transactionData.userId,
          business_id: transactionData.businessId,
          token_id: transactionData.tokenId,
          type: transactionData.type, // 'mint' or 'redeem'
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
  }
}
