// Server-side Supabase Storage Service
// Node.js compatible version for server-side operations

const { supabase } = require('./database-server')

const storageService = {
  // Upload file buffer to Supabase Storage
  async uploadFile(fileBuffer, fileName, bucket = 'images', options = {}) {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          cacheControl: '3600',
          upsert: options.upsert || false,
          contentType: options.contentType || 'image/jpeg'
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          url: urlData.publicUrl,
          fileName: fileName
        },
        message: 'File uploaded successfully'
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Delete file from Supabase Storage
  async deleteFile(fileName, bucket = 'images') {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      if (error) throw error

      return {
        success: true,
        message: 'File deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get file URL
  getFileUrl(fileName, bucket = 'images') {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase not configured'
        }
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return {
        success: true,
        url: data.publicUrl
      }
    } catch (error) {
      console.error('Error getting file URL:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // List files in bucket
  async listFiles(bucket = 'images', folder = '') {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      return {
        success: true,
        files: data || []
      }
    } catch (error) {
      console.error('Error listing files:', error)
      return {
        success: false,
        error: error.message,
        files: []
      }
    }
  },

  // Move uploaded file to Supabase Storage
  async moveUploadToStorage(localFilePath, targetFileName, bucket = 'images') {
    try {
      const fs = require('fs').promises
      
      // Read the local file
      const fileBuffer = await fs.readFile(localFilePath)
      
      // Upload to Supabase
      const result = await this.uploadFile(fileBuffer, targetFileName, bucket)
      
      if (result.success) {
        // Delete local file after successful upload
        try {
          await fs.unlink(localFilePath)
        } catch (unlinkError) {
          console.warn('Could not delete local file:', unlinkError.message)
        }
      }
      
      return result
    } catch (error) {
      console.error('Error moving file to storage:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Test storage connection
  async testConnection() {
    try {
      if (!supabase) {
        return {
          success: false,
          available: false,
          error: 'Supabase not configured'
        }
      }

      const { data, error } = await supabase.storage.listBuckets()
      
      return {
        success: !error,
        available: true,
        buckets: data || [],
        error: error?.message
      }
    } catch (error) {
      return {
        success: false,
        available: false,
        error: error.message
      }
    }
  }
}

module.exports = {
  storageService
}
