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
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    console.log('🚀 Submit request API called');
    console.log('📋 Request method:', req.method);
    console.log('🌍 Environment variables check:', {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    try {
        // Parse form data
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            keepExtensions: true,
        });

        console.log('📝 Parsing form data...');
        const [fields, files] = await form.parse(req);
        console.log('✅ Form parsed successfully');
        console.log('📋 Fields received:', Object.keys(fields));
        console.log('📎 Files received:', Object.keys(files));

        // Extract form data (formidable returns arrays)
        const formData = {};
        for (const [key, value] of Object.entries(fields)) {
            formData[key] = Array.isArray(value) ? value[0] : value;
        }
        console.log('🔄 Processed form data:', Object.keys(formData));

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

        console.log('💾 Saving to database...');
        console.log('📊 Submission data:', JSON.stringify(submissionData, null, 2));
        
        const result = await cakeRequestsService.create(submissionData);
        console.log('✅ Database save result:', result);

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
        console.error('❌ Error processing request:', error);
        console.error('📊 Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
