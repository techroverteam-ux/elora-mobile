// Test function to verify the categories API endpoint
export const testCategoriesApi = async () => {
  const API_URL = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/categories/list/all';
  
  try {
    console.log('Testing Categories API:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Categories API Response:', {
      success: data.success,
      dataLength: data.data?.length || 0,
      message: data.message,
      sampleCategory: data.data?.[0] || null
    });
    
    // Filter and sort for recent categories
    if (data.success && data.data) {
      const recentCategories = data.data
        .filter((category: any) => category.isActive !== false)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);
      
      console.log('Recent Categories (Top 6):', recentCategories.map((cat: any) => ({
        id: cat._id,
        name: cat.name,
        createdAt: cat.createdAt,
        hasImage: !!(cat.headerImage || cat.thumbnailUrl || cat.imageUrl)
      })));
    }
    
    return data;
  } catch (error) {
    console.error('Categories API Test Error:', error);
    throw error;
  }
};

// Call this function to test the API
if (__DEV__) {
  // Uncomment the line below to test the API when the app loads
  // testCategoriesApi();
}