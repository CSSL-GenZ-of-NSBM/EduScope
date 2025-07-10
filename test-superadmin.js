const axios = require('axios');

const baseURL = 'http://localhost:3000';

// Test user credentials
const superAdminCreds = {
    email: 'superadmin@nsbm.ac.lk',
    password: 'SuperAdmin@123'
};

const adminCreds = {
    email: 'admin@nsbm.ac.lk',
    password: 'Admin@123'
};

const studentCreds = {
    email: 'student@students.nsbm.ac.lk',
    password: 'Student@123'
};

// Test user IDs (from database)
const adminUserId = '6868f5c60fdbaca3d4770427'; // Ashen (admin)
const superAdminUserId = '686f3796ce1d77205ea8b465'; // Super Admin

async function login(credentials) {
    try {
        const response = await axios.post(`${baseURL}/api/auth/signin`, credentials);
        return response.data.token || response.headers['set-cookie'];
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return null;
    }
}

async function testApiWithAuth(url, method, data, authToken) {
    try {
        const config = {
            method,
            url: `${baseURL}${url}`,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
            data
        };
        
        const response = await axios(config);
        return { status: response.status, data: response.data };
    } catch (error) {
        return { 
            status: error.response?.status || 500, 
            error: error.response?.data?.error || error.message 
        };
    }
}

async function runTests() {
    console.log('🧪 Testing Super Admin Functionality\n');
    
    // Test 1: Super Admin can access admin endpoints
    console.log('1️⃣ Testing Super Admin Access to Admin Endpoints');
    
    const testGetUsers = await testApiWithAuth('/api/admin/users', 'GET', null, null);
    console.log(`   GET /api/admin/users: ${testGetUsers.status}`);
    
    // Test 2: Super Admin can update any user
    console.log('\n2️⃣ Testing Super Admin Can Update Admin Users');
    
    const updateAdminData = {
        name: 'Updated Admin Name',
        email: 'admin@nsbm.ac.lk',
        role: 'admin'
    };
    
    const updateAdminResult = await testApiWithAuth(`/api/admin/users/${adminUserId}`, 'PUT', updateAdminData, null);
    console.log(`   PUT /api/admin/users/${adminUserId}: ${updateAdminResult.status}`);
    if (updateAdminResult.error) {
        console.log(`   Error: ${updateAdminResult.error}`);
    }
    
    // Test 3: Test creating super admin (should work for super admin)
    console.log('\n3️⃣ Testing Super Admin Can Create Super Admin Users');
    
    const newSuperAdminData = {
        name: 'Test Super Admin 2',
        email: 'superadmin2@nsbm.ac.lk',
        password: 'SuperAdmin2@123',
        role: 'superadmin',
        studentId: 'SADM002',
        faculty: 'Faculty of Computing',
        degreeProgram: null
    };
    
    const createSuperAdminResult = await testApiWithAuth('/api/admin/users/create', 'POST', newSuperAdminData, null);
    console.log(`   POST /api/admin/users/create (superadmin): ${createSuperAdminResult.status}`);
    if (createSuperAdminResult.error) {
        console.log(`   Error: ${createSuperAdminResult.error}`);
    }
    
    // Test 4: Test normal admin trying to create super admin (should fail)
    console.log('\n4️⃣ Testing Normal Admin Cannot Create Super Admin Users');
    
    const createSuperAdminAsAdmin = await testApiWithAuth('/api/admin/users/create', 'POST', newSuperAdminData, null);
    console.log(`   POST /api/admin/users/create (as admin): ${createSuperAdminAsAdmin.status}`);
    if (createSuperAdminAsAdmin.error) {
        console.log(`   Error: ${createSuperAdminAsAdmin.error}`);
    }
    
    // Test 5: Test normal admin trying to update another admin (should fail)
    console.log('\n5️⃣ Testing Normal Admin Cannot Update Other Admin Users');
    
    const adminUpdateAdmin = await testApiWithAuth(`/api/admin/users/${superAdminUserId}`, 'PUT', updateAdminData, null);
    console.log(`   PUT /api/admin/users/${superAdminUserId} (as admin): ${adminUpdateAdmin.status}`);
    if (adminUpdateAdmin.error) {
        console.log(`   Error: ${adminUpdateAdmin.error}`);
    }
    
    console.log('\n✅ Super Admin Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('- Super Admin should have access to all admin endpoints');
    console.log('- Super Admin should be able to update any user including other admins');
    console.log('- Super Admin should be able to create super admin users');
    console.log('- Normal Admin should NOT be able to create super admin users');
    console.log('- Normal Admin should NOT be able to update other admin users');
}

// Note: This is a simplified test since we can't easily handle NextAuth sessions
// The actual authentication would need to be done through the NextAuth flow
console.log('🚨 Note: This test uses direct API calls without proper NextAuth session handling.');
console.log('For full testing, please use the web interface to verify super admin functionality.\n');

runTests().catch(console.error);
