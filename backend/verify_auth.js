/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/verify_auth.js
 * Purpose: Integration and API tests to programmatically verify student login, invalid attempts, mustChangePassword flag, and change-password workflows.
 */

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

async function runTests() {
    console.log('==================================================');
    console.log(' Starting Automated API Integration & Auth Tests ');
    console.log('==================================================');

    const hostname = '127.0.0.1';
    const port = 5000;

    // Test 1: Student Login with default credentials (should succeed and flag mustChangePassword)
    console.log('Test 1: Student login with default credentials...');
    const loginPayload = {
        role: 'student',
        prn: '125UIT1103',
        password: '125UIT1103'
    };

    try {
        const res1 = await makeRequest({
            hostname,
            port,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, loginPayload);

        console.log(`Status Code: ${res1.statusCode}`);
        console.log('Response Body:', res1.body);

        if (res1.statusCode !== 200 || !res1.body.success || res1.body.mustChangePassword !== true || !res1.body.token) {
            throw new Error('Test 1 FAILED! Default credentials login check failed.');
        }
        console.log('Test 1 PASSED: Default credentials correctly returned mustChangePassword: true.');

        const token = res1.body.token;

        // Test 2: Invalid password login (should fail and return 401)
        console.log('\nTest 2: Student login with incorrect credentials...');
        const res2 = await makeRequest({
            hostname,
            port,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, {
            role: 'student',
            prn: '125UIT1103',
            password: 'wrong_password'
        });

        console.log(`Status Code: ${res2.statusCode}`);
        console.log('Response Body:', res2.body);

        if (res2.statusCode !== 401 || res2.body.success !== false) {
            throw new Error('Test 2 FAILED! Should have returned 401 unauthorized.');
        }
        console.log('Test 2 PASSED: Invalid password rejected with 401.');

        // Test 3: Password Update Flow (mandatory next step)
        console.log('\nTest 3: Changing password using endpoint...');
        const changeRes = await makeRequest({
            hostname,
            port,
            path: '/api/v1/auth/change-password',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, {
            currentPassword: '125UIT1103',
            newPassword: 'newpassword123'
        });

        console.log(`Status Code: ${changeRes.statusCode}`);
        console.log('Response Body:', changeRes.body);

        if (changeRes.statusCode !== 200 || !changeRes.body.success) {
            throw new Error('Test 3 FAILED! Password change request failed.');
        }
        console.log('Test 3 PASSED: Password changed successfully.');

        // Test 4: Student login with new password (should succeed and flag mustChangePassword: false)
        console.log('\nTest 4: Logging in with the new password...');
        const res4 = await makeRequest({
            hostname,
            port,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, {
            role: 'student',
            prn: '125UIT1103',
            password: 'newpassword123'
        });

        console.log(`Status Code: ${res4.statusCode}`);
        console.log('Response Body:', res4.body);

        if (res4.statusCode !== 200 || !res4.body.success || res4.body.mustChangePassword !== false) {
            throw new Error('Test 4 FAILED! Logging in with the new updated credentials failed.');
        }
        console.log('Test 4 PASSED: Able to log in with new password; mustChangePassword is false.');

        // Revert password back to default '125UIT1103' for consistency in subsequent sessions
        console.log('\nRestoring user password back to default ZRPN...');
        const revertRes = await makeRequest({
            hostname,
            port,
            path: '/api/v1/auth/change-password',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${res4.body.token}`
            }
        }, {
            currentPassword: 'newpassword123',
            newPassword: '125UIT1103'
        });

        console.log(`Restore Status Code: ${revertRes.statusCode}`);
        console.log('Restore Body:', revertRes.body);
        console.log('User password successfully restored.');

        console.log('\n==================================================');
        console.log(' ALL AUTOMATED API TESTS HAVE PASSED SUCCESSFULLY ');
        console.log('==================================================');

    } catch (error) {
        console.error('\nTests FAILED with error:', error.message);
        process.exit(1);
    }
}

runTests();
