const db = require('./config');

async function testConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('Database connection successful!');
        console.log('Current time from database:', result.rows[0].now);
    } catch (err) {
        console.error('Database connection failed:', err.message);
    } finally {
        process.exit(0);
    }
}

testConnection();