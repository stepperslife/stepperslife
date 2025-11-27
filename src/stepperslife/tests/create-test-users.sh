#!/bin/bash

# Create Test Users via HTTP API
# This script creates test users by calling the registration API

BASE_URL="http://localhost:3004"

echo "🚀 Creating test users via HTTP API..."
echo ""

# Function to create user
create_user() {
  local name="$1"
  local email="$2"
  local password="$3"

  echo "Creating: $name ($email)..."

  response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"email\":\"$email\",\"password\":\"$password\"}")

  if echo "$response" | grep -q "success\|user\|email"; then
    echo "✅ Created: $email"
  elif echo "$response" | grep -q "already exists\|duplicate"; then
    echo "⚠️  Already exists: $email"
  else
    echo "❌ Failed: $email"
    echo "   Response: $response"
  fi

  echo ""
}

# Create test users
echo "1️⃣  Creating Admin user..."
create_user "Admin Test User" "admin-test@stepperslife.com" "AdminTest123!"

echo "2️⃣  Creating Organizer user..."
create_user "Organizer Test User" "organizer-test@stepperslife.com" "OrganizerTest123!"

echo "3️⃣  Creating Regular User..."
create_user "User Test Account" "user-test@stepperslife.com" "UserTest123!"

echo "4️⃣  Creating Staff user..."
create_user "Staff Test User" "staff-test@stepperslife.com" "StaffTest123!"

echo "5️⃣  Creating Team Member user..."
create_user "Team Member Test User" "team-test@stepperslife.com" "TeamTest123!"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test user creation complete!"
echo ""
echo "📋 Summary:"
echo "Admin:        admin-test@stepperslife.com"
echo "Organizer:    organizer-test@stepperslife.com"
echo "User:         user-test@stepperslife.com"
echo "Staff:        staff-test@stepperslife.com"
echo "Team Member:  team-test@stepperslife.com"
echo ""
echo "Password (all): [Role]Test123!"
echo ""
echo "⚠️  Manual steps still needed:"
echo "1. Update admin-test@stepperslife.com role to 'admin'"
echo "2. Update user-test@stepperslife.com role to 'user'"
echo "3. Login as organizer and create test event"
echo "4. Add staff-test and team-test as event staff"
echo ""
echo "🧪 Ready to run tests:"
echo "   npx playwright test"
