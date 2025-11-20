const http = require('http');

// Test data
const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing API login endpoint...\n');

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`Response Body: ${data}\n`);
        
        try {
            const response = JSON.parse(data);
            if (response.token) {
                console.log('✅ API login successful!');
                console.log(`User: ${response.user.name} (${response.user.email})`);
                console.log(`Role: ${response.user.role}`);
                console.log('Token received (first 50 characters):', response.token.substring(0, 50) + '...');
            } else {
                console.log('❌ API login failed:');
                console.log(response.error || 'Unknown error');
            }
        } catch (error) {
            console.log('❌ Failed to parse response:');
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();