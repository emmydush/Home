const express = require('express');
const db = require('../db/config');

const router = express.Router();

// Get all workers with optional filtering
router.get('/', async (req, res) => {
    try {
        const { service, location, minRating, maxPrice } = req.query;
        
        let query = `
            SELECT u.id, u.name, u.email, u.phone, u.created_at, u.verified,
                   wp.bio, wp.skills, wp.languages, wp.hourly_rate, wp.service_categories, wp.rating
            FROM users u
            JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.role = 'worker'
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (service) {
            query += ` AND wp.service_categories @> $${paramCount}`;
            params.push(JSON.stringify([service]));
            paramCount++;
        }
        
        if (minRating) {
            query += ` AND wp.rating >= $${paramCount}`;
            params.push(minRating);
            paramCount++;
        }
        
        if (maxPrice) {
            query += ` AND wp.hourly_rate <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }
        
        query += ' ORDER BY wp.rating DESC';
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            count: result.rows.length,
            workers: result.rows
        });
    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific worker by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT u.id, u.name, u.email, u.phone, u.created_at, u.verified,
                   wp.bio, wp.skills, wp.languages, wp.hourly_rate, wp.service_categories, wp.rating
            FROM users u
            JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.id = $1 AND u.role = 'worker'
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        res.json({
            success: true,
            worker: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching worker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create or update worker profile
router.post('/profile', async (req, res) => {
    try {
        const { userId, bio, skills, languages, hourly_rate, service_categories } = req.body;
        
        // Validate required fields
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Check if user exists and is a worker
        const userResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (userResult.rows[0].role !== 'worker') {
            return res.status(403).json({ error: 'User is not a worker' });
        }
        
        // Insert or update worker profile
        const query = `
            INSERT INTO worker_profiles (user_id, bio, skills, languages, hourly_rate, service_categories)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                bio = EXCLUDED.bio,
                skills = EXCLUDED.skills,
                languages = EXCLUDED.languages,
                hourly_rate = EXCLUDED.hourly_rate,
                service_categories = EXCLUDED.service_categories
            RETURNING *
        `;
        
        const result = await db.query(query, [
            userId,
            bio || '',
            skills ? JSON.stringify(skills) : JSON.stringify([]),
            languages || [],
            hourly_rate || 0,
            service_categories ? JSON.stringify(service_categories) : JSON.stringify([])
        ]);
        
        res.json({
            success: true,
            message: 'Worker profile saved successfully',
            profile: result.rows[0]
        });
    } catch (error) {
        console.error('Error saving worker profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;