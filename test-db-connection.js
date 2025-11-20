const db = require('./db/config');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const result = await db.query('SELECT NOW() as now');
        console.log('✅ Database connection successful!');
        console.log('Current time from database:', result.rows[0].now);
        
        // Test if tables exist
        const tablesResult = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log('✅ Database tables found:');
            tablesResult.rows.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });
        } else {
            console.log('ℹ️  No tables found in database');
        }
        
        console.log('✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();