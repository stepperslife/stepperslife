/**
 * Send Instructor Digest Email API
 *
 * Called by Convex scheduled job to send daily/weekly instructor digests
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  generateInstructorDailyDigest,
  generateInstructorWeeklyDigest,
  generateNoActivityDigest,
  InstructorDailyDigestData,
  InstructorWeeklyDigestData,
  NoActivityDigestData,
} from '@/lib/email/templates/digest-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

type DigestRequest =
  | ({ type: 'daily' } & InstructorDailyDigestData)
  | ({ type: 'weekly' } & InstructorWeeklyDigestData)
  | ({ type: 'no-activity' } & NoActivityDigestData);

export async function POST(request: NextRequest) {
  try {
    const data: DigestRequest = await request.json();

    if (!data.instructorEmail || !data.instructorName) {
      return NextResponse.json(
        { error: 'Missing required fields: instructorEmail, instructorName' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('[InstructorDigest] RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    let emailResult: { html: string; subject: string };

    switch (data.type) {
      case 'weekly':
        emailResult = generateInstructorWeeklyDigest(data);
        break;

      case 'no-activity':
        emailResult = generateNoActivityDigest(data);
        break;

      case 'daily':
      default:
        emailResult = generateInstructorDailyDigest(data as InstructorDailyDigestData);
        break;
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'SteppersLife <noreply@stepperslife.com>',
      to: data.instructorEmail,
      subject: emailResult.subject,
      html: emailResult.html,
    });

    if (error) {
      console.error('[InstructorDigest] Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: emailData?.id,
      type: data.type,
      sentTo: data.instructorEmail,
      subject: emailResult.subject,
    });
  } catch (error) {
    console.error('[InstructorDigest] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
