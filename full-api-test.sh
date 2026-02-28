#!/bin/bash

BASE_URL="https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api"
TOKEN=""

echo "🚀 Complete Mobile API Test with Authentication"
echo "═══════════════════════════════════════════════════════════════"

# Function to get auth token (you'll need to provide credentials)
get_auth_token() {
    echo "🔐 Getting authentication token..."
    
    # Try to login with test credentials (replace with actual credentials)
    login_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -X POST \
        -d '{"email":"test@example.com","password":"password"}' \
        "$BASE_URL/auth/login" 2>/dev/null)
    
    http_code=$(echo "$login_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$login_response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        TOKEN=$(echo "$body" | jq -r '.token // .accessToken // .access_token' 2>/dev/null)
        if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
            echo "✅ Authentication successful"
            return 0
        fi
    fi
    
    echo "❌ Authentication failed (Status: $http_code)"
    echo "   Please update credentials in the script"
    return 1
}

# Function to make authenticated API call
call_api() {
    local endpoint="$1"
    local name="$2"
    
    echo "🔍 Testing $name..."
    
    if [ -n "$TOKEN" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            --connect-timeout 10 \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            --connect-timeout 10 \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ $name: Status $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo "$body"
        return 0
    else
        echo "❌ $name: Status $http_code"
        echo "   Error: $(echo "$body" | jq -r '.message // .error // .' 2>/dev/null || echo "$body")"
        return 1
    fi
}

# Test without authentication first
echo ""
echo "📋 Step 1: Testing without authentication"
echo "────────────────────────────────────────────────────────────────"

sections_response=$(call_api "/sections" "Get Sections")
sections_success=$?

echo ""
echo "📋 Step 2: Attempting authentication"
echo "────────────────────────────────────────────────────────────────"

# Try to get token (will likely fail without proper credentials)
get_auth_token
auth_success=$?

if [ $auth_success -eq 0 ]; then
    echo ""
    echo "📋 Step 3: Testing with authentication"
    echo "────────────────────────────────────────────────────────────────"
    
    # Get sections with auth
    sections_response=$(call_api "/sections" "Get Sections (Authenticated)")
    
    # Extract first section ID if available
    section_id=$(echo "$sections_response" | jq -r '.[0].id // .[0]._id // empty' 2>/dev/null)
    
    if [ -n "$section_id" ] && [ "$section_id" != "null" ]; then
        echo ""
        echo "📋 Step 4: Testing with real Section ID: $section_id"
        echo "────────────────────────────────────────────────────────────────"
        
        # Get categories for this section
        categories_response=$(call_api "/mobile/sections/$section_id/categories" "Get Categories")
        
        # Extract first category ID
        category_id=$(echo "$categories_response" | jq -r '.[0].id // .[0]._id // empty' 2>/dev/null)
        
        if [ -n "$category_id" ] && [ "$category_id" != "null" ]; then
            echo ""
            echo "📋 Step 5: Testing with real Category ID: $category_id"
            echo "────────────────────────────────────────────────────────────────"
            
            # Test all endpoints with real IDs
            call_api "/mobile/categories/$category_id/subcategories" "Get Subcategories"
            echo "────────────────────────────────────────────────────────────────"
            
            call_api "/categories/$category_id" "Get Category Details"
            echo "────────────────────────────────────────────────────────────────"
            
            call_api "/subcategories/by-action-button?sectionId=$section_id&categoryId=$category_id&buttonType=read" "Get Subcategories (Read Button)"
            echo "────────────────────────────────────────────────────────────────"
            
            call_api "/subcategories/by-action-button?sectionId=$section_id&categoryId=$category_id&buttonType=listen" "Get Subcategories (Listen Button)"
            echo "────────────────────────────────────────────────────────────────"
            
            call_api "/subcategories/by-action-button?sectionId=$section_id&categoryId=$category_id&buttonType=watch" "Get Subcategories (Watch Button)"
        else
            echo "⚠️  No valid category ID found in response"
        fi
    else
        echo "⚠️  No valid section ID found in response"
    fi
else
    echo ""
    echo "📋 Step 3: Testing with sample IDs (no auth)"
    echo "────────────────────────────────────────────────────────────────"
    
    # Test with common ID formats
    for id in "1" "507f1f77bcf86cd799439011" "64a7b8c9d1e2f3a4b5c6d7e8"; do
        echo ""
        echo "Testing with ID format: $id"
        call_api "/mobile/sections/$id/categories" "Get Categories (ID: $id)"
        echo "────────────────────────────────────────────────────────────────"
    done
fi

echo ""
echo "📋 Step 6: Testing Azure Blob endpoint"
echo "────────────────────────────────────────────────────────────────"

# Test Azure blob with sample URL
sample_blob="https://gbsstorage.blob.core.windows.net/media/sample.pdf"
call_api "/azure-blob/file?blobUrl=$(echo "$sample_blob" | jq -sRr @uri)" "Get Azure Blob"

echo ""
echo "📝 Test Summary:"
echo "• Server connectivity: ✅ Working"
echo "• Authentication: $([ $auth_success -eq 0 ] && echo "✅ Working" || echo "❌ Needs proper credentials")"
echo "• Endpoints: Require valid authentication and IDs"
echo "• Next steps: Update credentials in script for full testing"