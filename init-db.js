const fs = require('fs');
const path = require('path');
const db = require('./db/config');

async function initDatabase() {
    try {
        console.log('Initializing database...');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Define the correct order of table creation to handle dependencies
        const tableCreationOrder = [
            'users',
            'worker_profiles',
            'addresses',
            'availability_slots',
            'jobs',
            'bookings',
            'messages',
            'reviews',
            'documents',
            'payments',
            'admin_logs'
        ];
        
        // Create extensions first
        console.log('Creating extensions...');
        await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        
        // Create tables in the correct order
        console.log('Creating tables...');
        for (const tableName of tableCreationOrder) {
            const createTableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}[^;]+;`, 'gi');
            const match = schemaSQL.match(createTableRegex);
            
            if (match) {
                console.log(`  Creating table: ${tableName}`);
                await db.query(match[0]);
            }
        }
        
        // Add search vector columns after tables are created
        console.log('Adding search vector columns...');
        try {
            await db.query('ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector');
            await db.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector');
        } catch (error) {
            console.log('  Search vector columns may already exist, continuing...');
        }
        
        // Create indexes
        console.log('Creating indexes...');
        const indexStatements = [
            'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)',
            'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
            'CREATE INDEX IF NOT EXISTS idx_worker_profiles_rating ON worker_profiles(rating)',
            'CREATE INDEX IF NOT EXISTS idx_worker_profiles_search ON worker_profiles USING GIN(search_vector)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING GIN(search_vector)'
        ];
        
        for (const indexStatement of indexStatements) {
            try {
                const indexName = indexStatement.match(/idx_[^\s]+/)[0];
                console.log(`  Creating index: ${indexName}`);
                await db.query(indexStatement);
            } catch (error) {
                console.log(`  Index may already exist, continuing...`);
            }
        }
        
        console.log('✅ Database initialization completed successfully!');
        console.log('Tables created:');
        
        // List all tables
        const tablesResult = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

initDatabase();