const db = require('./db/config');

async function verifyDatabase() {
    try {
        console.log('Verifying database setup...');
        
        // Check if database exists and is accessible
        const dbCheck = await db.query('SELECT current_database() as db_name');
        console.log(`✅ Connected to database: ${dbCheck.rows[0].db_name}`);
        
        // Check if all required tables exist
        const requiredTables = [
            'users', 'worker_profiles', 'addresses', 'availability_slots',
            'jobs', 'bookings', 'messages', 'reviews', 'documents',
            'payments', 'admin_logs'
        ];
        
        const tableCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ANY($1)
            ORDER BY table_name
        `, [requiredTables]);
        
        const existingTables = tableCheck.rows.map(row => row.table_name);
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        
        if (missingTables.length === 0) {
            console.log('✅ All required tables exist:');
            existingTables.forEach(table => console.log(`  - ${table}`));
        } else {
            console.log('❌ Missing tables:');
            missingTables.forEach(table => console.log(`  - ${table}`));
            console.log('Existing tables:');
            existingTables.forEach(table => console.log(`  - ${table}`));
        }
        
        // Check if we can insert a test user
        console.log('\nTesting user insertion...');
        const testUser = await db.query(`
            INSERT INTO users (name, email, phone, role, hashed_password, verified)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE SET last_login = NOW()
            RETURNING id, name, email
        `, [
            'Test User',
            'test@example.com',
            '+1234567890',
            'employer',
            '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012',
            true
        ]);
        
        console.log(`✅ Test user operation successful: ${testUser.rows[0].name} (${testUser.rows[0].email})`);
        
        // Clean up test user
        await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
        console.log('✅ Test user cleaned up');
        
        console.log('\n✅ Database verification completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database verification failed:', error.message);
        process.exit(1);
    }
}

verifyDatabase();