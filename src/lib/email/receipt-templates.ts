/**
 * Classic Black & White Receipt Templates for SteppersLife Marketplace
 *
 * Design principles:
 * - NO logos, NO icons, NO images
 * - NO colors, NO gradients - pure black text on white
 * - Monospace font (Courier New) for aligned receipts
 * - Table-based layout for email client compatibility
 * - Plain text fallback included
 * - Max width: 600px
 */

import {
  OrderReceiptData,
  VendorReceiptData,
  StaffNotificationData,
  EmailTemplate,
} from "./types";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format cents to dollar string (e.g., 1999 -> "$19.99")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format date to readable string (e.g., "December 18, 2025 at 2:45 PM")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + " at " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Pad string for alignment in plain text
 */
function padRight(str: string, length: number): string {
  return str.padEnd(length);
}

function padLeft(str: string, length: number): string {
  return str.padStart(length);
}

/**
 * Create separator line
 */
function separator(char: string = "-", length: number = 54): string {
  return char.repeat(length);
}

/**
 * Create double separator line
 */
function doubleSeparator(length: number = 54): string {
  return "=".repeat(length);
}

// ============================================================================
// CUSTOMER RECEIPT TEMPLATE
// ============================================================================

export function generateCustomerReceipt(data: OrderReceiptData): EmailTemplate {
  const subject = `Order Receipt #${data.orderNumber} - SteppersLife Marketplace`;

  // Generate plain text version
  const text = generateCustomerReceiptText(data);

  // Generate HTML version (monospace, black & white)
  const html = generateCustomerReceiptHtml(data, text);

  return { subject, html, text };
}

