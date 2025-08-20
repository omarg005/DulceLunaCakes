// Supabase Storage Service
// Handles image uploads, management, and optimization

import { supabase } from '../lib/supabase.js'

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file, bucket = 'cake-images', folder = 'uploads') {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
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
        message: 'Image uploaded successfully'
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Delete image from Supabase Storage
  async deleteImage(fileName, bucket = 'cake-images') {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

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
  },

  // Get image URL
  getImageUrl(fileName, bucket = 'cake-images') {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return {
        success: true,
        url: data.publicUrl
      }
    } catch (error) {
      console.error('Error getting image URL:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // List images in bucket
  async listImages(bucket = 'cake-images', folder = '') {
    try {
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
        images: data || []
      }
    } catch (error) {
      console.error('Error listing images:', error)
      return {
        success: false,
        error: error.message,
        images: []
      }
    }
  },

  // Create optimized versions of images
  async createThumbnail(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            resolve({
              success: true,
              file: new File([blob], `thumb_${file.name}`, {
                type: file.type,
                lastModified: Date.now()
              }),
              dimensions: { width, height }
            })
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to process image'
        })
      }

      img.src = URL.createObjectURL(file)
    })
  },

  // Upload image with thumbnail
  async uploadImageWithThumbnail(file, bucket = 'cake-images', folder = 'uploads') {
    try {
      // Upload original image
      const originalUpload = await this.uploadImage(file, bucket, folder)
      if (!originalUpload.success) {
        throw new Error(originalUpload.error)
      }

      // Create and upload thumbnail
      const thumbnailResult = await this.createThumbnail(file)
      if (thumbnailResult.success) {
        const thumbnailUpload = await this.uploadImage(
          thumbnailResult.file, 
          bucket, 
          `${folder}/thumbnails`
        )

        return {
          success: true,
          data: {
            original: originalUpload.data,
            thumbnail: thumbnailUpload.success ? thumbnailUpload.data : null
          },
          message: 'Image and thumbnail uploaded successfully'
        }
      }

      // Return original upload if thumbnail fails
      return {
        success: true,
        data: {
          original: originalUpload.data,
          thumbnail: null
        },
        message: 'Image uploaded successfully (thumbnail creation failed)'
      }

    } catch (error) {
      console.error('Error uploading image with thumbnail:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Check if storage is available
  async testConnection() {
    try {
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
  },

  // Create bucket if it doesn't exist
  async createBucket(bucketName, options = {}) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: options.public !== false, // Default to public
        allowedMimeTypes: options.allowedMimeTypes || ['image/*'],
        fileSizeLimit: options.fileSizeLimit || 5242880 // 5MB default
      })

      if (error) throw error

      return {
        success: true,
        data,
        message: `Bucket '${bucketName}' created successfully`
      }
    } catch (error) {
      console.error('Error creating bucket:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default storageService
