const express = require('express');
const db = require('../db/config');

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
    try {
        // Check database connection
        const dbResult = await db.query('SELECT NOW()');
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                status: 'connected',
                time: dbResult.rows[0].now
            },
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

module.exports = router;