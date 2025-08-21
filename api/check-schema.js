// Check the actual schema of the cake_requests table
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
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

        // Try to get the first record to see the actual column structure
        const { data: sampleData, error: sampleError } = await supabase
            .from('cake_requests')
            .select('*')
            .limit(1);

        if (sampleError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to query table',
                details: sampleError
            });
        }

        // Get the columns from the sample data
        const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];

        // Also try to insert a minimal record to see what's required
        const minimalTest = {
            name: 'Schema Test',
            email: 'schema@test.com',
            phone: '555-0000'
        };

        const { data: insertTest, error: insertError } = await supabase
            .from('cake_requests')
            .insert([minimalTest])
            .select()
            .single();

        res.status(200).json({
            success: true,
            schema: {
                existingColumns: columns,
                sampleRecord: sampleData[0] || 'No existing records',
                minimalInsertTest: {
                    success: !insertError,
                    error: insertError?.message || null,
                    insertedData: insertTest || null
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};
