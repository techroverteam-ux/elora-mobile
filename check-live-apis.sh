#!/bin/bash

BASE_URL="https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api"

echo "🚀 Checking Live Mobile APIs"
echo "═══════════════════════════════════════════════════════════════"

check_api() {
    local endpoint="$1"
    local name="$2"
    
    echo "🔍 Testing $name..."
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        --connect-timeout 10 \
        "$BASE_URL$endpoint")
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ $name: Status $http_code"
        # Count array items if response is JSON array
        count=$(echo "$body" | jq '. | length' 2>/dev/null || echo "N/A")
        echo "   Data count: $count"
        return 0
    else
        echo "❌ $name: Status $http_code"
        echo "   Error: $(echo "$body" | jq -r '.message // .error // .' 2>/dev/null || echo "$body")"
        return 1
    fi
}

# Test APIs
passed=0
total=5

echo ""
check_api "/sections" "Get Sections" && ((passed++))
echo "────────────────────────────────────────────────────────────────"

check_api "/mobile/sections/1/categories" "Get Categories (Section 1)" && ((passed++))
echo "────────────────────────────────────────────────────────────────"

check_api "/mobile/categories/1/subcategories" "Get Subcategories (Category 1)" && ((passed++))
echo "────────────────────────────────────────────────────────────────"

check_api "/categories/1" "Get Category Details (ID: 1)" && ((passed++))
echo "────────────────────────────────────────────────────────────────"

check_api "/subcategories/by-action-button?sectionId=1&categoryId=1&buttonType=read" "Get Subcategories by Action Button" && ((passed++))
echo "────────────────────────────────────────────────────────────────"

echo ""
echo "📊 Results: $passed/$total APIs working"
if [ "$passed" -eq "$total" ]; then
    echo "🎉 All APIs are working!"
else
    echo "⚠️  Some APIs have issues"
fi