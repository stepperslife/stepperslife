/**
 * Payment Test Data Factory
 * Generates test data for comprehensive payment system testing
 */

import { Id } from "../../convex/_generated/dataModel";

export interface TestEvent {
  name: string;
  paymentModel: "PREPAY" | "CREDIT_CARD";
  ticketTiers: TestTicketTier[];
  customerPaymentMethods: ("CASH" | "STRIPE" | "PAYPAL" | "CASHAPP")[];
  description: string;
}

export interface TestTicketTier {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface TestPurchase {
  eventIndex: number;
  ticketTierIndex: number;
  quantity: number;
  paymentMethod: "CASH" | "STRIPE" | "PAYPAL" | "CASHAPP";
  buyerEmail: string;
  buyerName: string;
}

/**
 * Generate 3 PREPAY events with various configurations
 */
export function generatePrepayEvents(): TestEvent[] {
  return [
    {
      name: "PREPAY Event 1: Cash Only - House Party",
      paymentModel: "PREPAY",
      description: "Testing PREPAY model with cash-only payments. Tickets activated by staff at door.",
      customerPaymentMethods: ["CASH"],
      ticketTiers: [
        {
          name: "General Admission",
          price: 15,
          quantity: 50,
          description: "Standard entry - cash at door"
        },
        {
          name: "VIP Entry",
          price: 30,
          quantity: 20,
          description: "VIP access with early entry"
        }
      ]
    },
    {
      name: "PREPAY Event 2: Multi-Payment - Dance Festival",
      paymentModel: "PREPAY",
      description: "Testing PREPAY with Stripe, PayPal, and CashApp enabled",
      customerPaymentMethods: ["STRIPE", "PAYPAL", "CASHAPP"],
      ticketTiers: [
        {
          name: "Early Bird",
          price: 20,
          quantity: 100,
          description: "Early bird special pricing"
        },
        {
          name: "Regular Admission",
          price: 25,
          quantity: 200,
          description: "Standard ticket price"
        },
        {
          name: "VIP Package",
          price: 75,
          quantity: 30,
          description: "VIP with backstage access"
        }
      ]
    },
    {
      name: "PREPAY Event 3: All Methods - Community Fundraiser",
      paymentModel: "PREPAY",
      description: "Testing all payment methods including cash activation",
      customerPaymentMethods: ["CASH", "STRIPE", "PAYPAL", "CASHAPP"],
      ticketTiers: [
        {
          name: "Supporter Ticket",
          price: 35,
          quantity: 150,
          description: "Support local community"
        },
        {
          name: "Patron Ticket",
          price: 100,
          quantity: 50,
          description: "Premium supporter level"
        }
      ]
    }
  ];
}

/**
 * Generate 7 CREDIT_CARD (split payment) events
 */
export function generateCreditCardEvents(): TestEvent[] {
  return [
    {
      name: "SPLIT Event 1: Small Budget - Open Mic Night",
      paymentModel: "CREDIT_CARD",
      description: "Low price point testing ($10) - Platform fee: $2.16, Processing: $0.59",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "General Entry",
          price: 10,
          quantity: 100,
          description: "Open mic entry"
        }
      ]
    },
    {
      name: "SPLIT Event 2: Medium Price - Workshop Series",
      paymentModel: "CREDIT_CARD",
      description: "Mid-range pricing ($25) - Platform fee: $2.72, Processing: $1.03",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "Single Workshop",
          price: 25,
          quantity: 50,
          description: "Attend one workshop"
        },
        {
          name: "Full Series Pass",
          price: 75,
          quantity: 20,
          description: "All workshops included"
        }
      ]
    },
    {
      name: "SPLIT Event 3: Premium - Concert Series",
      paymentModel: "CREDIT_CARD",
      description: "Higher price point ($50) - Platform fee: $3.64, Processing: $1.75",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "Standard Seating",
          price: 50,
          quantity: 200,
          description: "General seating area"
        },
        {
          name: "Premium Seating",
          price: 100,
          quantity: 50,
          description: "Front section reserved"
        },
        {
          name: "VIP Box",
          price: 250,
          quantity: 10,
          description: "Private box with catering"
        }
      ]
    },
    {
      name: "SPLIT Event 4: High-End Gala",
      paymentModel: "CREDIT_CARD",
      description: "Premium pricing ($100) - Platform fee: $5.49, Processing: $3.20",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "Individual Ticket",
          price: 100,
          quantity: 100,
          description: "Single gala entry"
        },
        {
          name: "Couple's Ticket",
          price: 180,
          quantity: 50,
          description: "Two tickets with preferred seating"
        }
      ]
    },
    {
      name: "SPLIT Event 5: Multi-Tier Conference",
      paymentModel: "CREDIT_CARD",
      description: "Testing multiple price tiers with split payments",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "Virtual Attendance",
          price: 15,
          quantity: 500,
          description: "Online access only"
        },
        {
          name: "In-Person Day Pass",
          price: 50,
          quantity: 200,
          description: "Single day attendance"
        },
        {
          name: "Full Conference Pass",
          price: 150,
          quantity: 100,
          description: "All days + workshops"
        },
        {
          name: "VIP All-Access",
          price: 300,
          quantity: 25,
          description: "Full access + networking events"
        }
      ]
    },
    {
      name: "SPLIT Event 6: Table Package Event",
      paymentModel: "CREDIT_CARD",
      description: "Testing table packages with high value tickets",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "Individual Seat",
          price: 75,
          quantity: 80,
          description: "Single reserved seat"
        },
        {
          name: "Table for 4",
          price: 280,
          quantity: 20,
          description: "Reserved table, seats 4"
        },
        {
          name: "Table for 8",
          price: 550,
          quantity: 10,
          description: "Premium table, seats 8"
        }
      ]
    },
    {
      name: "SPLIT Event 7: Ultimate Premium Event",
      paymentModel: "CREDIT_CARD",
      description: "Highest price point testing ($250+) - Platform fee: $11.04, Processing: $7.55",
      customerPaymentMethods: ["STRIPE"],
      ticketTiers: [
        {
          name: "Standard Entry",
          price: 250,
          quantity: 50,
          description: "Base level admission"
        },
        {
          name: "Platinum Experience",
          price: 500,
          quantity: 20,
          description: "Enhanced experience package"
        }
      ]
    }
  ];
}

