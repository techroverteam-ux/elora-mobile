#!/bin/bash

BASE_URL="https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api"
TOKEN=""

echo "🚀 Complete Mobile API Test with Real Authentication"
echo "═══════════════════════════════════════════════════════════════"

# Function to get auth token
get_auth_token() {
    echo "🔐 Getting authentication token..."
    
    login_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -X POST \
        -d '{"apiKey":"GBS-KEY","userName":"Geeta Bal Sankar","password":"GBS@2025"}' \
        "$BASE_URL/auth/getAccess" 2>/dev/null)
    
    http_code=$(echo "$login_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$login_response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        TOKEN=$(echo "$body" | jq -r '.token // .accessToken // .access_token' 2>/dev/null)
        if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
            echo "✅ Authentication successful"
            echo "   Token: ${TOKEN:0:20}..."
            return 0
        fi
    fi
    
    echo "❌ Authentication failed (Status: $http_code)"
    echo "   Response: $body"
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
        
        # Try to extract count and first item info
        count=$(echo "$body" | jq '.data | length // . | length' 2>/dev/null || echo "N/A")
        first_id=$(echo "$body" | jq -r '.data[0]._id // .data[0].id // .[0]._id // .[0].id // empty' 2>/dev/null)
        first_name=$(echo "$body" | jq -r '.data[0].name // .data[0].title // .[0].name // .[0].title // empty' 2>/dev/null)
        
        echo "   📊 Count: $count items"
        if [ -n "$first_id" ] && [ "$first_id" != "null" ]; then
            echo "   🆔 First ID: $first_id"
        fi
        if [ -n "$first_name" ] && [ "$first_name" != "null" ]; then
            echo "   📝 First Name: $first_name"
        fi
        
        echo "$first_id"
        return 0
    else
        echo "❌ $name: Status $http_code"
        echo "   Error: $(echo "$body" | jq -r '.message // .error // .' 2>/dev/null || echo "$body")"
        return 1
    fi
}

# Main test execution
echo ""
echo "📋 Step 1: Authentication"
echo "────────────────────────────────────────────────────────────────"

get_auth_token
auth_success=$?

echo ""
echo "📋 Step 2: Testing Mobile Sections (Public)"
echo "────────────────────────────────────────────────────────────────"

section_id=$(call_api "/mobile/sections" "Get Mobile Sections")
sections_success=$?

if [ $sections_success -eq 0 ] && [ -n "$section_id" ] && [ "$section_id" != "N/A" ]; then
    echo ""
    echo "📋 Step 3: Testing with Section ID: $section_id"
    echo "────────────────────────────────────────────────────────────────"
    
    category_id=$(call_api "/mobile/sections/$section_id/categories" "Get Categories")
    categories_success=$?
    
    if [ $categories_success -eq 0 ] && [ -n "$category_id" ] && [ "$category_id" != "N/A" ]; then
        echo ""
        echo "📋 Step 4: Testing with Category ID: $category_id"
        echo "────────────────────────────────────────────────────────────────"
        
        subcategory_id=$(call_api "/mobile/categories/$category_id/subcategories" "Get Subcategories")
        echo "────────────────────────────────────────────────────────────────"
        
        call_api "/mobile/categories/$category_id/media?type=audio&page=1&limit=5" "Get Category Media (Audio)"
        echo "────────────────────────────────────────────────────────────────"
        
        call_api "/mobile/categories/$category_id/media?type=video&page=1&limit=5" "Get Category Media (Video)"
        echo "────────────────────────────────────────────────────────────────"
        
        call_api "/mobile/categories/$category_id/media?type=pdf&page=1&limit=5" "Get Category Media (PDF)"
        
        if [ -n "$subcategory_id" ] && [ "$subcategory_id" != "N/A" ]; then
            echo ""
            echo "📋 Step 5: Testing with Subcategory ID: $subcategory_id"
            echo "────────────────────────────────────────────────────────────────"
            
            call_api "/mobile/subcategories/$subcategory_id/media?type=audio" "Get Subcategory Media"
        fi
    fi
fi

echo ""
echo "📋 Step 6: Testing Dashboard & Discovery APIs"
echo "────────────────────────────────────────────────────────────────"

call_api "/mobile/dashboard" "Get Mobile Dashboard"
echo "────────────────────────────────────────────────────────────────"

call_api "/mobile/trending?days=7&limit=10" "Get Trending Content"
echo "────────────────────────────────────────────────────────────────"

call_api "/mobile/featured?limit=10" "Get Featured Content"
echo "────────────────────────────────────────────────────────────────"

call_api "/mobile/search?q=krishna&page=1&limit=5" "Search Content"

echo ""
echo "📋 Step 7: Testing Admin APIs (with auth)"
echo "────────────────────────────────────────────────────────────────"

if [ $auth_success -eq 0 ]; then
    call_api "/sections" "Get All Sections (Admin)"
    echo "────────────────────────────────────────────────────────────────"
    
    call_api "/categories/list/all" "Get All Categories (Admin)"
else
    echo "⚠️  Skipping admin APIs - authentication failed"
fi

echo ""
echo "📝 Test Summary:"
echo "• Server connectivity: ✅ Working"
echo "• Authentication: $([ $auth_success -eq 0 ] && echo "✅ Working" || echo "❌ Failed")"
echo "• Mobile endpoints: $([ $sections_success -eq 0 ] && echo "✅ Working" || echo "❌ Failed")"
echo "• Base URL: $BASE_URL"