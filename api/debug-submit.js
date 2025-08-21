// Debug endpoint to test form submission step by step
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log('🚀 Debug submit API called');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request headers:', req.headers);

    try {
        // Step 1: Check environment variables
        const envCheck = {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
        };
        console.log('🌍 Environment check:', envCheck);

        if (!envCheck.hasSupabaseUrl || !envCheck.hasServiceKey) {
            return res.status(500).json({
                success: false,
                error: 'Environment variables not configured',
                debug: envCheck
            });
        }

        // Step 2: Test Supabase connection
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

        // Step 3: Test database connection
        const { data: testData, error: testError } = await supabase
            .from('cake_requests')
            .select('*', { count: 'exact', head: true });

        console.log('🧪 Connection test result:', { testData, testError });

        if (testError) {
            return res.status(500).json({
                success: false,
                error: 'Database connection failed',
                debug: {
                    supabaseError: testError,
                    environment: envCheck
                }
            });
        }

        // Step 4: Try a simple insert
        const testSubmission = {
            name: 'Debug Test',
            email: 'debug@test.com',
            phone: '555-0123',
            event_date: new Date().toISOString().split('T')[0],
            event_type: 'test',
            serving_size: '1-5',
            cake_details: 'Debug test submission',
            additional_info: 'Testing API functionality',
            reference_image: null,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('💾 Attempting insert with data:', testSubmission);

        const { data: insertData, error: insertError } = await supabase
            .from('cake_requests')
            .insert([testSubmission])
            .select()
            .single();

        console.log('📊 Insert result:', { insertData, insertError });

        if (insertError) {
            return res.status(500).json({
                success: false,
                error: 'Insert failed',
                debug: {
                    insertError,
                    submissionData: testSubmission,
                    environment: envCheck
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Debug test completed successfully',
            debug: {
                environment: envCheck,
                connectionTest: 'passed',
                insertTest: 'passed',
                insertedId: insertData.id
            }
        });

    } catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            debug: {
                errorStack: error.stack,
                errorName: error.name
            }
        });
    }
};
