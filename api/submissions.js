const { cakeRequestsService } = require('../services/database-server');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    try {
        switch (req.method) {
            case 'GET':
                if (id) {
                    // Get specific submission
                    const result = await cakeRequestsService.getById(id);
                    res.json(result);
                } else {
                    // Get all submissions
                    const result = await cakeRequestsService.getAll();
                    res.json(result);
                }
                break;

            case 'PUT':
                if (!id) {
                    return res.status(400).json({ success: false, error: 'ID required for update' });
                }
                
                const { status, notes } = req.body;
                const updateResult = await cakeRequestsService.updateStatus(id, status, notes);
                res.json(updateResult);
                break;

            case 'DELETE':
                if (!id) {
                    return res.status(400).json({ success: false, error: 'ID required for deletion' });
                }
                
                const deleteResult = await cakeRequestsService.delete(id);
                res.json(deleteResult);
                break;

            default:
                res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error in submissions API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}
