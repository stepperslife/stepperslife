/**
 * End-to-End Restaurant System Validation Script
 *
 * This script creates a fully functional restaurant "Steppers Soul Kitchen"
 * with staff, menu, and places a test order to validate the entire system.
 *
 * Run via Convex dashboard or with: npx convex run scripts/setup-test-restaurant
 */

import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// =====================================================
// CONFIGURATION
// =====================================================

const RESTAURANT_DATA = {
  name: "Steppers Soul Kitchen",
  description: "Authentic soul food with a modern twist. Family recipes passed down for generations.",
  address: "123 Main Street",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
  phone: "(312) 555-0100",
  cuisine: ["Soul Food", "Southern", "Comfort Food"],
  contactName: "Test Owner",
  contactEmail: "owner@stepperslife.com",
  estimatedPickupTime: 25,
};

const OPERATING_HOURS = {
  monday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  tuesday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  wednesday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  thursday: { open: "11:00 AM", close: "10:00 PM", closed: false },
  friday: { open: "11:00 AM", close: "11:00 PM", closed: false },
  saturday: { open: "10:00 AM", close: "11:00 PM", closed: false },
  sunday: { open: "10:00 AM", close: "8:00 PM", closed: false },
};

const STAFF_INVITES = [
  {
    email: "manager@stepperslife.com",
    name: "Kitchen Manager",
    phone: "(312) 555-0101",
    role: "RESTAURANT_MANAGER" as const,
  },
  {
    email: "staff@stepperslife.com",
    name: "Order Handler",
    role: "RESTAURANT_STAFF" as const,
    permissions: {
      canManageOrders: true,
      canManageMenu: false,
      canManageHours: false,
      canViewAnalytics: false,
    },
  },
];

const MENU_CATEGORIES = [
  { name: "Appetizers", description: "Start your meal right", sortOrder: 1 },
  { name: "Main Dishes", description: "Hearty soul food favorites", sortOrder: 2 },
  { name: "Sides", description: "Classic southern sides", sortOrder: 3 },
  { name: "Desserts", description: "Sweet endings", sortOrder: 4 },
  { name: "Beverages", description: "Refreshing drinks", sortOrder: 5 },
];

const MENU_ITEMS = [
  // Main Dishes
  { category: "Main Dishes", name: "Fried Chicken", description: "Crispy fried chicken, 2 pieces with your choice of side", price: 1499, sortOrder: 1 },
  { category: "Main Dishes", name: "Smothered Pork Chops", description: "Tender pork chops in rich onion gravy", price: 1699, sortOrder: 2 },
  // Sides
  { category: "Sides", name: "Mac & Cheese", description: "Creamy three-cheese macaroni", price: 599, sortOrder: 1 },
  { category: "Sides", name: "Collard Greens", description: "Slow-cooked with smoked turkey", price: 499, sortOrder: 2 },
  { category: "Sides", name: "Cornbread", description: "Sweet buttermilk cornbread", price: 299, sortOrder: 3 },
  // Desserts
  { category: "Desserts", name: "Sweet Potato Pie", description: "Homemade with love", price: 699, sortOrder: 1 },
  // Beverages
  { category: "Beverages", name: "Sweet Tea", description: "Southern-style sweet tea", price: 299, sortOrder: 1 },
  { category: "Beverages", name: "Lemonade", description: "Fresh-squeezed lemonade", price: 349, sortOrder: 2 },
];

const CUSTOMER_ORDER = {
  customerName: "Ira Watkins",
  customerEmail: "ira@irawatkins.com",
  customerPhone: "(555) 123-4567",
  items: [
    { name: "Fried Chicken", quantity: 2 },
    { name: "Mac & Cheese", quantity: 1 },
    { name: "Collard Greens", quantity: 1 },
    { name: "Cornbread", quantity: 2 },
    { name: "Sweet Tea", quantity: 2 },
  ],
  specialInstructions: "Extra napkins please. Test order for validation.",
};

// =====================================================
// EXECUTION STEPS (for reference - run via Convex)
// =====================================================

/**
 * STEP 1: Create Restaurant
 * Run as authenticated user (will become owner)
 *
 * await ctx.runMutation(api.restaurants.apply, RESTAURANT_DATA);
 */

/**
 * STEP 2: Approve Restaurant (Admin only)
 *
 * await ctx.runMutation(api.restaurants.approve, { restaurantId });
 */

/**
 * STEP 3: Configure Operating Hours
 *
 * await ctx.runMutation(api.restaurantHours.updateHours, {
 *   restaurantId,
 *   operatingHours: OPERATING_HOURS
 * });
 */

