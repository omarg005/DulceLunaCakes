// Authentication Service using Supabase Auth
// Handles admin login, session management, and user operations

import { supabase, supabaseHelpers } from '../lib/supabase.js'

export const authService = {
  // Sign in admin user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Login successful'
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Sign out admin user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      return {
        success: true,
        message: 'Logout successful'
      }
    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error

      return {
        success: true,
        user
      }
    } catch (error) {
      console.error('Get user error:', error)
      return {
        success: false,
        error: error.message,
        user: null
      }
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const result = await this.getCurrentUser()
      return result.success && result.user !== null
    } catch (error) {
      return false
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error

      return {
        success: true,
        session
      }
    } catch (error) {
      console.error('Get session error:', error)
      return {
        success: false,
        error: error.message,
        session: null
      }
    }
  },

  // Send password reset email
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin.html?reset=true`
      })

      if (error) throw error

      return {
        success: true,
        message: 'Password reset email sent'
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return {
        success: true,
        message: 'Password updated successfully'
      }
    } catch (error) {
      console.error('Password update error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },

  // Fallback authentication (when Supabase is not configured)
  async fallbackAuth(username, password) {
    // Use the original admin credentials as fallback
    const FALLBACK_CREDENTIALS = {
      username: 'admin',
      password: 'dulceluna2025'
    }

    if (username === FALLBACK_CREDENTIALS.username && password === FALLBACK_CREDENTIALS.password) {
      // Store fallback session in localStorage
      const fallbackSession = {
        user: {
          id: 'fallback-admin',
          email: 'admin@dulcelunacakes.com',
          user_metadata: { name: 'Admin User' }
        },
        access_token: 'fallback-token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }

      localStorage.setItem('fallback_session', JSON.stringify(fallbackSession))

      return {
        success: true,
        user: fallbackSession.user,
        session: fallbackSession,
        message: 'Login successful (fallback mode)',
        fallback: true
      }
    }

    return {
      success: false,
      error: 'Invalid credentials',
      fallback: true
    }
  },

  // Check fallback authentication
  async checkFallbackAuth() {
    try {
      const fallbackSession = localStorage.getItem('fallback_session')
      if (!fallbackSession) return { success: false, user: null }

      const session = JSON.parse(fallbackSession)
      
      // Check if session is expired
      if (Date.now() > session.expires_at) {
        localStorage.removeItem('fallback_session')
        return { success: false, user: null }
      }

      return {
        success: true,
        user: session.user,
        session,
        fallback: true
      }
    } catch (error) {
      return { success: false, user: null }
    }
  },

  // Clear fallback session
  async clearFallbackAuth() {
    localStorage.removeItem('fallback_session')
    return { success: true }
  }
}

// Auth state management
export const authState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  fallbackMode: false,

  // Initialize auth state
  async init() {
    try {
      // Try Supabase first
      const supabaseSession = await authService.getSession()
      
      if (supabaseSession.success && supabaseSession.session) {
        this.user = supabaseSession.session.user
        this.session = supabaseSession.session
        this.isAuthenticated = true
        this.fallbackMode = false
      } else {
        // Try fallback auth
        const fallbackSession = await authService.checkFallbackAuth()
        
        if (fallbackSession.success) {
          this.user = fallbackSession.user
          this.session = fallbackSession.session
          this.isAuthenticated = true
          this.fallbackMode = true
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      this.isLoading = false
    }
  },

  // Clear auth state
  clear() {
    this.user = null
    this.session = null
    this.isAuthenticated = false
    this.fallbackMode = false
  }
}

export default authService
