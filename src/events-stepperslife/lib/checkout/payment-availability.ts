/**
 * Payment availability checker for CUSTOMER checkout flows
 *
 * Determines which payment methods are available for CUSTOMERS buying tickets
 * NOTE: This is NOT for organizer credit purchases (see organizer payment flows)
 *
 * Available for customers:
 * - Stripe (includes Cash App via Stripe integration)
 * - PayPal (with split payment support)
 * - Cash (physical USD, staff validated, DEFAULT when no processor connected)
 *
 * NOT available for customers:
 * - Square (organizer-only, for buying credits from platform)
 * - Cash App via Square SDK (organizer-only)
 */

export type MerchantProcessor = 'STRIPE' | 'PAYPAL'; // Removed SQUARE - customer payments only
export type PaymentMethod = 'card' | 'paypal' | 'cash'; // Removed cashapp - use Stripe for Cash App

export interface PaymentConfig {
  merchantProcessor?: MerchantProcessor;
  creditCardEnabled?: boolean;
  paypalEnabled?: boolean; // Renamed from cashAppEnabled
}

export interface AvailablePaymentMethods {
  /** Credit/debit card payments available (via Stripe, includes Cash App via Stripe) */
  creditCard: boolean;
  /** PayPal payments available (with split payment support) */
  paypal: boolean;
  /** Cash in-person available (physical USD, staff validated, DEFAULT) */
  cash: boolean;
  /** Active merchant processor (STRIPE or PAYPAL only) */
  merchantProcessor?: MerchantProcessor;
  /** Cash requires staff approval */
  cashRequiresStaffApproval: boolean;
}

/**
 * Determine available payment methods based on payment config and staff settings
 *
 * Payment Hierarchy:
 * - Organizer Level: Choose merchant processor + enable/disable online methods
 * - Staff Level: Toggle "Accept Cash In-Person" only
 *
 * Visibility Rules:
 * - No processor configured: Only "Cash In-Person" option visible (if staff accepts)
 * - Processor configured: Show enabled online methods + cash (if staff accepts)
 * - Cash orders: Do not require merchant setup, always available when staff opts in
 *
 * @param paymentConfig - Event payment configuration from Convex
 * @param staffAcceptsCash - Whether any staff member accepts cash for this event
 * @returns Available payment methods
 */
export function getAvailablePaymentMethods(
  paymentConfig: PaymentConfig | null | undefined,
  staffAcceptsCash: boolean = false
): AvailablePaymentMethods {
  // No payment config means no online payments configured
  // DEFAULT: Cash only (physical USD, staff validated)
  if (!paymentConfig || !paymentConfig.merchantProcessor) {
    return {
      creditCard: false,
      paypal: false,
      cash: staffAcceptsCash, // Cash is DEFAULT when no Stripe/PayPal connected
      merchantProcessor: undefined,
      cashRequiresStaffApproval: true,
    };
  }

  // Payment config exists - check which methods are enabled
  const creditCard = paymentConfig.creditCardEnabled ?? true; // Default to enabled
  const paypal = paymentConfig.paypalEnabled ?? false; // Default to disabled

  return {
    creditCard,
    paypal,
    cash: staffAcceptsCash, // Cash always available alongside online methods
    merchantProcessor: paymentConfig.merchantProcessor,
    cashRequiresStaffApproval: true,
  };
}

/**
 * Check if any online payment method is available
 *
 * @param methods - Available payment methods
 * @returns true if card or paypal is available
 */
export function hasOnlinePaymentMethod(methods: AvailablePaymentMethods): boolean {
  return methods.creditCard || methods.paypal;
}

/**
 * Get default payment method (first available)
 *
 * Priority: card (Stripe) > paypal > cash (USD)
 *
 * @param methods - Available payment methods
 * @returns Default payment method or null if none available
 */
export function getDefaultPaymentMethod(methods: AvailablePaymentMethods): PaymentMethod | null {
  if (methods.creditCard) return 'card';
  if (methods.paypal) return 'paypal';
  if (methods.cash) return 'cash';
  return null;
}

/**
 * Validate if a selected payment method is available
 *
 * @param method - Selected payment method
 * @param methods - Available payment methods
 * @returns true if method is available
 */
export function isPaymentMethodAvailable(
  method: PaymentMethod,
  methods: AvailablePaymentMethods
): boolean {
  switch (method) {
    case 'card':
      return methods.creditCard;
    case 'paypal':
      return methods.paypal;
    case 'cash':
      return methods.cash;
    default:
      return false;
  }
}

/**
 * Get payment method display name
 *
 * @param method - Payment method
 * @returns Human-readable display name
 */
export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  switch (method) {
    case 'card':
      return 'Credit/Debit Card (Stripe)';
    case 'paypal':
      return 'PayPal';
    case 'cash':
      return 'Cash In-Person (USD)';
    default:
      return 'Unknown';
  }
}

/**
 * Get merchant processor display name
 *
 * @param processor - Merchant processor
 * @returns Human-readable display name
 */
export function getMerchantProcessorDisplayName(processor?: MerchantProcessor): string {
  if (!processor) return 'Not configured';

  switch (processor) {
    case 'STRIPE':
      return 'Stripe';
    case 'PAYPAL':
      return 'PayPal';
    default:
      return 'Unknown';
  }
}

/**
 * Check if email is required for a payment method
 * Cash payments don't require email (phone is sufficient)
 *
 * @param method - Payment method
 * @returns true if email is required
 */
export function isEmailRequired(method: PaymentMethod): boolean {
  return method !== 'cash';
}
