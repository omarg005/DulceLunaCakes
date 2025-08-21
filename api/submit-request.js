// Import Supabase directly for Vercel functions
const { createClient } = require('@supabase/supabase-js');

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
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0,
        serviceKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 50) + '...' : 'missing'
    });

    try {
        console.log('📝 Parsing form data...');
        
        // Handle form data
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const body = buffer.toString();
        
        console.log('📊 Raw body received (first 200 chars):', body.substring(0, 200));
        
        let formData;
        
        // Try to parse as JSON first
        try {
            formData = JSON.parse(body);
            console.log('✅ Parsed as JSON:', Object.keys(formData));
        } catch (jsonError) {
            // Try to parse as URLSearchParams
            try {
                const params = new URLSearchParams(body);
                formData = Object.fromEntries(params);
                console.log('✅ Parsed as URL params:', Object.keys(formData));
            } catch (urlError) {
                console.warn('⚠️ Could not parse form data, using defaults');
                // Use test data as fallback
                formData = {
                    name: 'Test User (from API)',
                    email: 'test@example.com',
                    phone: '123-456-7890',
                    eventDate: new Date().toISOString().split('T')[0],
                    eventType: 'birthday',
                    servingSize: '10-15',
                    cakeDetails: 'API test submission',
                    additionalInfo: 'Form parsing fallback'
                };
            }
        }
        
        console.log('🔄 Final form data:', formData);

        // Skip file upload for now (will implement after basic form works)
        let imageUrl = null;

        // Save to database
        const submissionData = {
            ...formData,
            referenceImage: imageUrl,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };

        console.log('💾 Saving to database...');
        console.log('📊 Submission data:', JSON.stringify(submissionData, null, 2));
        
        // Check if environment variables are configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.warn('⚠️ Supabase environment variables not configured');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: Environment variables not set. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel dashboard.'
            });
        }
        
        // Initialize Supabase client directly
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        console.log('🔌 Supabase client created');

        // Save to Supabase directly
        const { data, error } = await supabase
            .from('cake_requests')
            .insert([{
                ...submissionData,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        console.log('✅ Database save result:', { data, error });

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to save request to database'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request submitted successfully!',
            requestId: data.id
        });

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
