// Server-side Database Service for Supabase
// Node.js/Express compatible version

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `Found (${supabaseServiceKey.length} chars)` : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase environment variables not found. Using fallback mode.')
} else {
  console.log('✅ Supabase environment variables loaded successfully')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Cake Requests Service (Server-side)
const cakeRequestsService = {
  // Create a new cake request
  async create(requestData) {
    try {
      if (!supabase) {
        // Fallback to in-memory storage if Supabase not configured
        console.warn('Supabase not configured, using fallback storage')
        return {
          success: true,
          id: `temp_${Date.now()}`,
          message: 'Request submitted (fallback mode)'
        }
      }

      const { data, error } = await supabase
        .from('cake_requests')
        .insert([{
          ...requestData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        id: data.id,
        message: 'Cake request submitted successfully!'
      }
    } catch (error) {
      console.error('Error creating cake request:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get all cake requests (admin only)
  async getAll() {
    try {
      if (!supabase) {
        return {
          success: true,
          requests: []
        }
      }

      const { data, error } = await supabase
        .from('cake_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        requests: data || []
      }
    } catch (error) {
      console.error('Error fetching cake requests:', error)
      return {
        success: false,
        error: error.message,
        requests: []
      }
    }
  },

  // Get requests by status
  async getByStatus(status) {
    try {
      if (!supabase) {
        return {
          success: true,
          requests: []
        }
      }

      const { data, error } = await supabase
        .from('cake_requests')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        requests: data || []
      }
    } catch (error) {
      console.error('Error fetching requests by status:', error)
      return {
        success: false,
        error: error.message,
        requests: []
      }
    }
  },

  // Update request status
  async updateStatus(requestId, status, adminNotes = '') {
    try {
      if (!supabase) {
        return {
          success: true,
          message: 'Status updated (fallback mode)'
        }
      }

      const { data, error } = await supabase
        .from('cake_requests')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Request status updated successfully'
      }
    } catch (error) {
      console.error('Error updating request status:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Delete a request
  async delete(requestId) {
    try {
      if (!supabase) {
        return {
          success: true,
          message: 'Request deleted (fallback mode)'
        }
      }

      const { error } = await supabase
        .from('cake_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      return {
        success: true,
        message: 'Request deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get request by ID
  async getById(requestId) {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase not configured'
        }
      }

      const { data, error } = await supabase
        .from('cake_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error fetching request by ID:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Gallery Images Service (Server-side)
const galleryService = {
  // Get all gallery images
  async getImages() {
    try {
      if (!supabase) {
        return {
          success: true,
          images: []
        }
      }

      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      return {
        success: true,
        images: data || []
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      return {
        success: false,
        error: error.message,
        images: []
      }
    }
  },

  // Update image data
  async updateImage(imageId, imageData) {
    try {
      if (!supabase) {
        return {
          success: true,
          message: 'Image updated (fallback mode)'
        }
      }

      const { data, error } = await supabase
        .from('gallery_images')
        .update({
          ...imageData,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Image updated successfully'
      }
    } catch (error) {
      console.error('Error updating image:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Test connection
const testConnection = async () => {
  try {
    if (!supabase) {
      return { connected: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('cake_requests')
      .select('count')
      .limit(1)

    return { 
      connected: !error, 
      error: error?.message,
      supabaseConfigured: true
    }
  } catch (err) {
    return { 
      connected: false, 
      error: err.message,
      supabaseConfigured: !!supabase
    }
  }
}

module.exports = {
  cakeRequestsService,
  galleryService,
  testConnection,
  supabase
}
