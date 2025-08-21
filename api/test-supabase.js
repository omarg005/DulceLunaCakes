const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Service Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);
    console.log('Service Key Start:', supabaseServiceKey ? supabaseServiceKey.substring(0, 50) + '...' : 'missing');

    const response = {
        connected: false,
        supabaseConfigured: !!(supabaseUrl && supabaseServiceKey),
        timestamp: new Date().toISOString(),
        environment: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey,
            url: supabaseUrl,
            keyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
            keyStart: supabaseServiceKey ? supabaseServiceKey.substring(0, 50) + '...' : 'missing'
        }
    };

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({
            ...response,
            error: 'Missing environment variables'
        });
    }

    try {
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('✅ Supabase client created');

        // Test basic connection by trying to read from a table
        console.log('🧪 Testing database connection...');
        const { data, error } = await supabase
            .from('cake_requests')
            .select('count(*)')
            .limit(1);

        if (error) {
            console.error('❌ Database test failed:', error);
            return res.status(500).json({
                ...response,
                error: 'Database connection failed',
                supabaseError: error.message,
                details: error
            });
        }

        console.log('✅ Database connection successful');
        res.status(200).json({
            ...response,
            connected: true,
            message: 'Supabase connection working',
            testResult: data
        });

    } catch (error) {
        console.error('❌ Supabase connection error:', error);
        res.status(500).json({
            ...response,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
