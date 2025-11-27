/**
 * Cleanup Test Data Script
 * Removes all test data created during payment system testing
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://expert-vulture-775.convex.cloud";

class TestDataCleaner {
  private convex: ConvexHttpClient;

  constructor() {
    this.convex = new ConvexHttpClient(CONVEX_URL);
  }

  /**
   * Clean up all test data
   */
  async cleanupAll(options: {
    deleteEvents?: boolean;
    deleteOrders?: boolean;
    deleteTickets?: boolean;
    deleteUsers?: boolean;
    deleteCredits?: boolean;
  } = {}): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('TEST DATA CLEANUP');
    console.log('='.repeat(80) + '\n');

    const {
      deleteEvents = true,
      deleteOrders = true,
      deleteTickets = true,
      deleteUsers = false,
      deleteCredits = false
    } = options;

    try {
      // Find all test events (by naming pattern or test flag)
      if (deleteEvents) {
        await this.cleanupTestEvents();
      }

      // Clean up test orders
      if (deleteOrders) {
        await this.cleanupTestOrders();
      }

      // Clean up test tickets
      if (deleteTickets) {
        await this.cleanupTestTickets();
      }

      // Clean up test users (optional)
      if (deleteUsers) {
        await this.cleanupTestUsers();
      }

      // Clean up test credits (optional)
      if (deleteCredits) {
        await this.cleanupTestCredits();
      }

      console.log('\n✓ Cleanup completed successfully\n');

    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Cleanup test events
   */
  private async cleanupTestEvents(): Promise<void> {
    console.log('[CLEANUP] Removing test events...');

    try {
      // Get all events with "TEST", "PREPAY", "SPLIT" in name
      const testPatterns = ['TEST', 'PREPAY Event', 'SPLIT Event', 'House Party', 'Dance Festival'];

      const events = await this.convex.query(api.events.queries.getAllEvents, {});

      const testEvents = events.filter((event: any) =>
        testPatterns.some(pattern => event.name?.includes(pattern))
      );

      console.log(`Found ${testEvents.length} test events to delete`);

      for (const event of testEvents) {
        try {
          await this.convex.mutation(api.events.mutations.deleteEvent, {
            eventId: event._id
          });
          console.log(`  ✓ Deleted event: ${event.name} (${event._id})`);
        } catch (error) {
          console.log(`  ✗ Failed to delete event ${event._id}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('Error cleaning up test events:', error);
    }
  }

  /**
   * Cleanup test orders
   */
  private async cleanupTestOrders(): Promise<void> {
    console.log('[CLEANUP] Removing test orders...');

    try {
      // Find orders from test users or test events
      const testEmails = ['test', '@test.com', 'cash', 'stripe', 'paypal', 'cashapp', 'split', 'mixed'];

      const orders = await this.convex.query(api.orders.queries.getAllOrders, {});

      const testOrders = orders.filter((order: any) => {
        // Check if order email contains test patterns
        const email = order.buyerEmail?.toLowerCase() || '';
        return testEmails.some(pattern => email.includes(pattern));
      });

      console.log(`Found ${testOrders.length} test orders to delete`);

      for (const order of testOrders) {
        try {
          await this.convex.mutation(api.orders.mutations.deleteOrder, {
            orderId: order._id
          });
          console.log(`  ✓ Deleted order: ${order._id} (${order.buyerEmail})`);
        } catch (error) {
          console.log(`  ✗ Failed to delete order ${order._id}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('Error cleaning up test orders:', error);
    }
  }

  /**
   * Cleanup test tickets
   */
  private async cleanupTestTickets(): Promise<void> {
    console.log('[CLEANUP] Removing test tickets...');

    try {
      // Tickets are usually cascade-deleted with orders/events
      // But we can clean up orphaned test tickets

      const tickets = await this.convex.query(api.tickets.queries.getAllTickets, {});

      const testTickets = tickets.filter((ticket: any) => {
        const email = ticket.buyerEmail?.toLowerCase() || '';
        return email.includes('test') || email.includes('@test.com');
      });

      console.log(`Found ${testTickets.length} test tickets to delete`);

      for (const ticket of testTickets) {
        try {
          await this.convex.mutation(api.tickets.mutations.deleteTicket, {
            ticketId: ticket._id
          });
          console.log(`  ✓ Deleted ticket: ${ticket._id}`);
        } catch (error) {
          console.log(`  ✗ Failed to delete ticket ${ticket._id}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('Error cleaning up test tickets:', error);
    }
  }

  /**
   * Cleanup test users (DANGEROUS - use with caution)
   */
  private async cleanupTestUsers(): Promise<void> {
    console.log('[CLEANUP] Removing test users (use with caution)...');

    try {
      const users = await this.convex.query(api.users.queries.getAllUsers, {});

      const testUsers = users.filter((user: any) => {
        const email = user.email?.toLowerCase() || '';
        return email.includes('test-organizer') || email.includes('@stepperslife.com');
      });

      console.log(`Found ${testUsers.length} test users to delete`);

      for (const user of testUsers) {
        try {
          await this.convex.mutation(api.users.mutations.deleteUser, {
            userId: user._id
          });
          console.log(`  ✓ Deleted user: ${user.email} (${user._id})`);
        } catch (error) {
          console.log(`  ✗ Failed to delete user ${user._id}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('Error cleaning up test users:', error);
    }
  }

  /**
   * Cleanup test credits
   */
  private async cleanupTestCredits(): Promise<void> {
    console.log('[CLEANUP] Removing test credit transactions...');

    try {
      const transactions = await this.convex.query(api.credits.queries.getAllTransactions, {});

      const testTransactions = transactions.filter((tx: any) =>
        tx.organizerId?.includes('test') ||
        tx.description?.includes('test') ||
        tx.description?.includes('Automated test')
      );

      console.log(`Found ${testTransactions.length} test credit transactions to delete`);

      for (const tx of testTransactions) {
        try {
          await this.convex.mutation(api.credits.mutations.deleteTransaction, {
            transactionId: tx._id
          });
          console.log(`  ✓ Deleted transaction: ${tx._id}`);
        } catch (error) {
          console.log(`  ✗ Failed to delete transaction ${tx._id}: ${error.message}`);
        }
      }

    } catch (error) {
      console.error('Error cleaning up test credits:', error);
    }
  }

  /**
   * Clean up specific event and all related data
   */
  async cleanupEvent(eventId: Id<"events">): Promise<void> {
    console.log(`\n[CLEANUP] Removing event ${eventId} and all related data...\n`);

    try {
      // Delete orders for this event
      const orders = await this.convex.query(api.orders.queries.getEventOrders, {
        eventId
      });

      console.log(`Deleting ${orders.length} orders...`);
      for (const order of orders) {
        await this.convex.mutation(api.orders.mutations.deleteOrder, {
          orderId: order._id
        });
      }

      // Delete tickets for this event
      const tickets = await this.convex.query(api.tickets.queries.getEventTickets, {
        eventId
      });

      console.log(`Deleting ${tickets.length} tickets...`);
      for (const ticket of tickets) {
        await this.convex.mutation(api.tickets.mutations.deleteTicket, {
          ticketId: ticket._id
        });
      }

      // Delete ticket tiers
      const tiers = await this.convex.query(api.ticketTiers.queries.getEventTicketTiers, {
        eventId
      });

      console.log(`Deleting ${tiers.length} ticket tiers...`);
      for (const tier of tiers) {
        await this.convex.mutation(api.ticketTiers.mutations.deleteTicketTier, {
          tierid: tier._id
        });
      }

      // Delete event
      await this.convex.mutation(api.events.mutations.deleteEvent, { eventId });

      console.log(`✓ Event ${eventId} and all related data deleted\n`);

    } catch (error) {
      console.error('Error cleaning up event:', error);
      throw error;
    }
  }

  /**
   * Clean up by date range
   */
  async cleanupByDateRange(startDate: number, endDate: number): Promise<void> {
    console.log(`\n[CLEANUP] Removing data from ${new Date(startDate)} to ${new Date(endDate)}...\n`);

    try {
      const events = await this.convex.query(api.events.queries.getAllEvents, {});

      const eventsInRange = events.filter((event: any) =>
        event._creationTime >= startDate && event._creationTime <= endDate
      );

      console.log(`Found ${eventsInRange.length} events in date range`);

      for (const event of eventsInRange) {
        await this.cleanupEvent(event._id);
      }

    } catch (error) {
      console.error('Error cleaning up by date range:', error);
      throw error;
    }
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<void> {
    console.log('\n[STATS] Test data statistics...\n');

    try {
      const events = await this.convex.query(api.events.queries.getAllEvents, {});
      const orders = await this.convex.query(api.orders.queries.getAllOrders, {});
      const tickets = await this.convex.query(api.tickets.queries.getAllTickets, {});

      const testEvents = events.filter((e: any) =>
        ['TEST', 'PREPAY Event', 'SPLIT Event'].some(p => e.name?.includes(p))
      );

      const testOrders = orders.filter((o: any) =>
        o.buyerEmail?.toLowerCase().includes('test')
      );

      const testTickets = tickets.filter((t: any) =>
        t.buyerEmail?.toLowerCase().includes('test')
      );

      console.log(`Test Events: ${testEvents.length} / ${events.length} total`);
      console.log(`Test Orders: ${testOrders.length} / ${orders.length} total`);
      console.log(`Test Tickets: ${testTickets.length} / ${tickets.length} total`);
      console.log('');

    } catch (error) {
      console.error('Error getting cleanup stats:', error);
    }
  }
}

// CLI usage
if (require.main === module) {
  const cleaner = new TestDataCleaner();

  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'all':
      cleaner.cleanupAll({
        deleteEvents: true,
        deleteOrders: true,
        deleteTickets: true,
        deleteUsers: false, // Safer to not delete users by default
        deleteCredits: false
      })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'events':
      cleaner.cleanupAll({ deleteEvents: true, deleteOrders: false, deleteTickets: false })
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'event':
      if (!arg) {
        console.error('Usage: node cleanup-test-data.js event <eventId>');
        process.exit(1);
      }
      cleaner.cleanupEvent(arg as Id<"events">)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'stats':
      cleaner.getCleanupStats()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'date-range':
      if (!process.argv[4]) {
        console.error('Usage: node cleanup-test-data.js date-range <startTimestamp> <endTimestamp>');
        process.exit(1);
      }
      cleaner.cleanupByDateRange(parseInt(arg), parseInt(process.argv[4]))
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    default:
      console.log('Test Data Cleanup Tool');
      console.log('\nUsage:');
      console.log('  node cleanup-test-data.js all           - Clean up all test data');
      console.log('  node cleanup-test-data.js events        - Clean up test events only');
      console.log('  node cleanup-test-data.js event <id>    - Clean up specific event');
      console.log('  node cleanup-test-data.js stats         - Show test data statistics');
      console.log('  node cleanup-test-data.js date-range <start> <end>  - Clean up by date');
      process.exit(0);
  }
}

export default TestDataCleaner;
