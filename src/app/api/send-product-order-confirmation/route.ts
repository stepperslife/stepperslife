import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  variantName?: string;
  vendorId?: string;
  vendorName?: string;
  vendorEmail?: string;
}

interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface OrderConfirmationRequest {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress?: ShippingAddress;
  shippingMethod: "DELIVERY" | "PICKUP";
  pickupNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderConfirmationRequest = await request.json();

    // Validation
    if (!orderData.customerEmail || !orderData.orderNumber || !orderData.items) {
      return NextResponse.json(
        { error: "Missing required fields: customerEmail, orderNumber, items" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const results = {
      customerEmail: null as string | null,
      vendorEmails: [] as string[],
      errors: [] as string[],
    };

    // 1. Send customer confirmation email
    try {
      const customerHtml = generateCustomerEmail(orderData);
      const customerResponse = await resend.emails.send({
        from: "SteppersLife Marketplace <marketplace@stepperslife.com>",
        to: orderData.customerEmail,
        subject: `Your Order #${orderData.orderNumber} from SteppersLife Marketplace`,
        html: customerHtml,
        headers: {
          "X-Entity-Ref-ID": orderData.orderNumber,
        },
      });

      if (customerResponse.error) {
        results.errors.push(`Customer email failed: ${customerResponse.error.message}`);
      } else {
        results.customerEmail = customerResponse.data?.id || null;
      }
    } catch (error) {
      results.errors.push(`Customer email error: ${error instanceof Error ? error.message : "Unknown"}`);
    }

    // 2. Group items by vendor and send vendor notification emails
    const vendorGroups = new Map<string, { email: string; name: string; items: OrderItem[] }>();

    for (const item of orderData.items) {
      if (item.vendorId && item.vendorEmail) {
        const existing = vendorGroups.get(item.vendorId);
        if (existing) {
          existing.items.push(item);
        } else {
          vendorGroups.set(item.vendorId, {
            email: item.vendorEmail,
            name: item.vendorName || "Vendor",
            items: [item],
          });
        }
      }
    }

    // Send email to each vendor
    for (const [vendorId, vendorData] of vendorGroups) {
      try {
        const vendorSubtotal = vendorData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const vendorHtml = generateVendorEmail({
          vendorName: vendorData.name,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          items: vendorData.items,
          vendorSubtotal,
          shippingAddress: orderData.shippingAddress,
          shippingMethod: orderData.shippingMethod,
          pickupNotes: orderData.pickupNotes,
        });

        const vendorResponse = await resend.emails.send({
          from: "SteppersLife Marketplace <marketplace@stepperslife.com>",
          to: vendorData.email,
          subject: `New Order #${orderData.orderNumber} - ${vendorData.items.length} item(s)`,
          html: vendorHtml,
          headers: {
            "X-Entity-Ref-ID": `${orderData.orderNumber}-${vendorId}`,
          },
        });

        if (vendorResponse.error) {
          results.errors.push(`Vendor ${vendorData.name} email failed: ${vendorResponse.error.message}`);
        } else {
          results.vendorEmails.push(vendorResponse.data?.id || vendorData.email);
        }
      } catch (error) {
        results.errors.push(`Vendor ${vendorData.name} email error: ${error instanceof Error ? error.message : "Unknown"}`);
      }
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      customerEmailId: results.customerEmail,
      vendorEmailIds: results.vendorEmails,
      errors: results.errors.length > 0 ? results.errors : undefined,
      message: results.errors.length === 0
        ? "All confirmation emails sent successfully"
        : `Sent with ${results.errors.length} error(s)`,
    });
  } catch (error) {
    console.error("Error sending order confirmation emails:", error);

    return NextResponse.json(
      {
        error: "Failed to send order confirmation emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateCustomerEmail(order: OrderConfirmationRequest): string {
  const subtotalFormatted = (order.subtotal / 100).toFixed(2);
  const shippingFormatted = (order.shippingCost / 100).toFixed(2);
  const taxFormatted = (order.taxAmount / 100).toFixed(2);
  const totalFormatted = (order.totalAmount / 100).toFixed(2);

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="80" valign="top">
                ${item.productImage
                  ? `<img src="${item.productImage}" alt="${item.productName}" width="70" height="70" style="border-radius: 8px; object-fit: cover;" />`
                  : `<div style="width: 70px; height: 70px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">📦</div>`
                }
              </td>
              <td style="padding-left: 15px;" valign="top">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">${item.productName}</p>
                ${item.variantName ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">${item.variantName}</p>` : ""}
                <p style="margin: 0; color: #666; font-size: 13px;">Qty: ${item.quantity} × $${(item.price / 100).toFixed(2)}</p>
                ${item.vendorName ? `<p style="margin: 5px 0 0 0; color: #9333ea; font-size: 12px;">Sold by ${item.vendorName}</p>` : ""}
              </td>
              <td align="right" valign="top" style="font-weight: bold; color: #333;">
                $${((item.price * item.quantity) / 100).toFixed(2)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join("");

  const shippingInfo = order.shippingMethod === "DELIVERY" && order.shippingAddress
    ? `
      <h4 style="margin: 0 0 10px 0; color: #333;">📦 Shipping Address</h4>
      <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
        ${order.shippingAddress.name}<br/>
        ${order.shippingAddress.address1}<br/>
        ${order.shippingAddress.address2 ? order.shippingAddress.address2 + "<br/>" : ""}
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
      </p>
    `
    : `
      <h4 style="margin: 0 0 10px 0; color: #333;">🏪 Pickup Order</h4>
      <p style="margin: 0; color: #666; font-size: 14px;">
        You'll be notified when your order is ready for pickup.
        ${order.pickupNotes ? `<br/><em>Note: ${order.pickupNotes}</em>` : ""}
      </p>
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                Order Confirmed! 🎉
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Thank you for your order, ${order.customerName}!
              </p>
            </td>
          </tr>

          <!-- Order Number -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #f0f0f0;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Order Number</p>
              <p style="margin: 0; color: #333; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">
                ${order.orderNumber}
              </p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemRows}
              </table>

              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background: #f8f9fa; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Subtotal:</td>
                        <td align="right" style="padding: 5px 0; color: #333; font-size: 14px;">$${subtotalFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Shipping:</td>
                        <td align="right" style="padding: 5px 0; color: #333; font-size: 14px;">${order.shippingCost === 0 ? "FREE" : "$" + shippingFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666; font-size: 14px;">Tax:</td>
                        <td align="right" style="padding: 5px 0; color: #333; font-size: 14px;">$${taxFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0 5px 0; color: #333; font-weight: bold; font-size: 18px; border-top: 2px solid #e0e0e0;">Total:</td>
                        <td align="right" style="padding: 15px 0 5px 0; color: #9333ea; font-weight: bold; font-size: 20px; border-top: 2px solid #e0e0e0;">$${totalFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Info -->
              <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                ${shippingInfo}
              </div>

              <!-- What's Next -->
              <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">✨ What's Next?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                  <li>The vendor will process your order</li>
                  <li>You'll receive updates on your order status</li>
                  ${order.shippingMethod === "DELIVERY"
                    ? "<li>Your order will be shipped to your address</li>"
                    : "<li>We'll notify you when it's ready for pickup</li>"}
                  <li>Payment is collected upon ${order.shippingMethod === "DELIVERY" ? "delivery" : "pickup"}</li>
                </ul>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Questions about your order? Contact us at<br/>
                <a href="mailto:support@stepperslife.com" style="color: #9333ea; text-decoration: none;">support@stepperslife.com</a>
              </p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://stepperslife.com/marketplace/orders" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
                  View Order Status
                </a>
              </p>
              <p style="margin: 20px 0 0 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} SteppersLife. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateVendorEmail(data: {
  vendorName: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  vendorSubtotal: number;
  shippingAddress?: ShippingAddress;
  shippingMethod: "DELIVERY" | "PICKUP";
  pickupNotes?: string;
}): string {
  const subtotalFormatted = (data.vendorSubtotal / 100).toFixed(2);

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #333;">${item.productName}</p>
          ${item.variantName ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">${item.variantName}</p>` : ""}
          <p style="margin: 0; color: #666; font-size: 13px;">Qty: ${item.quantity}</p>
        </td>
        <td align="right" style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">
          $${((item.price * item.quantity) / 100).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const shippingInfo = data.shippingMethod === "DELIVERY" && data.shippingAddress
    ? `
      <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
        <strong>Ship To:</strong><br/>
        ${data.shippingAddress.name}<br/>
        ${data.shippingAddress.address1}<br/>
        ${data.shippingAddress.address2 ? data.shippingAddress.address2 + "<br/>" : ""}
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
      </p>
    `
    : `
      <p style="margin: 0; color: #666; font-size: 14px;">
        <strong>Pickup Order</strong>
        ${data.pickupNotes ? `<br/>Customer note: ${data.pickupNotes}` : ""}
      </p>
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                🎉 New Order Received!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                You have a new order, ${data.vendorName}!
              </p>
            </td>
          </tr>

          <!-- Order Number -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #f0f0f0;">
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Order Number</p>
              <p style="margin: 0; color: #333; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">
                ${data.orderNumber}
              </p>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 30px; border-bottom: 2px solid #f0f0f0;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">👤 Customer Information</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: #333; font-size: 14px;"><strong>Name:</strong> ${data.customerName}</p>
                    <p style="margin: 0 0 8px 0; color: #333; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: #22c55e;">${data.customerEmail}</a></p>
                    ${data.customerPhone ? `<p style="margin: 0; color: #333; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${data.customerPhone}" style="color: #22c55e;">${data.customerPhone}</a></p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">📦 Order Items (${data.items.length})</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemRows}
                <tr>
                  <td style="padding: 15px 12px; font-weight: bold; color: #333; font-size: 16px;">Your Subtotal:</td>
                  <td align="right" style="padding: 15px 12px; font-weight: bold; color: #22c55e; font-size: 18px;">$${subtotalFormatted}</td>
                </tr>
              </table>

              <!-- Shipping Info -->
              <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                ${shippingInfo}
              </div>

              <!-- Action Button -->
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://stepperslife.com/vendor/dashboard/orders" target="_blank" style="display: inline-block; padding: 15px 30px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  View Order in Dashboard
                </a>
              </div>

              <!-- Next Steps -->
              <div style="margin-top: 30px; padding: 20px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">⏳ Next Steps</h4>
                <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                  <li>Review the order details</li>
                  <li>Prepare the items for ${data.shippingMethod === "DELIVERY" ? "shipping" : "pickup"}</li>
                  <li>Update the order status when ready</li>
                  <li>Contact customer if needed</li>
                </ol>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Need help? Contact us at<br/>
                <a href="mailto:vendors@stepperslife.com" style="color: #22c55e; text-decoration: none;">vendors@stepperslife.com</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} SteppersLife Marketplace. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
