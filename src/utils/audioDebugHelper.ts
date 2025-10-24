// Debug helper for audio URL testing
export const testAudioUrl = async (url: string): Promise<{ success: boolean; error?: string; details?: any }> => {
  console.log('testAudioUrl: Testing URL:', url);
  
  try {
    // First test with HEAD request
    const headResponse = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'Accept': 'audio/*',
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log('testAudioUrl: HEAD response:', {
      status: headResponse.status,
      statusText: headResponse.statusText,
      headers: Object.fromEntries(headResponse.headers.entries())
    });
    
    if (!headResponse.ok) {
      return {
        success: false,
        error: `HEAD request failed: ${headResponse.status} ${headResponse.statusText}`,
        details: {
          status: headResponse.status,
          statusText: headResponse.statusText,
          headers: Object.fromEntries(headResponse.headers.entries())
        }
      };
    }
    
    // Test with GET request to get actual data
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'audio/*',
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log('testAudioUrl: GET response:', {
      status: getResponse.status,
      statusText: getResponse.statusText,
      contentType: getResponse.headers.get('content-type'),
      contentLength: getResponse.headers.get('content-length')
    });
    
    if (!getResponse.ok) {
      return {
        success: false,
        error: `GET request failed: ${getResponse.status} ${getResponse.statusText}`,
        details: {
          status: getResponse.status,
          statusText: getResponse.statusText,
          contentType: getResponse.headers.get('content-type'),
          contentLength: getResponse.headers.get('content-length')
        }
      };
    }
    
    // Check if we got actual audio data
    const contentType = getResponse.headers.get('content-type');
    const contentLength = getResponse.headers.get('content-length');
    
    if (!contentType?.includes('audio') && !contentType?.includes('octet-stream')) {
      return {
        success: false,
        error: `Invalid content type: ${contentType}`,
        details: {
          contentType,
          contentLength
        }
      };
    }
    
    return {
      success: true,
      details: {
        contentType,
        contentLength,
        status: getResponse.status
      }
    };
    
  } catch (error) {
    console.error('testAudioUrl: Error testing URL:', error);
    return {
      success: false,
      error: `Network error: ${error}`,
      details: { error: String(error) }
    };
  }
};

// Test Azure API proxy endpoint
export const testAzureApiProxy = async (blobUrl: string): Promise<{ success: boolean; error?: string; proxyUrl?: string }> => {
  const baseApiUrl = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api';
  const encodedBlobUrl = encodeURIComponent(blobUrl);
  const proxyUrl = `${baseApiUrl}/azure-blob/file?blobUrl=${encodedBlobUrl}`;
  
  console.log('testAzureApiProxy: Testing proxy URL:', proxyUrl);
  console.log('testAzureApiProxy: Original blob URL:', blobUrl);
  
  const result = await testAudioUrl(proxyUrl);
  
  return {
    ...result,
    proxyUrl
  };
};

// Debug function to test multiple URL formats
export const debugAudioUrls = async (item: any) => {
  console.log('debugAudioUrls: Testing all available URLs for item:', item?.title);
  
  const urls = [
    { name: 'streamingUrl', url: item?.streamingUrl },
    { name: 'audioUrl', url: item?.audioUrl },
    { name: 'url', url: item?.url }
  ].filter(entry => entry.url);
  
  const results = [];
  
  for (const { name, url } of urls) {
    console.log(`debugAudioUrls: Testing ${name}:`, url);
    
    // Test direct URL
    const directResult = await testAudioUrl(url);
    results.push({
      name: `${name} (direct)`,
      url,
      result: directResult
    });
    
    // If it's a blob URL, test with proxy
    if (url.includes('blob.core.windows.net')) {
      const proxyResult = await testAzureApiProxy(url);
      results.push({
        name: `${name} (proxy)`,
        url: proxyResult.proxyUrl,
        result: proxyResult
      });
    }
  }
  
  console.log('debugAudioUrls: All test results:', results);
  return results;
};