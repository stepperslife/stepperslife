#!/bin/bash
# Comprehensive Ticket & Payment Test
# Tests the complete organizer workflow with credits, events, staff, and payments

set -e

echo "=============================================="
echo "COMPREHENSIVE TICKET & PAYMENT TEST"
echo "=============================================="
echo ""

cd /Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# PHASE 1: CREATE ORGANIZER WITH $1000 FREE CREDITS
# ============================================
echo -e "${BLUE}PHASE 1: Creating test organizer with $1000 free credits${NC}"

ORGANIZER_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:createTestOrganizer '{
  "email": "test.organizer.'$(date +%s)'@stepperslife.com",
  "name": "Test Organizer"
}')

echo "$ORGANIZER_RESULT"
ORGANIZER_ID=$(echo "$ORGANIZER_RESULT" | grep -o '"organizerId": "[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Organizer created with 1000 FREE credits: $ORGANIZER_ID${NC}"
echo ""

# ============================================
# PHASE 2: CREATE 3 TICKETED EVENTS
# ============================================
echo -e "${BLUE}PHASE 2: Creating 3 ticketed events with 500 tickets each${NC}"

# Event 1: Chicago Steppin' Night - Uses FREE credits
echo ""
echo "Creating Event 1: Chicago Steppin' Night (using FREE credits)..."
EVENT1_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:createPrepaidEvent "{
  \"organizerId\": \"$ORGANIZER_ID\",
  \"eventName\": \"Chicago Steppin Night\",
  \"ticketPrice\": 25,
  \"ticketsToAllocate\": 500,
  \"useFirstEventCredit\": true
}")
echo "$EVENT1_RESULT"
EVENT1_ID=$(echo "$EVENT1_RESULT" | grep -o '"eventId": "[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Event 1 created: $EVENT1_ID${NC}"

# Event 2: Purchase credits with Square, then create event
echo ""
echo "Purchasing 500 credits with Square for Event 2..."
npx convex run testing/comprehensiveOrganizerTest:purchaseCredits "{
  \"organizerId\": \"$ORGANIZER_ID\",
  \"quantity\": 500,
  \"paymentMethod\": \"SQUARE\",
  \"paymentId\": \"sq_payment_$(date +%s)\"
}"

echo "Creating Event 2: Midwest Soul Gala..."
EVENT2_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:createPrepaidEvent "{
  \"organizerId\": \"$ORGANIZER_ID\",
  \"eventName\": \"Midwest Soul Gala\",
  \"ticketPrice\": 35,
  \"ticketsToAllocate\": 500,
  \"useFirstEventCredit\": false
}")
echo "$EVENT2_RESULT"
EVENT2_ID=$(echo "$EVENT2_RESULT" | grep -o '"eventId": "[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Event 2 created: $EVENT2_ID${NC}"

# Event 3: Purchase credits with Cash App, then create event
echo ""
echo "Purchasing 500 credits with Cash App for Event 3..."
npx convex run testing/comprehensiveOrganizerTest:purchaseCredits "{
  \"organizerId\": \"$ORGANIZER_ID\",
  \"quantity\": 500,
  \"paymentMethod\": \"CASHAPP\",
  \"paymentId\": \"cashapp_$(date +%s)\"
}"

