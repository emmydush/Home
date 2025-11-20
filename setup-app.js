const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Household Workers Platform Setup...\n');

// Function to run a command and wait for it to complete
function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Running: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            ...options
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function setupApplication() {
    try {
        // Step 1: Test database connection
        console.log('📋 Step 1: Testing database connection...');
        await runCommand('npm', ['run', 'test:db:connection']);
        
        // Step 2: Initialize database schema
        console.log('\n📋 Step 2: Initializing database schema...');
        await runCommand('npm', ['run', 'init:db']);
        
        // Step 3: Verify database setup
        console.log('\n📋 Step 3: Verifying database setup...');
        await runCommand('npm', ['run', 'verify:db']);
        
        // Step 4: Seed database with sample data
        console.log('\n📋 Step 4: Seeding database with sample data...');
        await runCommand('npm', ['run', 'seed']);
        
        // Step 5: Start the application
        console.log('\n📋 Step 5: Starting the application...');
        console.log('✅ Setup completed successfully!');
        console.log('\n🎉 You can now start the application with:');
        console.log('   npm start');
        console.log('\n📝 Or for development:');
        console.log('   npm run dev');
        console.log('\n🌐 The application will be available at http://localhost:3000');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure PostgreSQL is running');
        console.log('2. Verify your database credentials in the .env file');
        console.log('3. Check that the database "household_workers" exists');
        console.log('4. Ensure you have the necessary permissions');
        process.exit(1);
    }
}

// Run the setup
setupApplication();