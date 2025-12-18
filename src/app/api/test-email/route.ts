/**
 * Test Email Endpoint
 *
 * Used to preview and test email templates without real orders.
 * GET: Preview email HTML in browser
 * POST: Send test email to specified address
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { BWTemplate } from '@/lib/email/templates/base-bw-template';

const resend = new Resend(process.env.RESEND_API_KEY);

// Sample data for testing
const SAMPLE_DATA = {
  studentName: 'Ira Watkins',
  studentEmail: 'thestepperslife@gmail.com',
  orderNumber: 'CLS-2024-A1B2C3D4',
  orderDate: new Date().toISOString(),
  paymentMethod: 'Card ending in 4242',
  className: 'Beginner Chicago Stepping',
  instructorName: 'Marcus Johnson',
  classDate: 'Saturday, January 25, 2025',
  classTime: '7:00 PM',
  classEndTime: '9:00 PM',
  venueName: 'Chicago Dance Studio',
  venueAddress: '123 Michigan Ave',
  venueCity: 'Chicago',
  venueState: 'IL',
  venueZip: '60601',
  enrollments: [
    {
      ticketCode: 'TKT-STEP-001',
      tierName: 'Single Session',
      attendeeName: 'Ira Watkins',
      price: 2500, // $25.00
    }
  ],
  subtotalCents: 2500,
  platformFeeCents: 250,
  processingFeeCents: 102,
  totalCents: 2852,
};

// Generate enrollment receipt HTML
function generateEnrollmentReceiptHTML(data: typeof SAMPLE_DATA): string {
  const enrollmentRows = data.enrollments.map(e => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
        <div style="font-weight: 600; color: #1a1a1a;">${e.attendeeName}</div>
        <div style="font-size: 13px; color: #666666;">${e.tierName}</div>
        <div style="font-family: monospace; font-size: 12px; color: #999999; margin-top: 4px;">${e.ticketCode}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 500;">
        ${BWTemplate.formatPrice(e.price)}
      </td>
    </tr>
  `).join('');

  const content = `
    <div class="card">
      ${BWTemplate.header('Class Enrollment Receipt')}

      <h1 class="title">Enrollment Confirmed</h1>
      <p class="subtitle">Thank you for enrolling, ${data.studentName}!</p>

      <div class="text-center" style="margin-bottom: 24px;">
        <span class="receipt-number">${data.orderNumber}</span>
        <span style="margin: 0 8px; color: #ccc;">|</span>
        ${BWTemplate.statusBadge('confirmed')}
      </div>

      ${BWTemplate.sectionTitle('Class Details')}
      <div class="info-box-bordered">
        <div style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">
          ${data.className}
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 100px;">Instructor</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.instructorName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.classDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.classTime} - ${data.classEndTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px; vertical-align: top;">Location</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">
              ${data.venueName}<br>
              <span style="font-weight: 400; color: #666666;">${data.venueAddress}<br>${data.venueCity}, ${data.venueState} ${data.venueZip}</span>
            </td>
          </tr>
        </table>
      </div>

      ${BWTemplate.sectionTitle('Your Enrollment')}
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 12px; background: #fafafa; border: 1px solid #e0e0e0; text-align: left; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Attendee / Tier</th>
            <th style="padding: 12px; background: #fafafa; border: 1px solid #e0e0e0; text-align: right; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${enrollmentRows}
        </tbody>
      </table>

      ${BWTemplate.sectionTitle('Payment Summary')}
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${BWTemplate.infoRow('Enrollment Fee', BWTemplate.formatPrice(data.subtotalCents))}
        ${BWTemplate.infoRow('Platform Fee', BWTemplate.formatPrice(data.platformFeeCents))}
        ${BWTemplate.infoRow('Processing Fee', BWTemplate.formatPrice(data.processingFeeCents))}
        ${BWTemplate.totalRow('Total Paid', BWTemplate.formatPrice(data.totalCents))}
      </table>

      <div style="margin-top: 8px; text-align: right;">
        <span style="font-size: 12px; color: #666666;">Paid via ${data.paymentMethod}</span>
      </div>

      ${BWTemplate.noticeBox('Please arrive 10-15 minutes before class starts. Wear comfortable clothing and shoes suitable for dancing.')}

      ${BWTemplate.primaryButton('View My Enrollments', 'https://stepperslife.com/my-classes')}

      <div class="divider"></div>

      <p class="text-muted text-center">
        Questions about your enrollment?<br>
        Contact us at <a href="mailto:support@stepperslife.com" style="color: #1a1a1a;">support@stepperslife.com</a>
      </p>
    </div>
  `;

  return BWTemplate.wrap(content, `Enrollment confirmed for ${data.className}`);
}

// Generate instructor notification HTML
function generateInstructorNotificationHTML(): string {
  const content = `
    <div class="card">
      ${BWTemplate.header('Instructor Notification')}

      <h1 class="title">New Enrollment</h1>
      <p class="subtitle">A student has enrolled in your class!</p>

      ${BWTemplate.sectionTitle('Enrollment Details')}
      <div class="info-box-bordered">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 100px;">Student</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">Ira Watkins</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Class</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">Beginner Chicago Stepping</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">Saturday, January 25, 2025</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Tier</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">Single Session</td>
          </tr>
        </table>
      </div>

      ${BWTemplate.sectionTitle('Revenue')}
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${BWTemplate.infoRow('Ticket Price', '$25.00')}
        ${BWTemplate.infoRow('Platform Fee (10%)', '-$2.50')}
        ${BWTemplate.totalRow('Your Earnings', '$22.50')}
      </table>

      ${BWTemplate.sectionTitle('Class Summary')}
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #666666; font-size: 14px;">Total Enrollments</td>
            <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">12 students</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666666; font-size: 14px;">Capacity</td>
            <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px; text-align: right;">30 students</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #666666; font-size: 14px;">Total Revenue</td>
            <td style="padding: 4px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">$270.00</td>
          </tr>
        </table>
      </div>

      ${BWTemplate.primaryButton('View Roster', 'https://stepperslife.com/instructor/classes')}

      <div class="divider"></div>

      <p class="text-muted text-center">
        This is an automated notification from SteppersLife.
      </p>
    </div>
  `;

  return BWTemplate.wrap(content, 'New student enrolled in your class');
}

// Available templates for testing
const TEMPLATES: Record<string, () => { html: string; subject: string }> = {
  'enrollment-receipt': () => ({
    html: generateEnrollmentReceiptHTML(SAMPLE_DATA),
    subject: `Enrollment Confirmed: ${SAMPLE_DATA.className}`
  }),
  'instructor-notification': () => ({
    html: generateInstructorNotificationHTML(),
    subject: 'New Enrollment: Beginner Chicago Stepping'
  }),
};

// GET: Preview email in browser
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'enrollment-receipt';

  if (!TEMPLATES[template]) {
    return NextResponse.json(
      {
        error: 'Invalid template',
        available: Object.keys(TEMPLATES)
      },
      { status: 400 }
    );
  }

  const { html } = TEMPLATES[template]();

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

// POST: Send test email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template = 'enrollment-receipt', email = 'thestepperslife@gmail.com' } = body;

    if (!TEMPLATES[template]) {
      return NextResponse.json(
        {
          error: 'Invalid template',
          available: Object.keys(TEMPLATES)
        },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { html, subject } = TEMPLATES[template]();

    const fromAddresses: Record<string, string> = {
      'enrollment-receipt': 'SteppersLife Classes <classes@stepperslife.com>',
      'instructor-notification': 'SteppersLife Classes <classes@stepperslife.com>',
    };

    const { data, error } = await resend.emails.send({
      from: fromAddresses[template] || 'SteppersLife <noreply@stepperslife.com>',
      to: email,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      template,
      sentTo: email,
      subject: `[TEST] ${subject}`
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