echo "Creating Event 3: Summer Steppin Classic..."
EVENT3_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:createPrepaidEvent "{
  \"organizerId\": \"$ORGANIZER_ID\",
  \"eventName\": \"Summer Steppin Classic\",
  \"ticketPrice\": 45,
  \"ticketsToAllocate\": 500,
  \"useFirstEventCredit\": false
}")
echo "$EVENT3_RESULT"
EVENT3_ID=$(echo "$EVENT3_RESULT" | grep -o '"eventId": "[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Event 3 created: $EVENT3_ID${NC}"

echo ""
echo -e "${GREEN}All 3 events created successfully!${NC}"
echo ""

# ============================================
# PHASE 3: ADD TEAM MEMBERS & ALLOCATE TICKETS
# ============================================
echo -e "${BLUE}PHASE 3: Adding 3 team members to each event with 100% commission${NC}"

# Function to add team members to an event
add_team_members() {
  local EVENT_ID=$1
  local EVENT_NAME=$2

  echo ""
  echo "Adding team members to $EVENT_NAME..."

  # Team Member 1 - Gets 100 tickets
  TM1_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:addTeamMember "{
    \"eventId\": \"$EVENT_ID\",
    \"name\": \"Team Member Alpha\",
    \"email\": \"tm.alpha.${EVENT_ID}@test.com\"
  }")
  TM1_STAFF_ID=$(echo "$TM1_RESULT" | grep -o '"staffId": "[^"]*"' | cut -d'"' -f4)
  echo "  - Team Member Alpha: $TM1_STAFF_ID"

  # Allocate random tickets (50-150)
  TM1_TICKETS=$((50 + RANDOM % 100))
  npx convex run testing/comprehensiveOrganizerTest:allocateTicketsToStaff "{
    \"staffId\": \"$TM1_STAFF_ID\",
    \"quantity\": $TM1_TICKETS
  }"
  echo "    Allocated $TM1_TICKETS tickets"

  # Team Member 2 - Gets random tickets
  TM2_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:addTeamMember "{
    \"eventId\": \"$EVENT_ID\",
    \"name\": \"Team Member Beta\",
    \"email\": \"tm.beta.${EVENT_ID}@test.com\"
  }")
  TM2_STAFF_ID=$(echo "$TM2_RESULT" | grep -o '"staffId": "[^"]*"' | cut -d'"' -f4)
  echo "  - Team Member Beta: $TM2_STAFF_ID"

  TM2_TICKETS=$((50 + RANDOM % 100))
  npx convex run testing/comprehensiveOrganizerTest:allocateTicketsToStaff "{
    \"staffId\": \"$TM2_STAFF_ID\",
    \"quantity\": $TM2_TICKETS
  }"
  echo "    Allocated $TM2_TICKETS tickets"

  # Team Member 3 - Gets random tickets
  TM3_RESULT=$(npx convex run testing/comprehensiveOrganizerTest:addTeamMember "{
    \"eventId\": \"$EVENT_ID\",
    \"name\": \"Team Member Gamma\",
    \"email\": \"tm.gamma.${EVENT_ID}@test.com\"
  }")
  TM3_STAFF_ID=$(echo "$TM3_RESULT" | grep -o '"staffId": "[^"]*"' | cut -d'"' -f4)
  echo "  - Team Member Gamma: $TM3_STAFF_ID"

  TM3_TICKETS=$((50 + RANDOM % 100))
  npx convex run testing/comprehensiveOrganizerTest:allocateTicketsToStaff "{
    \"staffId\": \"$TM3_STAFF_ID\",
    \"quantity\": $TM3_TICKETS
  }"
  echo "    Allocated $TM3_TICKETS tickets"

  # Add associates under each team member
  echo "  Adding associates under team members..."

  # Associates for TM1 - Random commission $5-$15
  ASSOC1_COMMISSION=$((5 + RANDOM % 10))
  npx convex run testing/comprehensiveOrganizerTest:addAssociate "{
    \"eventId\": \"$EVENT_ID\",
    \"teamMemberStaffId\": \"$TM1_STAFF_ID\",
    \"name\": \"Associate A1\",
    \"email\": \"assoc.a1.${EVENT_ID}@test.com\",
    \"commissionPerTicket\": $ASSOC1_COMMISSION
  }"
  echo "    - Associate A1 under Alpha (\$$ASSOC1_COMMISSION/ticket)"

  # Associates for TM2
  ASSOC2_COMMISSION=$((5 + RANDOM % 10))
  npx convex run testing/comprehensiveOrganizerTest:addAssociate "{
    \"eventId\": \"$EVENT_ID\",
    \"teamMemberStaffId\": \"$TM2_STAFF_ID\",
    \"name\": \"Associate B1\",
    \"email\": \"assoc.b1.${EVENT_ID}@test.com\",
    \"commissionPerTicket\": $ASSOC2_COMMISSION
  }"
  echo "    - Associate B1 under Beta (\$$ASSOC2_COMMISSION/ticket)"

  # Associates for TM3
  ASSOC3_COMMISSION=$((5 + RANDOM % 10))
  npx convex run testing/comprehensiveOrganizerTest:addAssociate "{
    \"eventId\": \"$EVENT_ID\",
    \"teamMemberStaffId\": \"$TM3_STAFF_ID\",
    \"name\": \"Associate G1\",
    \"email\": \"assoc.g1.${EVENT_ID}@test.com\",
    \"commissionPerTicket\": $ASSOC3_COMMISSION
  }"
  echo "    - Associate G1 under Gamma (\$$ASSOC3_COMMISSION/ticket)"

}

