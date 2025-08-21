const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    try {
        // Initialize Supabase client
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

        switch (req.method) {
            case 'GET':
                if (id) {
                    // Get specific submission
                    const { data, error } = await supabase
                        .from('cake_requests')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) {
                        return res.status(500).json({
                            success: false,
                            error: error.message
                        });
                    }

                    res.json({
                        success: true,
                        data
                    });
                } else {
                    // Get all submissions
                    const { data, error } = await supabase
                        .from('cake_requests')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) {
                        return res.status(500).json({
                            success: false,
                            error: error.message,
                            submissions: []
                        });
                    }

                    console.log(`✅ Retrieved ${data?.length || 0} submissions from Supabase`);
                    res.json({
                        success: true,
                        submissions: data || []
                    });
                }
                break;

            case 'PUT':
                if (!id) {
                    return res.status(400).json({ success: false, error: 'ID required for update' });
                }
                
                // Parse request body for status update
                const chunks = [];
                for await (const chunk of req) {
                    chunks.push(chunk);
                }
                const body = Buffer.concat(chunks).toString();
                const { status, notes } = JSON.parse(body);

                const { data, error } = await supabase
                    .from('cake_requests')
                    .update({
                        status,
                        admin_notes: notes || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    return res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }

                res.json({
                    success: true,
                    data,
                    message: 'Request status updated successfully'
                });
                break;

            case 'DELETE':
                if (!id) {
                    return res.status(400).json({ success: false, error: 'ID required for deletion' });
                }
                
                const { error: deleteError } = await supabase
                    .from('cake_requests')
                    .delete()
                    .eq('id', id);

                if (deleteError) {
                    return res.status(500).json({
                        success: false,
                        error: deleteError.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Request deleted successfully'
                });
                break;

            default:
                res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error in submissions API:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        });
    }
};