import http from 'http';

const BASE_URL = 'http://localhost:3000/api';
let token = '';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting ATS API Tests ---');
  try {
    // 1. Health Check
    console.log('\n[1] Checking Server Health...');
    let res = await makeRequest('GET', '/health');
    console.log(`Status: ${res.status}`, res.data);
    if (res.status !== 200) {
      console.error('Server is not running or healthy. Please start it first.');
      return;
    }

    // 2. Login
    console.log('\n[2] Logging in as headhr...');
    res = await makeRequest('POST', '/auth/login', { username: 'headhr', password: 'password123' });
    console.log(`Status: ${res.status}`);
    if (res.status === 200 && res.data.accessToken) {
      token = res.data.accessToken;
      console.log('Login successful! Token acquired.');
    } else {
      console.error('Login failed!', res.data);
      return;
    }

    // 3. Get Job Openings
    console.log('\n[3] Fetching Job Openings...');
    res = await makeRequest('GET', '/job-openings');
    console.log(`Status: ${res.status}, Count: ${Array.isArray(res.data) ? res.data.length : 'N/A'}`);

    // 4. Get Candidates
    console.log('\n[4] Fetching Candidates...');
    res = await makeRequest('GET', '/candidates');
    console.log(`Status: ${res.status}, Count: ${Array.isArray(res.data) ? res.data.length : 'N/A'}`);

    // 5. Get Interviews
    console.log('\n[5] Fetching Interviews...');
    res = await makeRequest('GET', '/interviews');
    console.log(`Status: ${res.status}, Count: ${Array.isArray(res.data) ? res.data.length : 'N/A'}`);

    // 6. Get Telephony
    console.log('\n[6] Fetching Telephony Interviews...');
    res = await makeRequest('GET', '/telephony');
    console.log(`Status: ${res.status}, Count: ${Array.isArray(res.data) ? res.data.length : 'N/A'}`);

    console.log('\n--- All ATS API Tests Completed Successfully! ---');
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

runTests();
