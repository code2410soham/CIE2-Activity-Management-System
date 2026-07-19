/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/verify_routing.js
 * Purpose: Automated backend verification of root redirection, index.html delivery,
 *          custom 404 error routing, and guard script presence in template headers.
 */

const http = require('http');

function makeRequest(path, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: path,
            method: 'GET',
            headers: headers
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        req.on('error', (e) => { reject(e); });
        req.end();
    });
}

async function runTests() {
    console.log('==================================================');
    console.log('   RUNNING ROUTING & GUARD INTEGRATION TESTS      ');
    console.log('==================================================');

    let allPassed = true;

    // Test 1: Hit root '/'
    try {
        console.log('Test 1: Requesting root "/"...');
        const res1 = await makeRequest('/');
        const hasText = res1.body.includes('Connecting to CIE-2 Portal');
        console.log(`- Status Code: ${res1.statusCode}`);
        console.log(`- Body contains "Connecting to CIE-2 Portal": ${hasText}`);
        if (res1.statusCode === 200 && hasText) {
            console.log('✅ Test 1 Passed: index.html served at root!');
        } else {
            console.error('❌ Test 1 Failed');
            allPassed = false;
        }
    } catch (err) {
        console.error('❌ Test 1 Failed with error:', err.message);
        allPassed = false;
    }

    // Test 2: Hit /index.html
    try {
        console.log('\nTest 2: Requesting "/index.html"...');
        const res2 = await makeRequest('/index.html');
        const hasText = res2.body.includes('Connecting to CIE-2 Portal');
        console.log(`- Status Code: ${res2.statusCode}`);
        console.log(`- Body contains "Connecting to CIE-2 Portal": ${hasText}`);
        if (res2.statusCode === 200 && hasText) {
            console.log('✅ Test 2 Passed: index.html served at /index.html!');
        } else {
            console.error('❌ Test 2 Failed');
            allPassed = false;
        }
    } catch (err) {
        console.error('❌ Test 2 Failed with error:', err.message);
        allPassed = false;
    }

    // Test 3: Hit invalid page '/invalid-route-name-123'
    try {
        console.log('\nTest 3: Requesting invalid route "/invalid-route-name-123"...');
        const res3 = await makeRequest('/invalid-route-name-123');
        const has404 = res3.body.includes('404');
        const hasLostInSpace = res3.body.includes('Lost in Space?');
        console.log(`- Status Code: ${res3.statusCode}`);
        console.log(`- Body contains "404": ${has404}`);
        console.log(`- Body contains "Lost in Space?": ${hasLostInSpace}`);
        if (res3.statusCode === 404 && hasLostInSpace) {
            console.log('✅ Test 3 Passed: Served custom 404 page for invalid URL!');
        } else {
            console.error('❌ Test 3 Failed');
            allPassed = false;
        }
    } catch (err) {
        console.error('❌ Test 3 Failed with error:', err.message);
        allPassed = false;
    }

    // Test 4: Hit student dashboard
    try {
        console.log('\nTest 4: Requesting Student Dashboard "/frontend/student/dashboard.html"...');
        const res4 = await makeRequest('/frontend/student/dashboard.html');
        const hasTitle = res4.body.includes('Student Dashboard');
        const hasGuard = res4.body.includes('auth-guard.js');
        console.log(`- Status Code: ${res4.statusCode}`);
        console.log(`- Body contains "Student Dashboard": ${hasTitle}`);
        console.log(`- Body contains "auth-guard.js": ${hasGuard}`);
        if (res4.statusCode === 200 && hasTitle && hasGuard) {
            console.log('✅ Test 4 Passed: Dashboard served with route guard script!');
        } else {
            console.error('❌ Test 4 Failed');
            allPassed = false;
        }
    } catch (err) {
        console.error('❌ Test 4 Failed with error:', err.message);
        allPassed = false;
    }

    console.log('\n==================================================');
    if (allPassed) {
        console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!   ');
        process.exit(0);
    } else {
        console.error('🚨 SOME INTEGRATION TESTS FAILED!              ');
        process.exit(1);
    }
}

runTests().catch(console.error);
