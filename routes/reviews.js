const express = require('express');
const db = require('../db/config');

const router = express.Router();

// Create a new review
router.post('/', async (req, res) => {
    try {
        const { booking_id, reviewer_id, reviewee_id, rating, comment } = req.body;
        
        // Validate required fields
        if (!booking_id || !reviewer_id || !reviewee_id || !rating) {
            return res.status(400).json({ error: 'Booking ID, reviewer ID, reviewee ID, and rating are required' });
        }
        
        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        // Check if booking exists
        const bookingResult = await db.query(
            'SELECT id, status FROM bookings WHERE id = $1',
            [booking_id]
        );
        
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Check if reviewer exists
        const reviewerResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [reviewer_id]
        );
        
        if (reviewerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Reviewer not found' });
        }
        
        // Check if reviewee exists
        const revieweeResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [reviewee_id]
        );
        
        if (revieweeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Reviewee not found' });
        }
        
        // Check if reviewer and reviewee are different
        if (reviewer_id === reviewee_id) {
            return res.status(400).json({ error: 'Reviewer and reviewee cannot be the same user' });
        }
        
        // Check if review already exists for this booking
        const existingReview = await db.query(
            'SELECT id FROM reviews WHERE booking_id = $1 AND reviewer_id = $2',
            [booking_id, reviewer_id]
        );
        
        if (existingReview.rows.length > 0) {
            return res.status(409).json({ error: 'Review already exists for this booking' });
        }
        
        // Insert review into database
        const query = `
            INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            booking_id,
            reviewer_id,
            reviewee_id,
            rating,
            comment || ''
        ]);
        
        // Update worker's average rating
        await updateWorkerRating(reviewee_id);
        
        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get reviews with optional filtering
router.get('/', async (req, res) => {
    try {
        const { user_id, booking_id, reviewer_id, reviewee_id } = req.query;
        
        let query = `
            SELECT r.*, 
                   u1.name as reviewer_name,
                   u2.name as reviewee_name,
                   b.title as booking_title
            FROM reviews r
            JOIN users u1 ON r.reviewer_id = u1.id
            JOIN users u2 ON r.reviewee_id = u2.id
            JOIN bookings b ON r.booking_id = b.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (user_id) {
            query += ` AND (r.reviewer_id = $${paramCount} OR r.reviewee_id = $${paramCount})`;
            params.push(user_id);
            paramCount++;
        }
        
        if (booking_id) {
            query += ` AND r.booking_id = $${paramCount}`;
            params.push(booking_id);
            paramCount++;
        }
        
        if (reviewer_id) {
            query += ` AND r.reviewer_id = $${paramCount}`;
            params.push(reviewer_id);
            paramCount++;
        }
        
        if (reviewee_id) {
            query += ` AND r.reviewee_id = $${paramCount}`;
            params.push(reviewee_id);
            paramCount++;
        }
        
        query += ' ORDER BY r.created_at DESC';
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            count: result.rows.length,
            reviews: result.rows
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific review by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT r.*, 
                   u1.name as reviewer_name,
                   u2.name as reviewee_name,
                   b.title as booking_title
            FROM reviews r
            JOIN users u1 ON r.reviewer_id = u1.id
            JOIN users u2 ON r.reviewee_id = u2.id
            JOIN bookings b ON r.booking_id = b.id
            WHERE r.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        res.json({
            success: true,
            review: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update worker's average rating
async function updateWorkerRating(workerId) {
    try {
        // Calculate average rating for the worker
        const avgRatingResult = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE reviewee_id = $1',
            [workerId]
        );
        
        if (avgRatingResult.rows.length > 0) {
            const avgRating = parseFloat(avgRatingResult.rows[0].avg_rating) || 0;
            const reviewCount = parseInt(avgRatingResult.rows[0].review_count) || 0;
            
            // Update worker profile with new average rating
            await db.query(
                'UPDATE worker_profiles SET rating = $1 WHERE user_id = $2',
                [avgRating, workerId]
            );
            
            console.log(`Updated worker ${workerId} rating to ${avgRating} based on ${reviewCount} reviews`);
        }
    } catch (error) {
        console.error('Error updating worker rating:', error);
    }
}

module.exports = router;