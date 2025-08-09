const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = req.body.folder || 'images/index';
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        const filename = req.body.filename || file.originalname;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Routes
app.post('/api/update-content', upload.single('image'), async (req, res) => {
    try {
        const { page, imageId, title, description, targetFile } = req.body;
        
        // Handle image upload if provided
        if (req.file) {
            console.log(`Image uploaded: ${req.file.path}`);
        }
        
        // Update HTML content
        await updateHtmlContent(page, imageId, title, description, targetFile);
        
        res.json({ 
            success: true, 
            message: 'Content updated successfully',
            imagePath: req.file ? req.file.path : null
        });
        
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating content',
            error: error.message 
        });
    }
});

app.post('/api/batch-update', async (req, res) => {
    try {
        const { changes } = req.body;
        
        for (const change of changes) {
            await updateHtmlContent(
                change.page,
                change.imageId,
                change.title,
                change.description,
                change.targetFile
            );
        }
        
        res.json({ 
            success: true, 
            message: 'All changes applied successfully' 
        });
        
    } catch (error) {
        console.error('Error in batch update:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error applying changes',
            error: error.message 
        });
    }
});

// Function to update HTML content
async function updateHtmlContent(page, imageId, title, description, targetFile) {
    const htmlFile = `${page}.html`;
    const htmlPath = path.join(__dirname, htmlFile);
    
    try {
        // Read the HTML file
        const html = await fs.readFile(htmlPath, 'utf8');
        const $ = cheerio.load(html);
        
        // Update content based on imageId
        switch (imageId) {
            case 'hero-background':
                // Update hero title and subtitle
                $('.hero-title').text(title);
                $('.hero-subtitle').text(description);
                // Update hero background image in CSS file
                await updateHeroBackgroundImage(targetFile);
                break;
                
            case 'chocolate-floral-tier':
                $('.cake-card:nth-child(1) img').attr('src', targetFile);
                $('.cake-card:nth-child(1) h3').text(title);
                $('.cake-card:nth-child(1) p').text(description);
                break;
                
            case 'unicorn-birthday-magic':
                $('.cake-card:nth-child(2) img').attr('src', targetFile);
                $('.cake-card:nth-child(2) h3').text(title);
                $('.cake-card:nth-child(2) p').text(description);
                break;
                
            case 'rustic-wedding-cake':
                $('.cake-card:nth-child(3) img').attr('src', targetFile);
                $('.cake-card:nth-child(3) h3').text(title);
                $('.cake-card:nth-child(3) p').text(description);
                break;
                
            case 'meet-the-baker':
                $('.about-image img').attr('src', targetFile);
                $('.about-text h2').text(title);
                $('.about-text p').text(description);
                break;
                
            case 'hi-im-luna':
                $('.about-image img').attr('src', targetFile);
                $('.about-text h2').text(title);
                $('.about-text p').text(description);
                break;
                
            default:
                console.log(`Unknown imageId: ${imageId}`);
        }
        
        // Write the updated HTML back to file
        await fs.writeFile(htmlPath, $.html());
        console.log(`Updated ${htmlFile} for imageId: ${imageId}`);
        
    } catch (error) {
        console.error(`Error updating ${htmlFile}:`, error);
        throw error;
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Function to update hero background image in CSS
async function updateHeroBackgroundImage(newImagePath) {
    try {
        const cssPath = path.join(__dirname, 'styles.css');
        let cssContent = await fs.readFile(cssPath, 'utf8');
        
        // Replace the hero background image URL in the CSS
        const heroBackgroundRegex = /\.hero::before\s*\{[^}]*background:\s*url\(['"]?[^'"]*['"]?\)/;
        const newBackgroundUrl = `.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('${newImagePath}') center/cover;
    opacity: 0.3;
    z-index: 1;
}`;
        
        cssContent = cssContent.replace(heroBackgroundRegex, newBackgroundUrl);
        
        await fs.writeFile(cssPath, cssContent);
        console.log(`Updated hero background image in CSS: ${newImagePath}`);
        
    } catch (error) {
        console.error('Error updating hero background image in CSS:', error);
        throw error;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
    console.log('Make sure to install dependencies: npm install express multer cheerio');
});

module.exports = app; 