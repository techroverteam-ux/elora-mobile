#!/bin/bash

echo "=== Git Push Script for Elora Mobile ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check current git status
print_step "Checking current git status..."
git status

echo ""
print_step "Current branch and recent commits:"
git branch
git log --oneline -5

echo ""
print_info "Available options:"
echo "1. Add all changes and commit"
echo "2. Push to current branch"
echo "3. Create new branch and push"
echo "4. View differences with March 8th version"

echo ""
print_step "Git commands to run manually:"
echo ""
echo "# Add all changes:"
echo "git add ."
echo ""
echo "# Commit with message:"
echo "git commit -m 'Updated app with crash fixes and clean build - $(date)'"
echo ""
echo "# Push to main branch:"
echo "git push origin main"
echo ""
echo "# OR create new branch:"
echo "git checkout -b crash-fixes-$(date +%Y%m%d)"
echo "git push origin crash-fixes-$(date +%Y%m%d)"

echo ""
print_info "March 8th version cloned to: ~/Documents/TechRover/elora-mobile-march8"
print_info "Current version location: ~/Documents/TechRover/elora-mobile"