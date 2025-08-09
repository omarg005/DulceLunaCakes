const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

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

// Simple in-memory database (replace with real database in production)
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
        
        // Store in database
        submissions.push(submission);
        
        // Send email to business owner
        await sendEmailToOwner(submission);
        
        // Send confirmation email to customer
        await sendConfirmationEmail(submission);
        
        res.json({ 
            success: true, 
            message: 'Request submitted successfully!',
            submissionId: submission.id
        });
        
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
app.get('/api/submissions', (req, res) => {
    res.json({ 
        success: true, 
        submissions: submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
});

// Update submission status
app.put('/api/submissions/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const submission = submissions.find(s => s.id === parseInt(id));
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        
        submission.status = status;
        submission.adminNotes = notes;
        submission.updatedAt = new Date().toISOString();
        
        res.json({ success: true, submission });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete submission
app.delete('/api/submissions/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = submissions.findIndex(s => s.id === parseInt(id));
        
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        
        // Delete reference image if exists
        const submission = submissions[index];
        if (submission.referenceImage) {
            fs.unlink(submission.referenceImage).catch(err => console.error('Error deleting file:', err));
        }
        
        submissions.splice(index, 1);
        res.json({ success: true, message: 'Submission deleted' });
        
    } catch (error) {
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
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        submissionsCount: submissions.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Form server running on http://localhost:${PORT}`);
    console.log('Make sure to configure email settings in form-server.js');
});

module.exports = app; 