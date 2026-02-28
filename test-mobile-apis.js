const axios = require('axios');

// Configuration
const BASE_URL = 'https://your-api-base-url.com'; // Replace with your actual API base URL
const API_KEY = 'your-api-key'; // Replace with your actual API key if needed

// Test results storage
const testResults = [];

// Helper function to log test results
function logTest(testName, status, response, error = null) {
  const result = {
    test: testName,
    status,
    timestamp: new Date().toISOString(),
    response: response ? {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    } : null,
    error: error ? error.message : null
  };
  
  testResults.push(result);
  console.log(`\n🧪 ${testName}`);
  console.log(`Status: ${status === 'PASS' ? '✅' : '❌'} ${status}`);
  
  if (response) {
    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
  }
  
  if (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('─'.repeat(50));
}

// API Test Functions
async function testGetSections() {
  try {
    const response = await axios.get(`${BASE_URL}/sections`);
    logTest('Get Sections', 'PASS', response);
    return response.data;
  } catch (error) {
    logTest('Get Sections', 'FAIL', null, error);
    return null;
  }
}

async function testGetCategories(sectionId) {
  try {
    const response = await axios.get(`${BASE_URL}/mobile/sections/${sectionId}/categories`);
    logTest(`Get Categories (Section ID: ${sectionId})`, 'PASS', response);
    return response.data;
  } catch (error) {
    logTest(`Get Categories (Section ID: ${sectionId})`, 'FAIL', null, error);
    return null;
  }
}

async function testGetSubcategories(categoryId) {
  try {
    const response = await axios.get(`${BASE_URL}/mobile/categories/${categoryId}/subcategories`);
    logTest(`Get Subcategories (Category ID: ${categoryId})`, 'PASS', response);
    return response.data;
  } catch (error) {
    logTest(`Get Subcategories (Category ID: ${categoryId})`, 'FAIL', null, error);
    return null;
  }
}

async function testGetSubcategoriesByActionButton(sectionId, categoryId, buttonType) {
  try {
    const url = `${BASE_URL}/subcategories/by-action-button?sectionId=${sectionId}&categoryId=${categoryId}&buttonType=${buttonType}`;
    const response = await axios.get(url);
    logTest(`Get Subcategories by Action Button (${buttonType})`, 'PASS', response);
    return response.data;
  } catch (error) {
    logTest(`Get Subcategories by Action Button (${buttonType})`, 'FAIL', null, error);
    return null;
  }
}

async function testGetCategoryDetails(categoryId) {
  try {
    const response = await axios.get(`${BASE_URL}/categories/${categoryId}`);
    logTest(`Get Category Details (ID: ${categoryId})`, 'PASS', response);
    return response.data;
  } catch (error) {
    logTest(`Get Category Details (ID: ${categoryId})`, 'FAIL', null, error);
    return null;
  }
}

async function testGetAzureBlob(blobUrl) {
  try {
    const encodedUrl = encodeURIComponent(blobUrl);
    const response = await axios.get(`${BASE_URL}/azure-blob/file?blobUrl=${encodedUrl}`);
    logTest('Get Azure Blob File', 'PASS', response);
    return response.data;
  } catch (error) {
    logTest('Get Azure Blob File', 'FAIL', null, error);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Mobile API Tests');
  console.log('═'.repeat(50));
  
  // Test 1: Get Sections
  const sections = await testGetSections();
  
  if (sections && sections.length > 0) {
    const firstSection = sections[0];
    const sectionId = firstSection.id;
    
    // Test 2: Get Categories for first section
    const categories = await testGetCategories(sectionId);
    
    if (categories && categories.length > 0) {
      const firstCategory = categories[0];
      const categoryId = firstCategory.id;
      
      // Test 3: Get Subcategories for first category
      await testGetSubcategories(categoryId);
      
      // Test 4: Get Category Details
      await testGetCategoryDetails(categoryId);
      
      // Test 5: Get Subcategories by Action Button
      await testGetSubcategoriesByActionButton(sectionId, categoryId, 'read');
      await testGetSubcategoriesByActionButton(sectionId, categoryId, 'listen');
      await testGetSubcategoriesByActionButton(sectionId, categoryId, 'watch');
    }
  }
  
  // Test 6: Azure Blob (with sample URL)
  const sampleBlobUrl = 'https://yourstorageaccount.blob.core.windows.net/container/sample-file.pdf';
  await testGetAzureBlob(sampleBlobUrl);
  
  // Generate test report
  generateTestReport();
}

// Generate test report
function generateTestReport() {
  console.log('\n📊 TEST REPORT');
  console.log('═'.repeat(50));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ✅ ${passedTests}`);
  console.log(`Failed: ❌ ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  console.log('\n📋 Failed Tests:');
  testResults
    .filter(r => r.status === 'FAIL')
    .forEach(test => {
      console.log(`❌ ${test.test}: ${test.error}`);
    });
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('mobile-api-test-results.json', JSON.stringify(testResults, null, 2));
  console.log('\n💾 Test results saved to: mobile-api-test-results.json');
}

// Custom test scenarios
async function runCustomTests() {
  console.log('\n🎯 Running Custom Test Scenarios');
  console.log('═'.repeat(50));
  
  // Test with specific IDs (replace with your actual IDs)
  await testGetCategories(1);
  await testGetSubcategories(1);
  await testGetCategoryDetails(1);
  
  // Test error scenarios
  await testGetCategories(99999); // Non-existent section
  await testGetSubcategories(99999); // Non-existent category
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ Performance Test');
  console.log('═'.repeat(50));
  
  const startTime = Date.now();
  
  // Run multiple concurrent requests
  const promises = [
    testGetSections(),
    testGetCategories(1),
    testGetSubcategories(1),
    testGetCategoryDetails(1)
  ];
  
  await Promise.all(promises);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`⏱️  Total execution time: ${duration}ms`);
  console.log(`📈 Average time per request: ${(duration / promises.length).toFixed(2)}ms`);
}

// Run tests based on command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--custom')) {
    await runCustomTests();
  } else if (args.includes('--performance')) {
    await performanceTest();
  } else if (args.includes('--all')) {
    await runAllTests();
    await runCustomTests();
    await performanceTest();
  } else {
    await runAllTests();
  }
}

// Export for use in other files
module.exports = {
  testGetSections,
  testGetCategories,
  testGetSubcategories,
  testGetSubcategoriesByActionButton,
  testGetCategoryDetails,
  testGetAzureBlob,
  runAllTests
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}