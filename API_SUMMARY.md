# GBS Mobile App - API Summary

## Base URL
`https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api`

## Total APIs: 35

### 1. Authentication APIs (4)
- **POST** `/auth/getAccess` - Get access token
- **POST** `/auth/login` - User login
- **POST** `/auth/register` - User registration
- **POST** `/auth/forgot-password` - Password reset

### 2. Mobile Core Navigation APIs (3)
- **GET** `/mobile/sections` - Get active sections
- **GET** `/mobile/sections/:sectionId/categories` - Get categories by section
- **GET** `/mobile/categories/:categoryId/subcategories` - Get subcategories by category

### 3. Mobile Content APIs (3)
- **GET** `/mobile/categories/:categoryId/media` - Get category media (audio/video/pdf)
- **GET** `/mobile/subcategories/:subcategoryId/media` - Get subcategory media
- **GET** `/mobile/media/:mediaId/stream` - Stream media content

### 4. Mobile Dashboard APIs (3)
- **GET** `/mobile/dashboard` - Get mobile dashboard
- **GET** `/mobile/dashboard/top-content` - Get top content from categories
- **GET** `/mobile/categories/popular` - Get popular categories

### 5. Mobile File Serving APIs (1)
- **GET** `/azure-blob/file` - Azure blob file preview with blobUrl parameter

### 6. Mobile Trending Content APIs (4)
- **GET** `/mobile/trending` - Get all trending content
- **GET** `/mobile/trending?type=audio` - Get trending audios
- **GET** `/mobile/trending?type=video` - Get trending videos
- **GET** `/mobile/trending?type=pdf` - Get trending PDFs

### 7. Mobile Featured Content APIs (4)
- **GET** `/mobile/featured` - Get all featured content
- **GET** `/mobile/featured?type=audio` - Get featured audios
- **GET** `/mobile/featured?type=video` - Get featured videos
- **GET** `/mobile/featured?type=pdf` - Get featured PDFs

### 8. Mobile Recommendations APIs (3)
- **GET** `/mobile/recommendations` - Get recommendations by type
- **GET** `/mobile/continue-listening` - Get continue listening content
- **GET** `/mobile/quick-access` - Get quick access content

### 9. Mobile Search APIs (4)
- **GET** `/mobile/search` - Global search all content
- **GET** `/mobile/search?type=audio` - Search audio content
- **GET** `/mobile/search?type=video` - Search video content
- **GET** `/mobile/search?type=pdf` - Search PDF content

### 10. Admin Data Management APIs (4)
- **GET** `/sections` - Get all sections
- **GET** `/categories/list/all` - Get all categories
- **GET** `/subcategories/list/all` - Get all subcategories
- **GET** `/media` - Get all media with filters

### 11. Support APIs (2)
- **POST** `/support/report-issue` - Report issue
- **POST** `/support/feature-request` - Submit feature request

## External APIs

### 12. WhatsApp Business API (3)
- **POST** `https://graph.facebook.com/v18.0/{phone_number_id}/messages` - Send PDF report
- **POST** `https://graph.facebook.com/v18.0/{phone_number_id}/messages` - Send text message
- **POST** `https://graph.facebook.com/v18.0/{phone_number_id}/messages` - Send template message

### 13. Patient Management APIs (9)
- **POST** `/patients` - Create patient
- **GET** `/patients` - Get all patients
- **GET** `/patients/:id` - Get patient by ID
- **PATCH** `/patients/:id` - Update patient
- **DELETE** `/patients/:id` - Delete patient
- **GET** `/patients/search` - Search patients
- **POST** `/patients/reports` - Upload patient report
- **GET** `/patients/:id/reports` - Get patient reports
- **POST** `/patients/reports/share-whatsapp` - Share report via WhatsApp

## API Usage by Category

### Content Management: 17 APIs
- Sections, Categories, Subcategories
- Media streaming and file serving
- Dashboard and popular content

### Search & Discovery: 11 APIs
- Trending content
- Featured content
- Recommendations
- Global search

### Authentication & User: 4 APIs
- Login, register, access tokens
- Password management

### Support & Communication: 5 APIs
- Issue reporting
- Feature requests
- WhatsApp integration

### Healthcare (Patient Management): 9 APIs
- Patient CRUD operations
- Report management
- WhatsApp sharing

## Key Features
- **Authentication**: Bearer token-based
- **Pagination**: Most list APIs support page/limit parameters
- **Media Types**: audio, video, pdf, image
- **File Formats**: mp3, mp4, pdf, jpg, png
- **Search**: Global and type-specific search
- **Azure Integration**: Blob storage for file serving
- **WhatsApp Integration**: Business API for messaging
- **Patient Management**: Complete healthcare workflow

## API Testing
- Postman collection available: `GBS Mobile API (Neel Malvia).postman_collection.json`
- Test script available: `api-test.js`
- Base URL configured for both dev and production environments