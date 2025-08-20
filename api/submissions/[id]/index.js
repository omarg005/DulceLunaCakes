const { cakeRequestsService } = require('../../../services/database-server');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ 
            success: false, 
            error: 'Submission ID is required' 
        });
    }

    try {
        switch (req.method) {
            case 'GET':
                // Get specific submission
                const getResult = await cakeRequestsService.getById(id);
                res.json(getResult);
                break;

            case 'DELETE':
                // Delete submission
                const deleteResult = await cakeRequestsService.delete(id);
                res.json(deleteResult);
                break;

            default:
                res.status(405).json({ 
                    success: false, 
                    error: 'Method not allowed' 
                });
        }
    } catch (error) {
        console.error('Error in submission API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}
