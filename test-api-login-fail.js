const http = require('http');

// Test data with wrong password
const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'wrongpassword'
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

console.log('Testing API login endpoint with wrong credentials...\n');

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Body: ${data}\n`);
        
        try {
            const response = JSON.parse(data);
            if (response.error) {
                console.log('✅ Error handling works correctly!');
                console.log(`Error message: ${response.error}`);
            } else {
                console.log('❌ Unexpected response:');
                console.log(data);
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