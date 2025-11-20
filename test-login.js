const db = require('./db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function testLogin() {
    try {
        console.log('Testing login functionality...\n');
        
        // Test credentials
        const testCredentials = {
            email: 'admin@example.com',
            password: 'admin123'
        };
        
        console.log('Attempting to login with credentials:');
        console.log(`Email: ${testCredentials.email}`);
        console.log(`Password: ${testCredentials.password}\n`);
        
        // Find user in database
        const userResult = await db.query(
            'SELECT id, name, email, role, hashed_password FROM users WHERE email = $1',
            [testCredentials.email]
        );
        
        if (userResult.rows.length === 0) {
            console.log('❌ Login failed: User not found');
            process.exit(1);
        }
        
        const user = userResult.rows[0];
        console.log('✅ User found in database');
        console.log(`User ID: ${user.id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Role: ${user.role}\n`);
        
        // Check password
        const isPasswordValid = await bcrypt.compare(testCredentials.password, user.hashed_password);
        
        if (!isPasswordValid) {
            console.log('❌ Login failed: Invalid password');
            process.exit(1);
        }
        
        console.log('✅ Password validation successful\n');
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'household_workers_secret_key',
            { expiresIn: '24h' }
        );
        
        console.log('✅ JWT token generated successfully');
        console.log(`Token: ${token}\n`);
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'household_workers_secret_key');
        console.log('✅ Token verification successful');
        console.log('Decoded token payload:');
        console.log(`  User ID: ${decoded.userId}`);
        console.log(`  Name: ${decoded.name}`);
        console.log(`  Role: ${decoded.role}`);
        console.log(`  Expires: ${new Date(decoded.exp * 1000).toLocaleString()}\n`);
        
        console.log('🎉 Login test completed successfully!');
        console.log('\n🔐 Login credentials are working correctly.');
        console.log('You can now login through the web interface at http://localhost:3000/login.html');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Login test failed:', error.message);
        process.exit(1);
    }
}

testLogin();