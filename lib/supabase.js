// Supabase Client Configuration
// Using global supabase from CDN

// Supabase configuration - hardcoded for client-side use
const supabaseUrl = 'https://pwvnrtkrnibaxzrduzmj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dm5ydGtybmliYXh6cmR1em1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTk1NjEsImV4cCI6MjA3MTIzNTU2MX0.E_IntUR0qo5j75Xc4rlP1YCB_Seq-cM42M8ntE1C-zY'

// Create Supabase client using global supabase
export const supabase = window.supabase && supabaseUrl && supabaseAnonKey 
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey) 
  : null

// Admin client with service role key (server-side only)
// Note: This will only work on server-side where env vars are available
export const supabaseAdmin = typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY 
  ? window.supabase?.createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Helper functions for common operations
export const supabaseHelpers = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from('cake_requests').select('count').single()
      return { success: !error, error }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Sign in admin
  async signInAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser()
    return !!user
  }
}

export default supabase
