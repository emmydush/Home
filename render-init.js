const { Client } = require('pg');
const fs = require('fs').promises;

async function initDatabase() {
    console.log('🚀 Initializing Render database...');
    
    // Get database connection details from environment variables
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL environment variable not set');
        process.exit(1);
    }
    
    let client;
    
    try {
        // Connect to the database
        client = new Client({
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
        
        // Execute the schema
        console.log('💾 Executing database schema...');
        await client.query(schemaSql);
        console.log('✅ Database schema executed successfully');
        
        // Insert default admin user if it doesn't exist
        console.log('👤 Creating default admin user...');
        const adminCheck = await client.query(
            "SELECT id FROM users WHERE email = 'admin@example.com'"
        );
        
        if (adminCheck.rows.length === 0) {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const defaultPassword = 'admin123';
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
            
            await client.query(
                `INSERT INTO users (name, email, role, hashed_password, verified) 
                 VALUES ($1, $2, $3, $4, $5)`,
                ['Admin User', 'admin@example.com', 'admin', hashedPassword, true]
            );
            console.log('✅ Default admin user created');
            console.log('🔑 Admin login credentials:');
            console.log('   Email: admin@example.com');
            console.log('   Password: admin123');
            console.log('⚠️  Please change the default password after first login!');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
        
        await client.end();
        console.log('🎉 Database initialization completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        if (client) {
            await client.end();
        }
        process.exit(1);
    }
}

// Run the initialization
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };