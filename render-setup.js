const { Client } = require('pg');
const fs = require('fs').promises;

async function setupDatabase() {
    console.log('🚀 Starting Render database setup...');
    
    // Get database connection details from environment variables
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL environment variable not set');
        process.exit(1);
    }
    
    try {
        // Connect to the database
        const client = new Client({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        await client.connect();
        console.log('✅ Connected to database');
        
        // Read the schema file
        console.log('📋 Reading database schema...');
        const schemaSql = await fs.readFile('./db/schema.sql', 'utf8');
        
        // Split the schema into individual statements
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        console.log(`⚙️  Executing ${statements.length} database statements...`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await client.query(statement);
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                } catch (error) {
                    // Skip errors for CREATE EXTENSION if it already exists
                    if (error.message.includes('already exists')) {
                        console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
                    } else {
                        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                        throw error;
                    }
                }
            }
        }
        
        console.log('📋 Reading seed data...');
        const seedSql = await fs.readFile('./db/seed.js', 'utf8');
        
        // Execute seed data
        await client.query(seedSql);
        console.log('✅ Seed data inserted successfully');
        
        await client.end();
        console.log('🎉 Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

// Run the setup if this script is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };