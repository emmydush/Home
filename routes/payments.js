const express = require('express');
const db = require('../db/config');

const router = express.Router();

// Create a new payment
router.post('/', async (req, res) => {
    try {
        const { booking_id, payer_id, payee_id, amount } = req.body;
        
        // Validate required fields
        if (!booking_id || !payer_id || !payee_id || !amount) {
            return res.status(400).json({ error: 'Booking ID, payer ID, payee ID, and amount are required' });
        }
        
        // Check if booking exists
        const bookingResult = await db.query(
            'SELECT id, status FROM bookings WHERE id = $1',
            [booking_id]
        );
        
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Check if payer exists
        const payerResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [payer_id]
        );
        
        if (payerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Payer not found' });
        }
        
        // Check if payee exists
        const payeeResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [payee_id]
        );
        
        if (payeeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Payee not found' });
        }
        
        // Insert payment into database
        const query = `
            INSERT INTO payments (booking_id, payer_id, payee_id, amount, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
        `;
        
        const result = await db.query(query, [
            booking_id,
            payer_id,
            payee_id,
            amount
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            payment: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get payments with optional filtering
router.get('/', async (req, res) => {
    try {
        const { user_id, booking_id, status } = req.query;
        
        let query = `
            SELECT p.*, 
                   u1.name as payer_name,
                   u2.name as payee_name,
                   b.title as booking_title
            FROM payments p
            JOIN users u1 ON p.payer_id = u1.id
            JOIN users u2 ON p.payee_id = u2.id
            JOIN bookings b ON p.booking_id = b.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (user_id) {
            query += ` AND (p.payer_id = $${paramCount} OR p.payee_id = $${paramCount})`;
            params.push(user_id);
            paramCount++;
        }
        
        if (booking_id) {
            query += ` AND p.booking_id = $${paramCount}`;
            params.push(booking_id);
            paramCount++;
        }
        
        if (status) {
            query += ` AND p.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        query += ' ORDER BY p.created_at DESC';
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            count: result.rows.length,
            payments: result.rows
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific payment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT p.*, 
                   u1.name as payer_name,
                   u2.name as payee_name,
                   b.title as booking_title
            FROM payments p
            JOIN users u1 ON p.payer_id = u1.id
            JOIN users u2 ON p.payee_id = u2.id
            JOIN bookings b ON p.booking_id = b.id
            WHERE p.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json({
            success: true,
            payment: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update payment status (e.g., complete, refund)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate required fields
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        // Check if payment exists
        const paymentResult = await db.query(
            'SELECT id, status FROM payments WHERE id = $1',
            [id]
        );
        
        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        // Update payment status
        const query = `
            UPDATE payments 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await db.query(query, [status, id]);
        
        res.json({
            success: true,
            message: 'Payment status updated successfully',
            payment: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;