const https = require('https');
const http = require('http');

const BASE_URL = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api';

let authToken = '';
let sectionId = '';
let categoryId = '';
let subcategoryId = '';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testGetAccess() {
  console.log('\n🔑 Testing Get Access Token...');
  try {
    const response = await makeRequest(`${BASE_URL}/auth/getAccess`, {
      method: 'POST',
      body: {
        apiKey: 'GBS-KEY',
        userName: 'Geeta Bal Sankar',
        password: 'GBS@2025'
      }
    });
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Access token obtained successfully');
      return true;
    } else {
      console.log('❌ Failed to get access token:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n👤 Testing Login...');
  try {
    const response = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'test@gbs.com',
        password: 'password123'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(response.status === 200 ? '✅ Login successful' : '❌ Login failed:', response.data);
    return response.status === 200;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testGetSections() {
  console.log('\n📂 Testing Get Active Sections...');
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/sections`);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200 && response.data.data && response.data.data.length > 0) {
      sectionId = response.data.data[0]._id;
      console.log('✅ Sections retrieved successfully');
      console.log(`First section ID: ${sectionId}`);
      return true;
    } else {
      console.log('❌ Failed to get sections:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testGetCategories() {
  console.log('\n📁 Testing Get Categories by Section...');
  if (!sectionId) {
    console.log('❌ No section ID available');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/sections/${sectionId}/categories`);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200 && response.data.data && response.data.data.length > 0) {
      categoryId = response.data.data[0]._id;
      console.log('✅ Categories retrieved successfully');
      console.log(`First category ID: ${categoryId}`);
      return true;
    } else {
      console.log('❌ Failed to get categories:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testGetSubcategories() {
  console.log('\n📄 Testing Get Subcategories by Category...');
  if (!categoryId) {
    console.log('❌ No category ID available');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/categories/${categoryId}/subcategories`);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      if (response.data.data && response.data.data.length > 0) {
        subcategoryId = response.data.data[0]._id;
        console.log('✅ Subcategories retrieved successfully');
        console.log(`First subcategory ID: ${subcategoryId}`);
      } else {
        console.log('✅ No subcategories found (this is normal)');
      }
      return true;
    } else {
      console.log('❌ Failed to get subcategories:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testGetMedia(type = 'audio') {
  console.log(`\n🎵 Testing Get ${type.toUpperCase()} Media...`);
  if (!categoryId) {
    console.log('❌ No category ID available');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/categories/${categoryId}/media?type=${type}&page=1&limit=5`);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log(`✅ ${type} media retrieved successfully`);
      if (response.data.data && response.data.data.length > 0) {
        console.log(`Found ${response.data.data.length} ${type} items`);
      }
      return true;
    } else {
      console.log(`❌ Failed to get ${type} media:`, response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testDashboard() {
  console.log('\n🏠 Testing Dashboard...');
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/dashboard`);
    
    console.log(`Status: ${response.status}`);
    console.log(response.status === 200 ? '✅ Dashboard retrieved successfully' : '❌ Dashboard failed:', response.data);
    return response.status === 200;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testTrending() {
  console.log('\n🔥 Testing Trending Content...');
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/trending?days=7&limit=10`);
    
    console.log(`Status: ${response.status}`);
    console.log(response.status === 200 ? '✅ Trending content retrieved successfully' : '❌ Trending failed:', response.data);
    return response.status === 200;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testFeatured() {
  console.log('\n⭐ Testing Featured Content...');
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/featured?limit=10`);
    
    console.log(`Status: ${response.status}`);
    console.log(response.status === 200 ? '✅ Featured content retrieved successfully' : '❌ Featured failed:', response.data);
    return response.status === 200;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testSearch() {
  console.log('\n🔍 Testing Search...');
  try {
    const response = await makeRequest(`${BASE_URL}/mobile/search?q=krishna&page=1&limit=5`);
    
    console.log(`Status: ${response.status}`);
    console.log(response.status === 200 ? '✅ Search working successfully' : '❌ Search failed:', response.data);
    return response.status === 200;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting GBS API Tests...\n');
  console.log('Base URL:', BASE_URL);
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  const tests = [
    { name: 'Get Access Token', fn: testGetAccess },
    { name: 'Login', fn: testLogin },
    { name: 'Get Sections', fn: testGetSections },
    { name: 'Get Categories', fn: testGetCategories },
    { name: 'Get Subcategories', fn: testGetSubcategories },
    { name: 'Get Audio Media', fn: () => testGetMedia('audio') },
    { name: 'Get Video Media', fn: () => testGetMedia('video') },
    { name: 'Get PDF Media', fn: () => testGetMedia('pdf') },
    { name: 'Dashboard', fn: testDashboard },
    { name: 'Trending Content', fn: testTrending },
    { name: 'Featured Content', fn: testFeatured },
    { name: 'Search', fn: testSearch }
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! APIs are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API endpoints.');
  }
}

// Run the tests
runAllTests().catch(console.error);