const { storageService } = require('../services/storage-server');
const formidable = require('formidable');
const { promises: fs } = require('fs');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse form data
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            keepExtensions: true,
        });

        const [fields, files] = await form.parse(req);

        if (!files.image) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
        const originalPath = fields.originalPath ? (Array.isArray(fields.originalPath) ? fields.originalPath[0] : fields.originalPath) : null;

        let targetFileName;

        if (originalPath) {
            let directory = 'admin-uploads'; // default

            // Parse Supabase URLs
            if (originalPath.includes('/storage/v1/object/public/images/')) {
                const urlParts = originalPath.split('/storage/v1/object/public/images/')[1];
                const pathParts = urlParts.split('/');
                if (pathParts.length > 1) {
                    directory = pathParts[0];
                }
            } 
            // Parse local image paths
            else if (originalPath.includes('images/')) {
                const imageParts = originalPath.split('images/')[1];
                const pathParts = imageParts.split('/');
                if (pathParts.length > 1) {
                    directory = pathParts[0];
                }
            }

            targetFileName = `${directory}/${Date.now()}-${imageFile.originalFilename || 'image.jpg'}`;
            console.log(`Replacing image in ${directory}: ${targetFileName} (original: ${originalPath})`);
        } else {
            targetFileName = `admin-uploads/${Date.now()}-${imageFile.originalFilename || 'image.jpg'}`;
        }

        // Upload to Supabase Storage
        const storageResult = await storageService.moveUploadToStorage(
            imageFile.filepath,
            targetFileName
        );

        // Clean up temporary file
        try {
            await fs.unlink(imageFile.filepath);
        } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
        }

        if (storageResult.success) {
            res.json({
                success: true,
                image_url: storageResult.data.url,
                filename: targetFileName
            });
        } else {
            res.json({
                success: false,
                error: storageResult.error,
                fallback_path: imageFile.filepath
            });
        }

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