/**
 * Generate all 10 test events
 */
export function generateAllTestEvents(): TestEvent[] {
  return [
    ...generatePrepayEvents(),
    ...generateCreditCardEvents()
  ];
}

/**
 * Calculate expected fees for CREDIT_CARD model
 */
export function calculateCreditCardFees(subtotalCents: number): {
  platformFeeCents: number;
  processingFeeCents: number;
  totalCents: number;
  organizerReceivesCents: number;
} {
  // Platform fee: 3.7% + $1.79
  const platformFeeCents = Math.round(subtotalCents * 0.037) + 179;

  // Processing fee: 2.9% + $0.30
  const processingFeeCents = Math.round(subtotalCents * 0.029) + 30;

  const totalCents = subtotalCents + platformFeeCents + processingFeeCents;
  const organizerReceivesCents = subtotalCents - platformFeeCents - processingFeeCents;

  return {
    platformFeeCents,
    processingFeeCents,
    totalCents,
    organizerReceivesCents
  };
}

/**
 * Calculate expected fees for PREPAY model with Stripe
 */
export function calculatePrepayStripeFees(subtotalCents: number): {
  processingFeeCents: number;
  totalCents: number;
  organizerReceivesCents: number;
} {
  // Only Stripe processing fee: 2.9% + $0.30
  const processingFeeCents = Math.round(subtotalCents * 0.029) + 30;
  const totalCents = subtotalCents + processingFeeCents;
  const organizerReceivesCents = subtotalCents - processingFeeCents;

  return {
    processingFeeCents,
    totalCents,
    organizerReceivesCents
  };
}

/**
 * Calculate credits needed for PREPAY events
 */
export function calculateCreditsNeeded(events: TestEvent[]): number {
  return events.reduce((total, event) => {
    if (event.paymentModel === "PREPAY") {
      const eventCredits = event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);
      return total + eventCredits;
    }
    return total;
  }, 0);
}

/**
 * Generate comprehensive test purchase scenarios
 */
