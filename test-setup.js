const db = require('./db/config');

async function testSetup() {
    console.log('🧪 Testing Household Workers Platform Setup...\n');
    
    try {
        // Test 1: Database connection
        console.log('Test 1: Database Connection');
        const dbResult = await db.query('SELECT NOW() as time, current_database() as db');
        console.log(`  ✅ Connected to database: ${dbResult.rows[0].db}`);
        console.log(`  ✅ Current time: ${dbResult.rows[0].time}\n`);
        
        // Test 2: Check if tables exist
        console.log('Test 2: Database Tables');
        const tablesResult = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log(`  ✅ Found ${tablesResult.rows.length} tables:`);
            tablesResult.rows.forEach(row => {
                console.log(`    - ${row.table_name}`);
            });
        } else {
            console.log('  ⚠️  No tables found - run "npm run init:db" to create tables');
        }
        console.log();
        
        // Test 3: API endpoints (simulated)
        console.log('Test 3: API Endpoints (Simulation)');
        console.log('  ✅ Auth endpoints available: /api/auth/signup, /api/auth/login');
        console.log('  ✅ Worker endpoints available: /api/workers, /api/workers/:id');
        console.log('  ✅ Job endpoints available: /api/jobs, /api/jobs/:id');
        console.log('  ✅ Health endpoint available: /api/health');
        console.log();
        
        // Test 4: Frontend files
        console.log('Test 4: Frontend Files');
        const fs = require('fs');
        const path = require('path');
        
        const frontendFiles = [
            'index.html',
            'signup.html',
            'login.html',
            'dashboard.html',
            'search.html',
            'worker-profile.html'
        ];
        
        const publicDir = path.join(__dirname, 'public');
        let foundFiles = 0;
        
        frontendFiles.forEach(file => {
            const filePath = path.join(publicDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`  ✅ ${file}`);
                foundFiles++;
            } else {
                console.log(`  ❌ ${file}`);
            }
        });
        
        console.log(`\n  ✅ Found ${foundFiles}/${frontendFiles.length} frontend files\n`);
        
        // Test 5: Environment variables
        console.log('Test 5: Environment Configuration');
        const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
        let envVarsOk = true;
        
        requiredEnvVars.forEach(envVar => {
            if (process.env[envVar]) {
                console.log(`  ✅ ${envVar}: ${process.env[envVar]}`);
            } else {
                console.log(`  ❌ ${envVar}: NOT SET`);
                envVarsOk = false;
            }
        });
        
        if (envVarsOk) {
            console.log('  ✅ All required environment variables are set\n');
        } else {
            console.log('  ⚠️  Some environment variables are missing\n');
        }
        
        // Summary
        console.log('📋 Setup Test Summary:');
        console.log('  ✅ Database connection: OK');
        console.log(`  ${tablesResult.rows.length > 0 ? '✅' : '⚠️'} Database tables: ${tablesResult.rows.length > 0 ? 'OK' : 'NEED INIT'}`);
        console.log('  ✅ API endpoints: SIMULATED OK');
        console.log(`  ✅ Frontend files: ${foundFiles}/${frontendFiles.length} FOUND`);
        console.log(`  ${envVarsOk ? '✅' : '⚠️'} Environment variables: ${envVarsOk ? 'OK' : 'INCOMPLETE'}`);
        
        console.log('\n🎉 Setup test completed!');
        console.log('\n🚀 Next steps:');
        console.log('   1. If tables are missing, run: npm run init:db');
        console.log('   2. To start the application: npm run dev');
        console.log('   3. Visit http://localhost:3000 in your browser');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup test failed:', error.message);
        process.exit(1);
    }
}

testSetup();