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
        console.log('📋 Content-Type:', req.headers['content-type']);
        
        // Handle form data
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        console.log('📊 Raw body size:', buffer.length);
        console.log('📊 Raw body start:', buffer.toString('utf8', 0, Math.min(200, buffer.length)));
        
        let formData = {};
        
        // Parse multipart form data (FormData from frontend)
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            console.log('🔄 Parsing multipart form data...');
            
            // Simple multipart parser for basic fields (no file handling yet)
            const bodyStr = buffer.toString();
            const boundary = req.headers['content-type'].split('boundary=')[1];
            
            if (boundary) {
                const parts = bodyStr.split(`--${boundary}`);
                console.log('📦 Found', parts.length - 2, 'form parts');
                
                for (const part of parts) {
                    if (part.includes('Content-Disposition: form-data')) {
                        const nameMatch = part.match(/name="([^"]+)"/);
                        if (nameMatch) {
                            const fieldName = nameMatch[1];
                            const valueStart = part.indexOf('\r\n\r\n') + 4;
                            const valueEnd = part.lastIndexOf('\r\n');
                            if (valueStart > 3 && valueEnd > valueStart) {
                                const fieldValue = part.substring(valueStart, valueEnd).trim();
                                if (fieldValue && !fieldValue.includes('Content-Type:')) {
                                    formData[fieldName] = fieldValue;
                                    console.log('📝 Parsed field:', fieldName, '=', fieldValue.substring(0, 50) + (fieldValue.length > 50 ? '...' : ''));
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Try other parsing methods
            const bodyStr = buffer.toString();
            
            try {
                formData = JSON.parse(bodyStr);
                console.log('✅ Parsed as JSON:', Object.keys(formData));
            } catch (jsonError) {
                try {
                    const params = new URLSearchParams(bodyStr);
                    formData = Object.fromEntries(params);
                    console.log('✅ Parsed as URL params:', Object.keys(formData));
                } catch (urlError) {
                    console.warn('⚠️ Could not parse form data');
                }
            }
        }
        
        // Fallback if no fields were parsed
        if (Object.keys(formData).length === 0) {
            console.warn('⚠️ No form fields found, using test data');
            formData = {
                name: 'Test User (Parsing Failed)',
                email: 'test@example.com',
                phone: '123-456-7890',
                eventDate: new Date().toISOString().split('T')[0],
                eventType: 'birthday',
                servingSize: '10-15',
                cakeDetails: 'API test - form parsing failed',
                additionalInfo: 'Form data could not be parsed properly'
            };
        }
        
        console.log('🔄 Final form data:', formData);

        // Skip file upload for now (will implement after basic form works)
        let imageUrl = null;

        // Map form fields to database columns (basic fields only to avoid schema issues)
        const submissionData = {
            name: formData.name || 'Not provided',
            email: formData.email || 'Not provided', 
            phone: formData.phone || 'Not provided',
            event_date: formData['date-needed'] || new Date().toISOString().split('T')[0],
            event_type: formData['event-type'] || 'Not specified',
            serving_size: formData['cake-size'] || 'Not specified',
            cake_details: [
                formData['design-description'] || 'No description provided',
                formData['cake-flavor'] ? `Flavor: ${formData['cake-flavor']}` : null,
                formData['frosting-type'] ? `Frosting: ${formData['frosting-type']}` : null,
                formData['cake-filling'] ? `Filling: ${formData['cake-filling']}` : null,
                formData['color-scheme'] ? `Colors: ${formData['color-scheme']}` : null,
                formData['budget-range'] ? `Budget: ${formData['budget-range']}` : null,
                formData['special-requests'] ? `Special requests: ${formData['special-requests']}` : null,
                formData['additional-notes'] ? `Notes: ${formData['additional-notes']}` : null,
                formData['inspiration-links'] ? `Inspiration: ${formData['inspiration-links']}` : null,
                formData['request-delivery'] === 'delivery' ? `Delivery to: ${formData['event-address']}, ${formData['event-city']} ${formData['event-zip']}`.trim() : null
            ].filter(Boolean).join('; '),
            reference_image: imageUrl,
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
            .insert([submissionData])
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
