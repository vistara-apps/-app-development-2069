import { supabase, TABLES, handleSupabaseError } from '../lib/supabase'

// Event API functions
export const eventApi = {
  // Get all events with optional filtering
  async getEvents(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.EVENTS)
        .select(`
          *,
          businesses (
            id,
            name,
            location,
            category
          )
        `)
        .eq('status', 'active')

      if (filters.businessId) {
        query = query.eq('business_id', filters.businessId)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.upcoming) {
        query = query.gte('start_time', new Date().toISOString())
      }

      const { data, error } = await query.order('start_time', { ascending: true })
      
      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  // Get a single event by ID
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EVENTS)
        .select(`
          *,
          businesses (
            id,
            name,
            location,
            category,
            contact_info
          ),
          user_events (
            user_id,
            status
          )
        `)
        .eq('id', eventId)
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  },

  // Create a new event
  async createEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EVENTS)
        .insert([{
          business_id: eventData.businessId,
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          location: eventData.location,
          deal_details: eventData.dealDetails,
          type: eventData.type,
          max_attendees: eventData.maxAttendees,
          token_reward: eventData.tokenReward,
          status: 'active'
        }])
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  // Update an event
  async updateEvent(eventId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EVENTS)
        .update(updates)
        .eq('id', eventId)
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  // Delete an event
  async deleteEvent(eventId) {
    try {
      const { error } = await supabase
        .from(TABLES.EVENTS)
        .update({ status: 'cancelled' })
        .eq('id', eventId)

      if (error) handleSupabaseError(error)
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // RSVP to an event
  async rsvpToEvent(eventId, userId, status = 'attending') {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_EVENTS)
        .upsert([{
          event_id: eventId,
          user_id: userId,
          status: status,
          rsvp_date: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error RSVPing to event:', error)
      throw error
    }
  },

  // Get user's RSVP status for an event
  async getUserRSVP(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_EVENTS)
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching user RSVP:', error)
      throw error
    }
  },

  // Get events user has RSVP'd to
  async getUserEvents(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_EVENTS)
        .select(`
          *,
          events (
            *,
            businesses (
              id,
              name,
              location
            )
          )
        `)
        .eq('user_id', userId)
        .order('rsvp_date', { ascending: false })

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching user events:', error)
      throw error
    }
  },

  // Get event attendees
  async getEventAttendees(eventId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_EVENTS)
        .select(`
          *,
          users (
            id,
            username,
            wallet_address
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'attending')

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error fetching event attendees:', error)
      throw error
    }
  },

  // Search events
  async searchEvents(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EVENTS)
        .select(`
          *,
          businesses (
            id,
            name,
            location,
            category
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error searching events:', error)
      throw error
    }
  }
}
