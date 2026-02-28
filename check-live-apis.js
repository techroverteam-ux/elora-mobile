const axios = require('axios');

const BASE_URL = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api';

async function checkAPI(endpoint, name) {
  try {
    console.log(`🔍 Testing ${name}...`);
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`✅ ${name}: Status ${response.status}`);
    console.log(`   Data count: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.status || 'Network Error'} - ${error.message}`);
    return false;
  }
}

async function checkLiveAPIs() {
  console.log('🚀 Checking Live Mobile APIs');
  console.log('═'.repeat(40));
  
  const tests = [
    ['/sections', 'Get Sections'],
    ['/mobile/sections/1/categories', 'Get Categories (Section 1)'],
    ['/mobile/categories/1/subcategories', 'Get Subcategories (Category 1)'],
    ['/categories/1', 'Get Category Details (ID: 1)'],
    ['/subcategories/by-action-button?sectionId=1&categoryId=1&buttonType=read', 'Get Subcategories by Action Button']
  ];
  
  let passed = 0;
  
  for (const [endpoint, name] of tests) {
    const success = await checkAPI(endpoint, name);
    if (success) passed++;
    console.log('─'.repeat(40));
  }
  
  console.log(`\n📊 Results: ${passed}/${tests.length} APIs working`);
  console.log(passed === tests.length ? '🎉 All APIs are working!' : '⚠️  Some APIs have issues');
}

checkLiveAPIs();