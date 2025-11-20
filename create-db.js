const { Client } = require('pg');

// Connect to PostgreSQL server (not to the specific database)
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'Jesuslove@12',
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // Connect to default database
});

async function createDatabase() {
    try {
        console.log('Connecting to PostgreSQL server...');
        await client.connect();
        console.log('✅ Connected to PostgreSQL server');
        
        const dbName = process.env.DB_NAME || 'household_workers';
        
        // Check if database exists
        const dbCheck = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [dbName]
        );
        
        if (dbCheck.rows.length > 0) {
            console.log(`✅ Database '${dbName}' already exists`);
        } else {
            // Create database
            console.log(`Creating database '${dbName}'...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database '${dbName}' created successfully`);
        }
        
        await client.end();
        console.log('✅ Disconnected from PostgreSQL server');
        
        console.log('\n🎉 Database setup completed!');
        console.log('\nNext steps:');
        console.log('1. Run the database initialization: npm run init:db');
        console.log('2. Optionally seed the database: npm run seed');
        console.log('3. Verify the setup: npm run verify:db');
        console.log('4. Start the application: npm run dev');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('password authentication failed')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check your PostgreSQL password in the .env file');
            console.log('2. Ensure PostgreSQL is running');
            console.log('3. Verify the PostgreSQL user credentials');
        }
        
        await client.end().catch(() => {});
        process.exit(1);
    }
}

createDatabase();