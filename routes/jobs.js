const express = require('express');
const db = require('../db/config');

const router = express.Router();

// Create a new job
router.post('/', async (req, res) => {
    try {
        const { employer_id, title, description, service_type, start_time, end_time, address_id, price_estimate } = req.body;
        
        // Validate required fields
        if (!employer_id || !title || !service_type) {
            return res.status(400).json({ error: 'Employer ID, title, and service type are required' });
        }
        
        // Check if employer exists
        const employerResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [employer_id]
        );
        
        if (employerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Employer not found' });
        }
        
        if (employerResult.rows[0].role !== 'employer') {
            return res.status(403).json({ error: 'User is not an employer' });
        }
        
        // Insert job into database
        const query = `
            INSERT INTO jobs (employer_id, title, description, service_type, start_time, end_time, address_id, price_estimate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            employer_id,
            title,
            description || '',
            service_type,
            start_time || null,
            end_time || null,
            address_id || null,
            price_estimate || null
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get jobs with optional filtering
router.get('/', async (req, res) => {
    try {
        const { employer_id, status, service_type } = req.query;
        
        let query = `
            SELECT j.*, u.name as employer_name
            FROM jobs j
            JOIN users u ON j.employer_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (employer_id) {
            query += ` AND j.employer_id = $${paramCount}`;
            params.push(employer_id);
            paramCount++;
        }
        
        if (status) {
            query += ` AND j.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        if (service_type) {
            query += ` AND j.service_type = $${paramCount}`;
            params.push(service_type);
            paramCount++;
        }
        
        query += ' ORDER BY j.id DESC';
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            count: result.rows.length,
            jobs: result.rows
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific job by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT j.*, u.name as employer_name
            FROM jobs j
            JOIN users u ON j.employer_id = u.id
            WHERE j.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.json({
            success: true,
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Apply for a job (create booking)
router.post('/:id/apply', async (req, res) => {
    try {
        const { id } = req.params;
        const { worker_id } = req.body;
        
        // Validate required fields
        if (!worker_id) {
            return res.status(400).json({ error: 'Worker ID is required' });
        }
        
        // Check if job exists
        const jobResult = await db.query(
            'SELECT id, employer_id, status FROM jobs WHERE id = $1',
            [id]
        );
        
        if (jobResult.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        const job = jobResult.rows[0];
        
        if (job.status !== 'open') {
            return res.status(400).json({ error: 'Job is not open for applications' });
        }
        
        // Check if worker exists
        const workerResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [worker_id]
        );
        
        if (workerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        
        if (workerResult.rows[0].role !== 'worker') {
            return res.status(403).json({ error: 'User is not a worker' });
        }
        
        // Check if already applied
        const existingApplication = await db.query(
            'SELECT id FROM bookings WHERE job_id = $1 AND worker_id = $2',
            [id, worker_id]
        );
        
        if (existingApplication.rows.length > 0) {
            return res.status(409).json({ error: 'Already applied for this job' });
        }
        
        // Create booking
        const query = `
            INSERT INTO bookings (job_id, worker_id, employer_id, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *
        `;
        
        const result = await db.query(query, [id, worker_id, job.employer_id]);
        
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            booking: result.rows[0]
        });
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;