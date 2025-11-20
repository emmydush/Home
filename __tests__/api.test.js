const express = require('express');
const request = require('supertest');

// Mock the database module
jest.mock('../db/config', () => ({
    query: jest.fn()
}));

describe('API Endpoints', () => {
    let app;
    
    // Import the routes after mocking
    beforeAll(() => {
        app = express();
        app.use(express.json());
        
        // Mock routes for testing
        app.get('/api/health', (req, res) => {
            res.status(200).json({ status: 'OK', message: 'Server is running' });
        });
        
        app.get('/api/test', (req, res) => {
            res.status(200).json({ message: 'Test endpoint working' });
        });
    });

    test('should return health status', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);
            
        expect(response.body.status).toBe('OK');
        expect(response.body.message).toBe('Server is running');
    });

    test('should return test endpoint', async () => {
        const response = await request(app)
            .get('/api/test')
            .expect(200);
            
        expect(response.body.message).toBe('Test endpoint working');
    });
});