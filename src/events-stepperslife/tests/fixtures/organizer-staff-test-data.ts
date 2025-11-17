/**
 * Test Data Fixtures for Organizer/Staff System Tests
 *
 * Provides realistic test data for:
 * - Organizer account creation
 * - Credit purchases (Square, Cash App)
 * - Event creation (3 events with PREPAY model)
 * - Staff assignment (Team Members and Associates)
 * - Commission structures
 */

export const TEST_ORGANIZER = {
  name: "Test Organizer",
  email: `test-organizer-${Date.now()}@example.com`,
  password: "TestPass123!",
  role: "organizer" as const,
};

export const CREDIT_PURCHASES = {
  square: {
    amount: 500,
    provider: "SQUARE" as const,
    // Square test card numbers
    testCard: "4111 1111 1111 1111",
    cvv: "111",
    expiry: "12/25",
  },
  cashApp: {
    amount: 500,
    provider: "CASHAPP" as const,
    // Cash App Pay test credentials
    testTag: "$TestUser",
  },
};

export const TEST_EVENTS = [
  {
    name: "Test Event 1 - First Event (FREE Credits)",
    description: "First ticketed event - receives 1000 free credits",
    eventType: "TICKETED_EVENT" as const,
    ticketCount: 500,
    ticketPrice: 2500, // $25.00 in cents
    paymentModel: "PREPAY" as const,
    creditsAllocated: 500,
    expectedFreeCredits: 1000, // First event bonus
    categories: ["Testing", "Music"],
    location: {
      city: "Chicago",
      state: "IL",
      country: "US",
    },
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
  },
  {
    name: "Test Event 2 - Second Event (PAID)",
    description: "Second ticketed event - uses purchased credits",
    eventType: "TICKETED_EVENT" as const,
    ticketCount: 500,
    ticketPrice: 3000, // $30.00 in cents
    paymentModel: "PREPAY" as const,
    creditsAllocated: 500,
    categories: ["Testing", "Dance"],
    location: {
      city: "Atlanta",
      state: "GA",
      country: "US",
    },
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
  },
  {
    name: "Test Event 3 - Third Event (PAID)",
    description: "Third ticketed event - uses purchased credits",
    eventType: "TICKETED_EVENT" as const,
    ticketCount: 500,
    ticketPrice: 2000, // $20.00 in cents
    paymentModel: "PREPAY" as const,
    creditsAllocated: 500,
    categories: ["Testing", "Social"],
    location: {
      city: "Houston",
      state: "TX",
      country: "US",
    },
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
  },
];

/**
 * Team Member configurations for each event
 * Each event gets 3 Team Members with random ticket allocations
 * Team Members receive 100% commission on their allocated tickets
 */
export const TEAM_MEMBERS_PER_EVENT = [
  // Event 1 Team Members (total: 500 tickets)
  [
    {
      name: "Team Member A1",
      email: `team-a1-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 150,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100, // 100% of ticket price
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
    {
      name: "Team Member A2",
      email: `team-a2-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 200,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
    {
      name: "Team Member A3",
      email: `team-a3-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 150,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
  ],
  // Event 2 Team Members (total: 500 tickets)
  [
    {
      name: "Team Member B1",
      email: `team-b1-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 180,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
    {
      name: "Team Member B2",
      email: `team-b2-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 170,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
    {
      name: "Team Member B3",
      email: `team-b3-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 150,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
  ],
  // Event 3 Team Members (total: 500 tickets)
  [
    {
      name: "Team Member C1",
      email: `team-c1-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 160,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
    {
      name: "Team Member C2",
      email: `team-c2-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 190,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
    {
      name: "Team Member C3",
      email: `team-c3-${Date.now()}@example.com`,
      role: "TEAM_MEMBERS" as const,
      ticketAllocation: 150,
      commissionType: "PERCENTAGE" as const,
      commissionValue: 100,
      canSellTickets: true,
      canAssignSubSellers: true,
      canScan: false,
      acceptCashInPerson: true,
    },
  ],
];

/**
 * Associate configurations
 * Each Team Member assigns 1-2 Associates
 * Associates receive random $ per ticket (FIXED commission)
 */
export function generateAssociatesForTeamMember(teamMemberIndex: number) {
  const associateCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 associates
  const associates = [];

  for (let i = 0; i < associateCount; i++) {
    const randomCommission = Math.floor(Math.random() * 7) + 2; // $2-$8 per ticket
    const randomTickets = Math.floor(Math.random() * 31) + 20; // 20-50 tickets

    associates.push({
      name: `Associate ${teamMemberIndex}-${i + 1}`,
      email: `associate-${teamMemberIndex}-${i + 1}-${Date.now()}@example.com`,
      role: "ASSOCIATES" as const,
      ticketAllocation: randomTickets,
      commissionType: "FIXED" as const,
      commissionValue: randomCommission * 100, // Convert to cents
      canSellTickets: true,
      canScan: false,
      acceptCashInPerson: true,
    });
  }

  return associates;
}

/**
 * Customer purchase scenarios
 * Simulates real customer ticket purchases via Stripe
 */
export const CUSTOMER_PURCHASES = [
  {
    quantity: 2,
    paymentMethod: "STRIPE" as const,
    // Stripe test card - successful charge
    testCard: {
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 2025,
      cvc: "123",
    },
  },
  {
    quantity: 4,
    paymentMethod: "STRIPE" as const,
    testCard: {
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 2025,
      cvc: "123",
    },
  },
  {
    quantity: 1,
    paymentMethod: "STRIPE" as const,
    testCard: {
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 2025,
      cvc: "123",
    },
  },
  {
    quantity: 3,
    paymentMethod: "STRIPE" as const,
    testCard: {
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 2025,
      cvc: "123",
    },
  },
  {
    quantity: 5,
    paymentMethod: "STRIPE" as const,
    testCard: {
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 2025,
      cvc: "123",
    },
  },
];

/**
 * Expected credit flow for verification
 */
export const EXPECTED_CREDIT_FLOW = {
  purchased: {
    square: 500,
    cashApp: 500,
    total: 1000,
  },
  bonus: {
    firstEvent: 1000,
  },
  totalCredits: 2000, // 1000 purchased + 1000 bonus
  allocated: {
    event1: 500,
    event2: 500,
    event3: 500,
    total: 1500,
  },
  remaining: 500, // 2000 - 1500
};

/**
 * Expected commission calculations
 */
export function calculateExpectedCommissions(
  ticketPrice: number,
  ticketsSold: number,
  commissionPercent: number
): number {
  return Math.round((ticketPrice * ticketsSold * commissionPercent) / 100);
}

export function calculateFixedCommission(
  commissionPerTicket: number,
  ticketsSold: number
): number {
  return commissionPerTicket * ticketsSold;
}
