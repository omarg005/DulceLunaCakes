const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
}) : null;

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!supabase) {
        return res.status(500).json({
            success: false,
            error: 'Supabase not configured'
        });
    }

    const { id } = req.query;

    try {
        switch (req.method) {
            case 'GET':
                if (id) {
                    // Get specific index content
                    const { data, error } = await supabase
                        .from('index_content')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) {
                        return res.json({ success: false, error: error.message });
                    }

                    res.json({ success: true, content: [data] });
                } else {
                    // Get all index content
                    const { data, error } = await supabase
                        .from('index_content')
                        .select('*')
                        .order('order_index', { ascending: true });

                    if (error) {
                        return res.json({ success: false, error: error.message });
                    }

                    res.json({ success: true, content: data });
                }
                break;

            case 'PUT':
                if (!id) {
                    return res.status(400).json({ success: false, error: 'ID required for update' });
                }

                const { title, description, image_url } = req.body;
                
                const updateData = {
                    title,
                    description,
                    updated_at: new Date().toISOString()
                };

                if (image_url) {
                    updateData.image_url = image_url;
                }

                const { data, error } = await supabase
                    .from('index_content')
                    .update(updateData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    return res.json({ success: false, error: error.message });
                }

                res.json({ success: true, content: data });
                break;

            default:
                res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error in index-content API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}
