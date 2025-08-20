// Database Service Layer for Supabase
// Handles all database operations for the Dulce Luna Cakes application

import { supabase, supabaseAdmin } from '../lib/supabase.js'

// Cake Requests Service
export const cakeRequestsService = {
  // Create a new cake request
  async create(requestData) {
    try {
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

// Gallery Images Service
export const galleryService = {
  // Get all gallery images
  async getImages() {
    try {
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
  },

  // Add new image
  async addImage(imageData) {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert([imageData])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Image added successfully'
      }
    } catch (error) {
      console.error('Error adding image:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Delete image
  async deleteImage(imageId) {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      return {
        success: true,
        message: 'Image deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Admin Users Service
export const adminService = {
  // Get admin user by email
  async getAdminByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Create admin user
  async createAdmin(adminData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert([adminData])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Admin user created successfully'
      }
    } catch (error) {
      console.error('Error creating admin user:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to cake requests changes
  subscribeToCakeRequests(callback) {
    return supabase
      .channel('cake_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cake_requests' },
        callback
      )
      .subscribe()
  },

  // Subscribe to gallery changes
  subscribeToGallery(callback) {
    return supabase
      .channel('gallery_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_images' },
        callback
      )
      .subscribe()
  }
}

export default {
  cakeRequestsService,
  galleryService,
  adminService,
  subscriptions
}
