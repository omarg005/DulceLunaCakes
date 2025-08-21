// Load environment variables
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

// Import Supabase services
const { cakeRequestsService, testConnection } = require('./services/database-server');
const { storageService } = require('./services/storage-server');

// Direct Supabase client for new endpoints
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
}) : null;

const app = express();
const PORT = process.env.FORM_PORT ? parseInt(process.env.FORM_PORT, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) + 1 : 3002);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/reference-images';
        // Create directory if it doesn't exist
        fs.mkdir(uploadDir, { recursive: true }).then(() => {
            cb(null, uploadDir);
        }).catch(err => {
            cb(err);
        });
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Database operations now handled by Supabase
// Fallback arrays for when Supabase is not configured
let submissions = [];
let nextId = 1;

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-app-password' // Replace with your app password
    }
});

// Routes
app.post('/api/submit-request', upload.single('reference-image'), async (req, res) => {
    try {
        const formData = req.body;
        const uploadedFile = req.file;
        
        // Create submission object
        const submission = {
            id: nextId++,
            timestamp: new Date().toISOString(),
            status: 'pending',
            ...formData,
            referenceImage: uploadedFile ? uploadedFile.path : null
        };
        
        // Handle image upload to Supabase Storage (optional)
        let imageUrl = null;
        if (uploadedFile) {
            try {
                // Try to upload to Supabase Storage
                const targetFileName = `reference-images/${Date.now()}-${uploadedFile.originalname}`;
                const storageResult = await storageService.moveUploadToStorage(
                    uploadedFile.path, 
                    targetFileName
                );
                
                if (storageResult.success) {
                    imageUrl = storageResult.data.url;
                    console.log('Image uploaded to Supabase Storage:', imageUrl);
                } else {
                    // Fallback to local storage
                    imageUrl = uploadedFile.path;
                    console.warn('Supabase Storage upload failed, using local storage:', storageResult.error);
                }
            } catch (error) {
                // Fallback to local storage
                imageUrl = uploadedFile.path;
                console.warn('Storage upload error, using local storage:', error.message);
            }
        }

        // Store in Supabase database
        const submissionData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            event_date: formData['date-needed'],
            event_type: formData['event-type'],
            event_address: formData['event-address'],
            event_city: formData['event-city'], 
            event_zip: formData['event-zip'],
            cake_size: formData['cake-size'],
            cake_flavor: formData['cake-flavor'],
            frosting_type: formData['frosting-type'],
            cake_filling: formData['cake-filling'],
            design_description: formData['design-description'],
            color_scheme: formData['color-scheme'],
            special_requests: formData['special-requests'],
            budget_range: formData['budget-range'],
            additional_notes: formData['additional-notes'],
            reference_image_url: imageUrl,
            request_delivery: formData['request-delivery'] === 'yes'
        };

        const result = await cakeRequestsService.create(submissionData);
        
        if (result.success) {
            // Use Supabase ID for the submission
            submission.id = result.id;
            
            // Send email to business owner
            await sendEmailToOwner(submission);
            
            // Send confirmation email to customer
            await sendConfirmationEmail(submission);
            
            res.json({ 
                success: true, 
                message: result.message,
                submissionId: result.id
            });
        } else {
            // Fallback to in-memory storage if Supabase fails
            console.warn('Supabase failed, using fallback storage:', result.error);
            submissions.push(submission);
            
            await sendEmailToOwner(submission);
            await sendConfirmationEmail(submission);
            
            res.json({ 
                success: true, 
                message: 'Request submitted successfully! (fallback mode)',
                submissionId: submission.id
            });
        }
        
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting request',
            error: error.message 
        });
    }
});