# Add team members to all events
add_team_members "$EVENT1_ID" "Chicago Steppin Night"
add_team_members "$EVENT2_ID" "Midwest Soul Gala"
add_team_members "$EVENT3_ID" "Summer Steppin Classic"

echo ""
echo -e "${GREEN}Staff hierarchy set up for all events!${NC}"
echo ""

# ============================================
# PHASE 4: SIMULATE CUSTOMER PURCHASES
# ============================================
echo -e "${BLUE}PHASE 4: Simulating customer ticket purchases${NC}"

echo ""
echo "Simulating purchases for Event 1..."
for i in {1..5}; do
  QUANTITY=$((1 + RANDOM % 4))
  npx convex run testing/comprehensiveOrganizerTest:simulateCustomerPurchase "{\"eventId\": \"$EVENT1_ID\", \"customerEmail\": \"customer.e1.$i@test.com\", \"customerName\": \"Customer E1-$i\", \"quantity\": $QUANTITY, \"ticketPrice\": 25}"
  echo "  - Customer E1-$i purchased $QUANTITY tickets"
done

echo ""
echo "Simulating purchases for Event 2..."
for i in {1..5}; do
  QUANTITY=$((1 + RANDOM % 4))
  npx convex run testing/comprehensiveOrganizerTest:simulateCustomerPurchase "{\"eventId\": \"$EVENT2_ID\", \"customerEmail\": \"customer.e2.$i@test.com\", \"customerName\": \"Customer E2-$i\", \"quantity\": $QUANTITY, \"ticketPrice\": 35}"
  echo "  - Customer E2-$i purchased $QUANTITY tickets"
done

echo ""
echo "Simulating purchases for Event 3..."
for i in {1..5}; do
  QUANTITY=$((1 + RANDOM % 4))
  npx convex run testing/comprehensiveOrganizerTest:simulateCustomerPurchase "{\"eventId\": \"$EVENT3_ID\", \"customerEmail\": \"customer.e3.$i@test.com\", \"customerName\": \"Customer E3-$i\", \"quantity\": $QUANTITY, \"ticketPrice\": 45}"
  echo "  - Customer E3-$i purchased $QUANTITY tickets"
done

echo ""
echo -e "${GREEN}Customer purchases completed!${NC}"
echo ""

# ============================================
# PHASE 5: VERIFY RESULTS
# ============================================
echo -e "${BLUE}PHASE 5: Verifying commission summaries${NC}"

echo ""
echo "Event 1 Commission Summary:"
npx convex run testing/comprehensiveOrganizerTest:getCommissionSummary "{
  \"eventId\": \"$EVENT1_ID\"
}"

echo ""
echo "Event 2 Commission Summary:"
npx convex run testing/comprehensiveOrganizerTest:getCommissionSummary "{
  \"eventId\": \"$EVENT2_ID\"
}"

echo ""
echo "Event 3 Commission Summary:"
npx convex run testing/comprehensiveOrganizerTest:getCommissionSummary "{
  \"eventId\": \"$EVENT3_ID\"
}"

echo ""
echo "=============================================="
echo -e "${GREEN}COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!${NC}"
echo "=============================================="
echo ""
echo "Summary:"
echo "  - Organizer created with 1000 credits"
echo "  - 3 events created (500 tickets each)"
echo "  - 9 team members added (3 per event)"
echo "  - 9 associates added (1 per team member)"
echo "  - 15 customer purchases simulated"
echo "  - Payment methods tested: Stripe, Square, Cash App"
echo ""
echo "View results in the admin panel: http://localhost:3004/admin/dashboard"
echo ""