export function generateTestPurchases(): TestPurchase[] {
  const purchases: TestPurchase[] = [];

  // PREPAY Event 1 (Cash only) - 5 purchases
  purchases.push(
    { eventIndex: 0, ticketTierIndex: 0, quantity: 2, paymentMethod: "CASH", buyerEmail: "cash1@test.com", buyerName: "Cash Buyer 1" },
    { eventIndex: 0, ticketTierIndex: 0, quantity: 3, paymentMethod: "CASH", buyerEmail: "cash2@test.com", buyerName: "Cash Buyer 2" },
    { eventIndex: 0, ticketTierIndex: 1, quantity: 1, paymentMethod: "CASH", buyerEmail: "cash3@test.com", buyerName: "VIP Cash Buyer" },
    { eventIndex: 0, ticketTierIndex: 0, quantity: 5, paymentMethod: "CASH", buyerEmail: "cash4@test.com", buyerName: "Group Cash Buyer" },
    { eventIndex: 0, ticketTierIndex: 1, quantity: 2, paymentMethod: "CASH", buyerEmail: "cash5@test.com", buyerName: "VIP Couple Cash" }
  );

  // PREPAY Event 2 (Multi-payment) - 6 purchases
  purchases.push(
    { eventIndex: 1, ticketTierIndex: 0, quantity: 2, paymentMethod: "STRIPE", buyerEmail: "stripe1@test.com", buyerName: "Stripe Buyer 1" },
    { eventIndex: 1, ticketTierIndex: 1, quantity: 1, paymentMethod: "STRIPE", buyerEmail: "stripe2@test.com", buyerName: "Stripe Regular" },
    { eventIndex: 1, ticketTierIndex: 2, quantity: 1, paymentMethod: "STRIPE", buyerEmail: "stripe3@test.com", buyerName: "Stripe VIP" },
    { eventIndex: 1, ticketTierIndex: 0, quantity: 3, paymentMethod: "PAYPAL", buyerEmail: "paypal1@test.com", buyerName: "PayPal Buyer" },
    { eventIndex: 1, ticketTierIndex: 1, quantity: 2, paymentMethod: "PAYPAL", buyerEmail: "paypal2@test.com", buyerName: "PayPal Regular" },
    { eventIndex: 1, ticketTierIndex: 0, quantity: 2, paymentMethod: "CASHAPP", buyerEmail: "cashapp1@test.com", buyerName: "CashApp Buyer" }
  );

  // PREPAY Event 3 (All methods) - 8 purchases
  purchases.push(
    { eventIndex: 2, ticketTierIndex: 0, quantity: 2, paymentMethod: "CASH", buyerEmail: "mixed1@test.com", buyerName: "Mixed Cash" },
    { eventIndex: 2, ticketTierIndex: 0, quantity: 3, paymentMethod: "STRIPE", buyerEmail: "mixed2@test.com", buyerName: "Mixed Stripe" },
    { eventIndex: 2, ticketTierIndex: 1, quantity: 1, paymentMethod: "STRIPE", buyerEmail: "mixed3@test.com", buyerName: "Mixed Patron Stripe" },
    { eventIndex: 2, ticketTierIndex: 0, quantity: 2, paymentMethod: "PAYPAL", buyerEmail: "mixed4@test.com", buyerName: "Mixed PayPal" },
    { eventIndex: 2, ticketTierIndex: 1, quantity: 1, paymentMethod: "PAYPAL", buyerEmail: "mixed5@test.com", buyerName: "Mixed Patron PayPal" },
    { eventIndex: 2, ticketTierIndex: 0, quantity: 4, paymentMethod: "CASHAPP", buyerEmail: "mixed6@test.com", buyerName: "Mixed CashApp Group" },
    { eventIndex: 2, ticketTierIndex: 0, quantity: 1, paymentMethod: "CASH", buyerEmail: "mixed7@test.com", buyerName: "Mixed Single Cash" },
    { eventIndex: 2, ticketTierIndex: 1, quantity: 2, paymentMethod: "CASHAPP", buyerEmail: "mixed8@test.com", buyerName: "Mixed Patron CashApp" }
  );

  // SPLIT Events 4-10 (Stripe only) - 2-3 purchases each
  for (let i = 3; i < 10; i++) {
    purchases.push(
      { eventIndex: i, ticketTierIndex: 0, quantity: 2, paymentMethod: "STRIPE", buyerEmail: `split${i}a@test.com`, buyerName: `Split Buyer ${i}A` },
      { eventIndex: i, ticketTierIndex: 0, quantity: 1, paymentMethod: "STRIPE", buyerEmail: `split${i}b@test.com`, buyerName: `Split Buyer ${i}B` }
    );

    // Add one more for events with multiple tiers
    if (i === 4 || i === 5 || i === 7) {
      purchases.push(
        { eventIndex: i, ticketTierIndex: 1, quantity: 1, paymentMethod: "STRIPE", buyerEmail: `split${i}c@test.com`, buyerName: `Split Buyer ${i}C` }
      );
    }
  }

  return purchases;
}

/**
 * Stripe test cards
 */
export const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  requiresAuth: '4000002500003155',
  expiry: '12/34',
  cvc: '123',
  zip: '12345'
};

/**
 * Test organizer data
 */
export const TEST_ORGANIZER = {
  email: "test-organizer@stepperslife.com",
  name: "Test Organizer",
  phone: "+15551234567",
  organizationName: "SteppersLife Test Org"
};

/**
 * Calculate total tickets across all events
 */
export function calculateTotalTickets(events: TestEvent[]): number {
  return events.reduce((total, event) => {
    const eventTickets = event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);
    return total + eventTickets;
  }, 0);
}