// Get all submissions (for admin panel)
app.get('/api/submissions', async (req, res) => {
    try {
        console.log('📋 Getting all submissions from Supabase...');
        
        const { data, error } = await supabase
            .from('cake_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        console.log(`✅ Retrieved ${data?.length || 0} submissions from Supabase`);
        
        res.json({
            success: true,
            submissions: data || []
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.json({ 
            success: true, 
            submissions: submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
    }
});

// Update submission status
app.put('/api/submissions/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        console.log(`📝 Updating submission ${id} status to: ${status}`);
        
        const { data, error } = await supabase
            .from('cake_requests')
            .update({
                status,
                admin_notes: notes || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase update error:', error);
            throw error;
        }

        console.log('✅ Status updated successfully');
        
        res.json({
            success: true,
            data,
            message: 'Request status updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating submission status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete submission
app.delete('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️ Deleting submission: ${id}`);
        
        const { error } = await supabase
            .from('cake_requests')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Supabase delete error:', error);
            throw error;
        }

        console.log('✅ Submission deleted successfully');
        
        res.json({
            success: true,
            message: 'Request deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Email functions
async function sendEmailToOwner(submission) {
    const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
        to: 'omarg005@gmail.com',
        subject: `New Cake Request - ${submission.name}`,
        html: generateOwnerEmailHTML(submission),
        attachments: submission.referenceImage ? [{
            filename: path.basename(submission.referenceImage),
            path: submission.referenceImage
        }] : []
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to owner');
    } catch (error) {
        console.error('Error sending email to owner:', error);
    }
}

async function sendConfirmationEmail(submission) {
    const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
        to: submission.email,
        subject: 'Cake Request Received - Dulce Luna Cakes',
        html: generateCustomerEmailHTML(submission)
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to customer');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

function generateOwnerEmailHTML(submission) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5f82;">New Cake Request</h2>
            
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${submission.name}</p>
            <p><strong>Email:</strong> ${submission.email}</p>
            <p><strong>Phone:</strong> ${submission.phone}</p>
            
            <h3>Event Details</h3>
            <p><strong>Date Needed:</strong> ${submission['date-needed']}</p>
            <p><strong>Event Type:</strong> ${submission['event-type'] || 'Not specified'}</p>
            <p><strong>Event Address:</strong> ${submission['event-address'] || 'Not specified'}</p>
            
            <h3>Cake Specifications</h3>
            <p><strong>Size:</strong> ${submission['cake-size']}</p>
            <p><strong>Flavor:</strong> ${submission['cake-flavor']}</p>
            <p><strong>Frosting:</strong> ${submission['frosting-type'] || 'Not specified'}</p>
            
            <h3>Design Details</h3>
            <p><strong>Description:</strong> ${submission['design-description']}</p>
            <p><strong>Color Scheme:</strong> ${submission['color-scheme'] || 'Not specified'}</p>
            <p><strong>Special Requests:</strong> ${submission['special-requests'] || 'None'}</p>
            
            <h3>Budget & Timeline</h3>
            <p><strong>Budget Range:</strong> ${submission['budget-range'] || 'Not specified'}</p>
            <p><strong>Additional Notes:</strong> ${submission['additional-notes'] || 'None'}</p>
            
            ${submission.referenceImage ? `<p><strong>Reference Image:</strong> Attached</p>` : ''}
            
            <hr>
            <p><em>Submitted on: ${new Date(submission.timestamp).toLocaleString()}</em></p>
        </div>
    `;
}

function generateCustomerEmailHTML(submission) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5f82;">Thank You for Your Cake Request!</h2>
            
            <p>Dear ${submission.name},</p>
            
            <p>Thank you for submitting your custom cake request to Dulce Luna Cakes! We're excited to help bring your vision to life.</p>
            
            <h3>Request Summary</h3>
            <p><strong>Event Date:</strong> ${submission['date-needed']}</p>
            <p><strong>Cake Size:</strong> ${submission['cake-size']}</p>
            <p><strong>Cake Flavor:</strong> ${submission['cake-flavor']}</p>
            
            <h3>What Happens Next?</h3>
            <ol>
                <li>We'll review your request within 24 hours</li>
                <li>We'll contact you to discuss details and pricing</li>
                <li>We'll create a custom design for your approval</li>
                <li>We'll craft your perfect cake and deliver it to your celebration</li>
            </ol>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            Luna<br>
            Dulce Luna Cakes</p>
            
            <hr>
            <p><em>Request ID: ${submission.id}</em></p>
        </div>
    `;
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const connection = await testConnection();
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        submissionsCount: submissions.length,
        supabase: connection
    });
});

// Test Supabase connection endpoint
app.get('/api/test-supabase', async (req, res) => {
    const connection = await testConnection();
    res.json(connection);
});

// Test Supabase storage endpoint
app.get('/api/test-storage', async (req, res) => {
    const storageTest = await storageService.testConnection();
    res.json(storageTest);
});

// Get all gallery images
app.get('/api/gallery-images', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Supabase not configured',
                images: []
            });
        }

        const { data: images, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching gallery images:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message,
                images: []
            });
        }

        res.json({
            success: true,
            images: images || []
        });
    } catch (error) {
        console.error('Error in gallery images endpoint:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            images: []
        });
    }
});

