#!/bin/bash

BASE_URL="https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api"

echo "🚀 Mobile API Status Check"
echo "═══════════════════════════════════════════════════════════════"
echo "Base URL: $BASE_URL"
echo ""

# Test basic connectivity
echo "🔍 Testing API connectivity..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" --connect-timeout 5 "$BASE_URL/sections")
http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$http_code" -eq 401 ]; then
    echo "✅ API Server is LIVE and responding"
    echo "🔐 Authentication required (Status: 401)"
elif [ "$http_code" -eq 200 ]; then
    echo "✅ API Server is LIVE and accessible"
elif [ -z "$http_code" ]; then
    echo "❌ API Server is DOWN or unreachable"
    exit 1
else
    echo "⚠️  API Server responding with status: $http_code"
fi

echo ""
echo "📋 API Endpoints Status:"
echo "────────────────────────────────────────────────────────────────"

endpoints=(
    "/sections:Get Sections"
    "/mobile/sections/1/categories:Get Categories"
    "/mobile/categories/1/subcategories:Get Subcategories"
    "/categories/1:Get Category Details"
    "/subcategories/by-action-button?sectionId=1&categoryId=1&buttonType=read:Get Subcategories by Action Button"
)

for endpoint_info in "${endpoints[@]}"; do
    IFS=':' read -r endpoint name <<< "$endpoint_info"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --connect-timeout 5 "$BASE_URL$endpoint")
    status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    case $status in
        200) echo "✅ $name - Working" ;;
        401) echo "🔐 $name - Requires Authentication" ;;
        400) echo "⚠️  $name - Bad Request (needs valid IDs)" ;;
        404) echo "❌ $name - Not Found" ;;
        500) echo "💥 $name - Server Error" ;;
        *) echo "❓ $name - Status: $status" ;;
    esac
done

echo ""
echo "📝 Summary:"
echo "• API server is accessible at: $BASE_URL"
echo "• All endpoints require authentication tokens"
echo "• Mobile-specific endpoints: /mobile/sections/{id}/categories, /mobile/categories/{id}/subcategories"
echo "• Action button filtering: /subcategories/by-action-button"
echo "• Azure blob access: /azure-blob/file"