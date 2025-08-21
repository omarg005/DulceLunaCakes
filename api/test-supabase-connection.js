const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Service Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);
    console.log('Service Key Start:', supabaseServiceKey ? supabaseServiceKey.substring(0, 50) + '...' : 'missing');

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({
            success: false,
            error: 'Missing environment variables',
            details: {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseServiceKey
            }
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
                success: false,
                error: 'Database connection failed',
                supabaseError: error.message,
                details: error
            });
        }

        console.log('✅ Database connection successful');
        res.status(200).json({
            success: true,
            message: 'Supabase connection working',
            url: supabaseUrl,
            keyLength: supabaseServiceKey.length,
            testResult: data
        });

    } catch (error) {
        console.error('❌ Supabase connection error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};
