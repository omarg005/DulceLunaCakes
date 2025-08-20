const { cakeRequestsService } = require('../services/database-server');
const { storageService } = require('../services/storage-server');
const formidable = require('formidable');

module.exports = async function handler(req, res) {
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

        // Extract form data (formidable returns arrays)
        const formData = {};
        for (const [key, value] of Object.entries(fields)) {
            formData[key] = Array.isArray(value) ? value[0] : value;
        }

        // Handle file upload
        let imageUrl = null;
        if (files['reference-image']) {
            const file = Array.isArray(files['reference-image']) ? files['reference-image'][0] : files['reference-image'];
            
            // Upload to Supabase Storage
            const uploadResult = await storageService.moveUploadToStorage(
                file.filepath,
                `reference-images/reference-image-${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalFilename?.split('.').pop() || 'jpg'}`
            );

            if (uploadResult.success) {
                imageUrl = uploadResult.data.url;
            }
        }

        // Save to database
        const submissionData = {
            ...formData,
            referenceImage: imageUrl,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };

        const result = await cakeRequestsService.create(submissionData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Request submitted successfully!',
                requestId: result.data.id
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error || 'Failed to save request'
            });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
