const bcrypt = require('bcrypt');
const db = require('./db/config');

async function createAdmin() {
    try {
        console.log('Creating admin account...');
        
        // Admin user details
        const adminData = {
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '+1234567899',
            role: 'admin',
            password: 'admin123' // You should change this password
        };
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
        
        // Insert admin user into database
        const result = await db.query(
            `INSERT INTO users (name, email, phone, role, hashed_password, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO UPDATE SET 
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             role = EXCLUDED.role,
             hashed_password = EXCLUDED.hashed_password,
             verified = EXCLUDED.verified
             RETURNING id, name, email, role`,
            [
                adminData.name,
                adminData.email,
                adminData.phone,
                adminData.role,
                hashedPassword,
                true // verified
            ]
        );
        
        console.log('✅ Admin account created/updated successfully!');
        console.log('Admin details:');
        console.log(`  ID: ${result.rows[0].id}`);
        console.log(`  Name: ${result.rows[0].name}`);
        console.log(`  Email: ${result.rows[0].email}`);
        console.log(`  Role: ${result.rows[0].role}`);
        console.log('\n🔐 Login credentials:');
        console.log(`  Email: ${adminData.email}`);
        console.log(`  Password: ${adminData.password} (Please change this immediately!)`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin account:', error.message);
        process.exit(1);
    }
}

createAdmin();