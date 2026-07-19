/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/verify_auth_resilience.js
 * Purpose: Verify that the authentication endpoints always return valid JSON
 *          under all failure conditions:
 *          – Empty request body
 *          – Missing role field
 *          – Invalid credentials
 *          – Valid student login
 */

const http = require('http');

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
            },
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const contentType = res.headers['content-type'] || '';
                let parsed = null;
                let parseError = null;
                try {
                    parsed = data.trim() ? JSON.parse(data) : null;
                } catch (e) {
                    parseError = e.message;
                }
                resolve({ status: res.statusCode, contentType, raw: data, parsed, parseError });
            });
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function assert(label, condition, detail = '') {
    if (condition) {
        console.log(`  ✅ ${label}`);
    } else {
        console.error(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    }
    return condition;
}

async function run() {
    console.log('==================================================');
    console.log('   AUTH RESILIENCE TESTS                         ');
    console.log('==================================================\n');
    let totalPassed = 0, totalFailed = 0;

    function record(passed) {
        if (passed) totalPassed++; else totalFailed++;
    }

    // ── Test 1: Empty body POST ──────────────────────────────────
    console.log('Test 1: POST /api/v1/auth/login with empty body...');
    const t1 = await request('/api/v1/auth/login', 'POST', {});
    record(assert('Status is 400 (not 500)', t1.status === 400, `got ${t1.status}`));
    record(assert('Content-Type is JSON', t1.contentType.includes('application/json'), `got: ${t1.contentType}`));
    record(assert('Body is parseable JSON', t1.parseError === null, t1.parseError));
    record(assert('success === false', t1.parsed?.success === false));
    console.log(`  → Response: ${JSON.stringify(t1.parsed)}\n`);

    // ── Test 2: Missing role ─────────────────────────────────────
    console.log('Test 2: POST /api/v1/auth/login with missing role...');
    const t2 = await request('/api/v1/auth/login', 'POST', { prn: '125UIT1103', password: 'test123' });
    record(assert('Status is 400', t2.status === 400, `got ${t2.status}`));
    record(assert('Content-Type is JSON', t2.contentType.includes('application/json')));
    record(assert('Body is parseable JSON', t2.parseError === null, t2.parseError));
    record(assert('success === false', t2.parsed?.success === false));
    console.log(`  → Response: ${JSON.stringify(t2.parsed)}\n`);

    // ── Test 3: Valid structure, wrong password ──────────────────
    console.log('Test 3: POST /api/v1/auth/login with wrong password...');
    const t3 = await request('/api/v1/auth/login', 'POST', { role: 'student', prn: '125UIT1103', password: 'WRONG_PASS' });
    record(assert('Status is 401', t3.status === 401, `got ${t3.status}`));
    record(assert('Content-Type is JSON', t3.contentType.includes('application/json')));
    record(assert('Body is parseable JSON', t3.parseError === null, t3.parseError));
    record(assert('success === false', t3.parsed?.success === false));
    console.log(`  → Response: ${JSON.stringify(t3.parsed)}\n`);

    // ── Test 4: Invalid API endpoint ────────────────────────────
    console.log('Test 4: GET /api/v1/non-existent route...');
    const t4 = await request('/api/v1/non-existent', 'GET');
    record(assert('Status is 404', t4.status === 404, `got ${t4.status}`));
    record(assert('Content-Type is JSON', t4.contentType.includes('application/json'), `got: ${t4.contentType}`));
    record(assert('Body is parseable JSON', t4.parseError === null, t4.parseError));
    record(assert('success === false', t4.parsed?.success === false));
    console.log(`  → Response: ${JSON.stringify(t4.parsed)}\n`);

    // ── Test 5: Valid student login ──────────────────────────────
    console.log('Test 5: POST /api/v1/auth/login with valid student credentials...');
    const t5 = await request('/api/v1/auth/login', 'POST', { role: 'student', prn: '125UIT1103', password: '125UIT1103' });
    record(assert('Status is 200', t5.status === 200, `got ${t5.status}`));
    record(assert('Content-Type is JSON', t5.contentType.includes('application/json')));
    record(assert('Body is parseable JSON', t5.parseError === null, t5.parseError));
    record(assert('success === true', t5.parsed?.success === true));
    record(assert('token is present', typeof t5.parsed?.token === 'string' && t5.parsed?.token.length > 0));
    console.log(`  → success: ${t5.parsed?.success}, mustChangePassword: ${t5.parsed?.mustChangePassword}\n`);

    // ── Summary ──────────────────────────────────────────────────
    console.log('==================================================');
    console.log(`  Passed: ${totalPassed} | Failed: ${totalFailed}`);
    if (totalFailed === 0) {
        console.log('  🎉 ALL AUTH RESILIENCE TESTS PASSED!');
        process.exit(0);
    } else {
        console.error(`  🚨 ${totalFailed} TEST(S) FAILED.`);
        process.exit(1);
    }
}

run().catch(console.error);
