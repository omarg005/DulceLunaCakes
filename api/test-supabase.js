const { testConnection } = require('../services/database-server');

export default async function handler(req, res) {
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

    try {
        const connectionTest = await testConnection();
        
        const response = {
            connected: connectionTest.success,
            supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
            timestamp: new Date().toISOString(),
            details: connectionTest.success ? 'Connection successful' : connectionTest.error
        };

        if (connectionTest.success) {
            res.status(200).json(response);
        } else {
            res.status(500).json(response);
        }
    } catch (error) {
        console.error('Supabase test error:', error);
        res.status(500).json({
            connected: false,
            supabaseConfigured: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
