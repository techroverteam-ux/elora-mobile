import axios from 'axios';

// Mock axios for testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Mobile API Tests', () => {
  const BASE_URL = 'https://api.example.com';
  
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  describe('Sections API', () => {
    test('should fetch sections successfully', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Section 1', description: 'Test section' }
        ],
        status: 200,
        statusText: 'OK'
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const response = await axios.get(`${BASE_URL}/sections`);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/sections`);
      expect(response.data).toEqual(mockResponse.data);
      expect(response.status).toBe(200);
    });
  });

  describe('Categories API', () => {
    test('should fetch categories for a section', async () => {
      const sectionId = 1;
      const mockResponse = {
        data: [
          { id: 1, name: 'Category 1', sectionId: 1 }
        ],
        status: 200,
        statusText: 'OK'
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const response = await axios.get(`${BASE_URL}/mobile/sections/${sectionId}/categories`);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/mobile/sections/${sectionId}/categories`);
      expect(response.data).toEqual(mockResponse.data);
    });
  });

  describe('Subcategories API', () => {
    test('should fetch subcategories for a category', async () => {
      const categoryId = 1;
      const mockResponse = {
        data: [
          { id: 1, name: 'Subcategory 1', categoryId: 1 }
        ],
        status: 200,
        statusText: 'OK'
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const response = await axios.get(`${BASE_URL}/mobile/categories/${categoryId}/subcategories`);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/mobile/categories/${categoryId}/subcategories`);
      expect(response.data).toEqual(mockResponse.data);
    });

    test('should fetch subcategories by action button', async () => {
      const params = { sectionId: 1, categoryId: 1, buttonType: 'read' };
      const mockResponse = {
        data: [
          { id: 1, name: 'Subcategory 1', buttonType: 'read' }
        ],
        status: 200,
        statusText: 'OK'
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const url = `${BASE_URL}/subcategories/by-action-button?sectionId=${params.sectionId}&categoryId=${params.categoryId}&buttonType=${params.buttonType}`;
      const response = await axios.get(url);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(url);
      expect(response.data).toEqual(mockResponse.data);
    });
  });

  describe('Category Details API', () => {
    test('should fetch category details', async () => {
      const categoryId = 1;
      const mockResponse = {
        data: {
          id: 1,
          name: 'Category 1',
          description: 'Test category',
          subcategoriesCount: 5
        },
        status: 200,
        statusText: 'OK'
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const response = await axios.get(`${BASE_URL}/categories/${categoryId}`);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/categories/${categoryId}`);
      expect(response.data).toEqual(mockResponse.data);
    });
  });

  describe('Azure Blob API', () => {
    test('should fetch azure blob file', async () => {
      const blobUrl = 'https://storage.blob.core.windows.net/container/file.pdf';
      const mockResponse = {
        data: { fileUrl: 'https://signed-url.com/file.pdf' },
        status: 200,
        statusText: 'OK'
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
      
      const response = await axios.get(`${BASE_URL}/azure-blob/file?blobUrl=${encodeURIComponent(blobUrl)}`);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/azure-blob/file?blobUrl=${encodeURIComponent(blobUrl)}`);
      expect(response.data).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 errors', async () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Section not found' }
        }
      };
      
      mockedAxios.get.mockRejectedValue(error);
      
      try {
        await axios.get(`${BASE_URL}/sections/99999`);
      } catch (e) {
        expect(e).toEqual(error);
      }
    });

    test('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);
      
      try {
        await axios.get(`${BASE_URL}/sections`);
      } catch (e) {
        expect(e.message).toBe('Network Error');
      }
    });
  });
});