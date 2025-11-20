const jwt = require('jsonwebtoken');
const db = require('../db/config');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        try {
            // Check if user still exists
            const result = await db.query(
                'SELECT id, name, email, role FROM users WHERE id = $1',
                [decoded.userId]
            );
            
            if (result.rows.length === 0) {
                return res.status(403).json({ error: 'User no longer exists' });
            }
            
            req.user = result.rows[0];
            next();
        } catch (error) {
            console.error('Error verifying user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
}

function authorizeRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};