// Get all index content
app.get('/api/index-content', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Supabase not configured',
                content: []
            });
        }

        const { data: content, error } = await supabase
            .from('index_content')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching index content:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message,
                content: []
            });
        }

        res.json({
            success: true,
            content: content || []
        });
    } catch (error) {
        console.error('Error in index content endpoint:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            content: []
        });
    }
});

// Update gallery image
app.put('/api/gallery-images/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Supabase not configured'
            });
        }

        const { id } = req.params;
        const { title, description, image_url } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (image_url) updateData.image_url = image_url;
        updateData.updated_at = new Date().toISOString();

        const { data: updatedImage, error } = await supabase
            .from('gallery_images')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating gallery image:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message
            });
        }

        res.json({
            success: true,
            image: updatedImage
        });
    } catch (error) {
        console.error('Error in gallery image update endpoint:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
});

// Update index content
app.put('/api/index-content/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ 
                success: false, 
                error: 'Supabase not configured'
            });
        }

        const { id } = req.params;
        const { title, description, image_url } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (image_url) updateData.image_url = image_url;
        updateData.updated_at = new Date().toISOString();

        const { data: updatedContent, error } = await supabase
            .from('index_content')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating index content:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message
            });
        }

        res.json({
            success: true,
            content: updatedContent
        });
    } catch (error) {
        console.error('Error in index content update endpoint:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
});

// Upload image to Supabase Storage
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No image file provided'
            });
        }

        // Try to upload to Supabase Storage
        // Check if this is replacing an existing image (get path from request)
        const originalPath = req.body.originalPath;
        let targetFileName;
        
        if (originalPath) {
            let directory = 'admin-uploads'; // default
            
            // Handle both Supabase URLs and local paths
            if (originalPath.includes('/storage/v1/object/public/images/')) {
                // Extract directory from Supabase URL
                const urlParts = originalPath.split('/storage/v1/object/public/images/')[1];
                const pathParts = urlParts.split('/');
                if (pathParts.length > 1) {
                    directory = pathParts[0]; // gallery, index, about, etc.
                }
            } else if (originalPath.includes('images/')) {
                // Extract directory from local path like "images/gallery/filename.jpg"
                const imageParts = originalPath.split('images/')[1];
                const pathParts = imageParts.split('/');
                if (pathParts.length > 1) {
                    directory = pathParts[0]; // gallery, index, about, etc.
                }
            }
            
            targetFileName = `${directory}/${Date.now()}-${req.file.originalname}`;
            console.log(`Replacing image in ${directory}: ${targetFileName} (original: ${originalPath})`);
        } else {
            // Default to admin-uploads for new uploads
            targetFileName = `admin-uploads/${Date.now()}-${req.file.originalname}`;
        }
        
        const storageResult = await storageService.moveUploadToStorage(
            req.file.path,
            targetFileName
        );

        if (storageResult.success) {
            res.json({
                success: true,
                image_url: storageResult.data.url,
                filename: targetFileName
            });
        } else {
            // Fallback to local file if Supabase fails
            res.json({
                success: false,
                error: storageResult.error,
                fallback_path: req.file.path
            });
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Form server running on http://localhost:${PORT}`);
    console.log('Make sure to configure email settings in form-server.js');
});

module.exports = app; 