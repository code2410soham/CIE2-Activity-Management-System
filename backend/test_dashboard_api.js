const http = require('http');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function testDashboard() {
    const hostname = '127.0.0.1';
    const port = 5000;

    console.log('Logging in to get student token...');
    const loginRes = await makeRequest({
        hostname,
        port,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        role: 'student',
        prn: '125UIT1103',
        password: '125UIT1103'
    });

    if (loginRes.statusCode !== 200 || !loginRes.body.success) {
        console.error('Login failed:', loginRes.body);
        process.exit(1);
    }

    const token = loginRes.body.token;
    console.log('Login successful! Fetching student dashboard data...');

    const dashRes = await makeRequest({
        hostname,
        port,
        path: '/api/v1/student/dashboard',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('Dashboard Status Code:', dashRes.statusCode);
    if (dashRes.statusCode !== 200 || !dashRes.body.success) {
        console.error('Dashboard fetch failed:', dashRes.body);
        process.exit(1);
    }

    console.log('Dashboard Data Verified! Response Summary:');
    console.log('- Student Name:', dashRes.body.student.name);
    console.log('- Student PRN:', dashRes.body.student.prn);
    console.log('- Academic Summary:', dashRes.body.summary);
    console.log('- Total Activities:', dashRes.body.activities.length);
    console.log('- Subject Analytics Count:', dashRes.body.subject_analytics.length);
    console.log('- Upcoming Deadlines Count:', dashRes.body.upcoming_deadlines.length);
    console.log('- Notifications Count:', dashRes.body.notifications.length);
    console.log('- Performance Trend Points:', dashRes.body.performance_trend.length);

    console.log('Writing full response to dashboard_api_result.json...');
    require('fs').writeFileSync('dashboard_api_result.json', JSON.stringify(dashRes.body, null, 2));
    console.log('Dashboard test completed successfully!');
}

testDashboard().catch(console.error);