function generateCustomerReceiptText(data: OrderReceiptData): string {
  const lines: string[] = [];
  const w = 54; // width

  lines.push(doubleSeparator(w));
  lines.push(padLeft("STEPPERSLIFE MARKETPLACE", (w + 24) / 2));
  lines.push(padLeft("ORDER RECEIPT", (w + 13) / 2));
  lines.push(doubleSeparator(w));
  lines.push("");
  lines.push(`ORDER #: ${data.orderNumber}`);
  lines.push(`DATE:    ${formatDate(data.orderDate)}`);
  lines.push("");

  // Bill To
  lines.push(separator("-", w));
  lines.push("BILL TO:");
  lines.push(separator("-", w));
  lines.push(data.customerName);
  lines.push(data.customerEmail);
  if (data.customerPhone) {
    lines.push(data.customerPhone);
  }
  lines.push("");

  // Ship To / Pickup
  lines.push(separator("-", w));
  if (data.shippingMethod === "DELIVERY" && data.shippingAddress) {
    lines.push("SHIP TO:");
    lines.push(separator("-", w));
    lines.push(data.shippingAddress.name);
    lines.push(data.shippingAddress.address1);
    if (data.shippingAddress.address2) {
      lines.push(data.shippingAddress.address2);
    }
    lines.push(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}`);
  } else {
    lines.push("PICKUP ORDER");
    lines.push(separator("-", w));
    if (data.pickupNotes) {
      lines.push(`Notes: ${data.pickupNotes}`);
    } else {
      lines.push("You will be contacted with pickup details.");
    }
  }
  lines.push("");

  // Items
  lines.push(doubleSeparator(w));
  lines.push(padLeft("ITEMS", (w + 5) / 2));
  lines.push(doubleSeparator(w));
  lines.push("");

  for (const item of data.items) {
    const itemName = item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName;
    lines.push(itemName);
    if (item.vendorName) {
      lines.push(`  Vendor: ${item.vendorName}`);
    }
    const qtyLine = `  Qty: ${item.quantity} x ${formatCurrency(item.unitPrice)}`;
    const priceLine = formatCurrency(item.totalPrice);
    lines.push(padRight(qtyLine, w - priceLine.length) + priceLine);
    lines.push("");
  }

  // Totals
  lines.push(separator("-", w));
  const subtotalLabel = "Subtotal:";
  const shippingLabel = data.shippingMethod === "PICKUP" ? "Shipping:" : "Shipping:";
  const taxLabel = "Tax (8.75%):";
  const totalLabel = "TOTAL:";

  lines.push(padRight("", w - 20) + padRight(subtotalLabel, 12) + padLeft(formatCurrency(data.subtotal), 8));
  lines.push(padRight("", w - 20) + padRight(shippingLabel, 12) + padLeft(data.shippingCost === 0 ? "FREE" : formatCurrency(data.shippingCost), 8));
  lines.push(padRight("", w - 20) + padRight(taxLabel, 12) + padLeft(formatCurrency(data.taxAmount), 8));
  lines.push(separator("-", w));
  lines.push(padRight("", w - 20) + padRight(totalLabel, 12) + padLeft(formatCurrency(data.totalAmount), 8));
  lines.push(doubleSeparator(w));
  lines.push("");

  // Payment Status
  const paymentStatus = data.paymentStatus || "Pending - Pay When You Receive";
  lines.push(`PAYMENT STATUS: ${paymentStatus}`);
  lines.push("");

  // What's Next
  lines.push(separator("-", w));
  lines.push("WHAT HAPPENS NEXT?");
  lines.push(separator("-", w));
  lines.push("1. Your order is being prepared by our vendors");
  lines.push("2. You will receive tracking info when shipped");
  if (data.shippingMethod === "PICKUP") {
    lines.push("3. We will contact you when ready for pickup");
  } else {
    lines.push("3. Pay upon delivery (cash or card accepted)");
  }
  lines.push("");

  // Questions
  lines.push(separator("-", w));
  lines.push("QUESTIONS?");
  lines.push(separator("-", w));
  lines.push("Email: support@stepperslife.com");
  lines.push("Visit: stepperslife.com/orders");
  lines.push("");

  // Footer
  lines.push(doubleSeparator(w));
  lines.push(padLeft("Thank you for shopping with SteppersLife!", (w + 41) / 2));
  lines.push(doubleSeparator(w));

  return lines.join("\n");
}

function generateCustomerReceiptHtml(data: OrderReceiptData, plainText: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Receipt #${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.4; color: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="padding: 20px;">
              <pre style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(plainText)}</pre>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// VENDOR ALERT TEMPLATE
// ============================================================================

export function generateVendorReceipt(data: VendorReceiptData): EmailTemplate {
  const itemCount = data.vendorItems.reduce((sum, item) => sum + item.quantity, 0);
  const subject = `New Order #${data.orderNumber} - ${itemCount} item${itemCount !== 1 ? "s" : ""} to fulfill`;

  // Generate plain text version
  const text = generateVendorReceiptText(data);

  // Generate HTML version (monospace, black & white)
  const html = generateVendorReceiptHtml(data, text);

  return { subject, html, text };
}

function generateVendorReceiptText(data: VendorReceiptData): string {
  const lines: string[] = [];
  const w = 54; // width

  lines.push(doubleSeparator(w));
  lines.push(padLeft("STEPPERSLIFE - NEW ORDER ALERT", (w + 30) / 2));
  lines.push(doubleSeparator(w));
  lines.push("");
  lines.push(`ORDER #: ${data.orderNumber}`);
  lines.push(`DATE:    ${formatDate(data.orderDate)}`);
  lines.push("");

  // Customer Information
  lines.push(separator("-", w));
  lines.push("CUSTOMER INFORMATION");
  lines.push(separator("-", w));
  lines.push(`Name:  ${data.customerName}`);
  lines.push(`Email: ${data.customerEmail}`);
  if (data.customerPhone) {
    lines.push(`Phone: ${data.customerPhone}`);
  }
  lines.push("");

  // Shipping
  lines.push(separator("-", w));
  if (data.shippingMethod === "DELIVERY" && data.shippingAddress) {
    lines.push("SHIPPING: DELIVERY");
    lines.push(separator("-", w));
    lines.push(data.shippingAddress.name);
    lines.push(data.shippingAddress.address1);
    if (data.shippingAddress.address2) {
      lines.push(data.shippingAddress.address2);
    }
    lines.push(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}`);
  } else {
    lines.push("SHIPPING: PICKUP");
    lines.push(separator("-", w));
    if (data.pickupNotes) {
      lines.push(`Notes: ${data.pickupNotes}`);
    } else {
      lines.push("Customer will arrange pickup.");
    }
  }
  lines.push("");

  // Items to fulfill
  const itemCount = data.vendorItems.reduce((sum, item) => sum + item.quantity, 0);
  lines.push(doubleSeparator(w));
  lines.push(padLeft(`YOUR ITEMS TO FULFILL (${itemCount} item${itemCount !== 1 ? "s" : ""})`, (w + 30) / 2));
  lines.push(doubleSeparator(w));
  lines.push("");

  for (const item of data.vendorItems) {
    const itemName = item.variantName
      ? `${item.productName} - ${item.variantName}`
      : item.productName;
    lines.push(itemName);
    const qtyLine = `  Qty: ${item.quantity} x ${formatCurrency(item.unitPrice)}`;
    const priceLine = formatCurrency(item.totalPrice);
    lines.push(padRight(qtyLine, w - priceLine.length) + priceLine);
    lines.push("");
  }

  // Vendor Total
  lines.push(separator("-", w));
  const totalLabel = "YOUR TOTAL:";
  lines.push(padRight("", w - 22) + padRight(totalLabel, 14) + padLeft(formatCurrency(data.vendorSubtotal), 8));
  lines.push(doubleSeparator(w));
  lines.push("");

  // Action Required
  lines.push(separator("-", w));
  lines.push("ACTION REQUIRED");
  lines.push(separator("-", w));
  lines.push("1. Prepare the above items for shipping");
  lines.push("2. Update order status in your dashboard");
  lines.push("3. Ship within 2 business days");
  lines.push("4. Add tracking number when shipped");
  lines.push("");
  lines.push("Dashboard: stepperslife.com/vendor/dashboard/orders");
  lines.push("");

  lines.push(doubleSeparator(w));

  return lines.join("\n");
}

function generateVendorReceiptHtml(data: VendorReceiptData, plainText: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.4; color: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="padding: 20px;">
              <pre style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(plainText)}</pre>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// STAFF NOTIFICATION TEMPLATE
// ============================================================================

export function generateStaffNotification(data: StaffNotificationData): EmailTemplate {
  const subject = `[STAFF] New Order #${data.orderNumber} - ${formatCurrency(data.totalAmount)}`;

  // Generate plain text version
  const text = generateStaffNotificationText(data);

  // Generate HTML version (monospace, black & white)
  const html = generateStaffNotificationHtml(data, text);

  return { subject, html, text };
}

function generateStaffNotificationText(data: StaffNotificationData): string {
  const lines: string[] = [];
  const w = 54; // width

  lines.push(doubleSeparator(w));
  lines.push(padLeft("STEPPERSLIFE STAFF - ORDER PLACED", (w + 33) / 2));
  lines.push(doubleSeparator(w));
  lines.push("");
  lines.push(`ORDER #: ${data.orderNumber}`);
  lines.push(`DATE:    ${formatDate(data.orderDate)}`);
  lines.push(`STATUS:  ${data.paymentStatus || "Payment Pending"}`);
  lines.push("");

  // Customer Details
  lines.push(doubleSeparator(w));
  lines.push(padLeft("CUSTOMER DETAILS", (w + 16) / 2));
  lines.push(doubleSeparator(w));
  lines.push(`Name:  ${data.customerName}`);
  lines.push(`Email: ${data.customerEmail}`);
  if (data.customerPhone) {
    lines.push(`Phone: ${data.customerPhone}`);
  }
  lines.push("");

  // Order Summary
  lines.push(doubleSeparator(w));
  lines.push(padLeft("ORDER SUMMARY", (w + 13) / 2));
  lines.push(doubleSeparator(w));
  lines.push(`Total Items:    ${data.totalItems}`);
  lines.push(`Total Vendors:  ${data.vendorCount}`);
  lines.push(`Subtotal:       ${formatCurrency(data.subtotal)}`);
  lines.push(`Shipping:       ${data.shippingCost === 0 ? "FREE" : formatCurrency(data.shippingCost)}`);
  lines.push(`Tax:            ${formatCurrency(data.taxAmount)}`);
  lines.push(separator("-", w));
  lines.push(`GRAND TOTAL:    ${formatCurrency(data.totalAmount)}`);
  lines.push("");

  // Vendor Breakdown
  if (data.vendorBreakdown && data.vendorBreakdown.length > 0) {
    lines.push(doubleSeparator(w));
    lines.push(padLeft("VENDOR BREAKDOWN", (w + 16) / 2));
    lines.push(doubleSeparator(w));
    for (const vendor of data.vendorBreakdown) {
      lines.push(`${vendor.vendorName} (${vendor.vendorEmail})`);
      lines.push(`  - ${vendor.itemCount} item${vendor.itemCount !== 1 ? "s" : ""} = ${formatCurrency(vendor.subtotal)}`);
      lines.push("");
    }
  }

  // Shipping Address
  lines.push(separator("-", w));
  if (data.shippingMethod === "DELIVERY" && data.shippingAddress) {
    lines.push("SHIPPING ADDRESS");
    lines.push(separator("-", w));
    lines.push(data.shippingAddress.name);
    lines.push(data.shippingAddress.address1);
    if (data.shippingAddress.address2) {
      lines.push(data.shippingAddress.address2);
    }
    lines.push(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}`);
  } else {
    lines.push("PICKUP ORDER");
    lines.push(separator("-", w));
    if (data.pickupNotes) {
      lines.push(`Notes: ${data.pickupNotes}`);
    }
  }
  lines.push("");

  // Email Status
  if (data.emailResults) {
    lines.push(doubleSeparator(w));
    lines.push(padLeft("EMAIL STATUS", (w + 12) / 2));
    lines.push(doubleSeparator(w));
    lines.push(`Customer Email: ${data.emailResults.customerSent ? "SENT" : "FAILED"}`);
    const vendorTotal = data.emailResults.vendorsSent + data.emailResults.vendorsFailed;
    if (data.emailResults.vendorsFailed > 0) {
      lines.push(`Vendor Emails:  ${data.emailResults.vendorsSent}/${vendorTotal} SENT (${data.emailResults.vendorsFailed} FAILED)`);
    } else {
      lines.push(`Vendor Emails:  ${data.emailResults.vendorsSent}/${vendorTotal} SENT`);
    }
    lines.push("");
  }

  lines.push("Admin Dashboard: stepperslife.com/admin/orders");
  lines.push("");
  lines.push(doubleSeparator(w));

  return lines.join("\n");
}

function generateStaffNotificationHtml(data: StaffNotificationData, plainText: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[STAFF] Order #${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.4; color: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="padding: 20px;">
              <pre style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(plainText)}</pre>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