/**
 * STEP 4: Invite Staff
 *
 * for (const staff of STAFF_INVITES) {
 *   await ctx.runAction(api.restaurantStaff.inviteStaffWithEmail, {
 *     restaurantId,
 *     ...staff
 *   });
 * }
 */

/**
 * STEP 5: Create Menu Categories
 *
 * const categoryIds = {};
 * for (const cat of MENU_CATEGORIES) {
 *   categoryIds[cat.name] = await ctx.runMutation(api.menuItems.createCategory, {
 *     restaurantId,
 *     ...cat
 *   });
 * }
 */

/**
 * STEP 6: Create Menu Items
 *
 * const menuItemIds = {};
 * for (const item of MENU_ITEMS) {
 *   menuItemIds[item.name] = await ctx.runMutation(api.menuItems.create, {
 *     restaurantId,
 *     categoryId: categoryIds[item.category],
 *     name: item.name,
 *     description: item.description,
 *     price: item.price,
 *     sortOrder: item.sortOrder
 *   });
 * }
 */

/**
 * STEP 7: Enable Order Acceptance
 *
 * await ctx.runMutation(api.restaurants.toggleAcceptingOrders, { id: restaurantId });
 */

/**
 * STEP 8: Place Test Order
 *
 * // First find the customer user
 * const customer = await ctx.runQuery(api.users.queries.getByEmail, {
 *   email: "ira@irawatkins.com"
 * });
 *
 * // Build order items with menu item IDs
 * const orderItems = CUSTOMER_ORDER.items.map(item => ({
 *   menuItemId: menuItemIds[item.name],
 *   name: item.name,
 *   price: MENU_ITEMS.find(m => m.name === item.name)!.price,
 *   quantity: item.quantity
 * }));
 *
 * // Calculate totals
 * const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 * const tax = Math.round(subtotal * 0.0875); // 8.75% tax
 * const total = subtotal + tax;
 *
 * const order = await ctx.runAction(api.foodOrders.createWithNotification, {
 *   restaurantId,
 *   customerId: customer?._id,
 *   customerName: CUSTOMER_ORDER.customerName,
 *   customerEmail: CUSTOMER_ORDER.customerEmail,
 *   customerPhone: CUSTOMER_ORDER.customerPhone,
 *   items: orderItems,
 *   subtotal,
 *   tax,
 *   total,
 *   paymentMethod: "pay_at_pickup",
 *   specialInstructions: CUSTOMER_ORDER.specialInstructions
 * });
 */

/**
 * STEP 9: Process Order Through Statuses
 *
 * const statuses = ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED"];
 * for (const status of statuses) {
 *   await ctx.runAction(api.foodOrders.updateStatusWithNotification, {
 *     id: order.orderId,
 *     status
 *   });
 *   // Add small delay between status updates for realistic testing
 *   await new Promise(resolve => setTimeout(resolve, 1000));
 * }
 *
 * // Mark as paid
 * await ctx.runMutation(api.foodOrders.updatePaymentStatus, {
 *   id: order.orderId,
 *   paymentStatus: "paid",
 *   paymentMethod: "cash"
 * });
 */

// Export configuration for use in Convex functions
export const CONFIG = {
  RESTAURANT_DATA,
  OPERATING_HOURS,
  STAFF_INVITES,
  MENU_CATEGORIES,
  MENU_ITEMS,
  CUSTOMER_ORDER,
};

console.log(`
=====================================================
END-TO-END RESTAURANT VALIDATION CONFIGURATION
=====================================================

Restaurant: ${RESTAURANT_DATA.name}
Location: ${RESTAURANT_DATA.city}, ${RESTAURANT_DATA.state}
Cuisine: ${RESTAURANT_DATA.cuisine.join(", ")}

Menu Categories: ${MENU_CATEGORIES.length}
Menu Items: ${MENU_ITEMS.length}

Staff to Invite:
${STAFF_INVITES.map(s => `  - ${s.name} (${s.role}): ${s.email}`).join("\n")}

Test Customer: ${CUSTOMER_ORDER.customerEmail}
Order Items: ${CUSTOMER_ORDER.items.length}
Estimated Total: $${(
  CUSTOMER_ORDER.items.reduce((sum, item) => {
    const menuItem = MENU_ITEMS.find(m => m.name === item.name);
    return sum + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0) * 1.0875 / 100
).toFixed(2)} (including 8.75% tax)

=====================================================
Run this script via Convex dashboard to execute.
=====================================================
`);
