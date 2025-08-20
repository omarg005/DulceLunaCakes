const { cakeRequestsService } = require('../../../services/database-server');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ 
            success: false, 
            error: 'Submission ID is required' 
        });
    }

    try {
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({ 
                success: false, 
                error: 'Status is required' 
            });
        }

        const result = await cakeRequestsService.updateStatus(id, status, notes);
        res.json(result);
    } catch (error) {
        console.error('Error updating submission status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}
