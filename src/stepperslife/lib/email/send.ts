import { resend, FROM_EMAIL } from './client'
import {
  welcomeEmailTemplate,
  ticketPurchaseEmailTemplate,
  orderConfirmationEmailTemplate,
  passwordResetEmailTemplate,
  eventReminderEmailTemplate,
  vendorApprovalEmailTemplate,
  type WelcomeEmailData,
  type TicketPurchaseEmailData,
  type OrderConfirmationEmailData,
  type PasswordResetEmailData,
  type EventReminderEmailData,
  type VendorApprovalEmailData,
} from './templates'

export type EmailResult = {
  success: boolean
  messageId?: string
  error?: string
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  if (!resend) {
    console.warn('Email not sent - Resend client not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Email sending error:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  const { subject, html } = welcomeEmailTemplate(data)
  return sendEmail(data.email, subject, html)
}

export async function sendTicketPurchaseEmail(
  data: TicketPurchaseEmailData
): Promise<EmailResult> {
  const { subject, html } = ticketPurchaseEmailTemplate(data)
  return sendEmail(data.buyerEmail, subject, html)
}

export async function sendOrderConfirmationEmail(
  email: string,
  data: OrderConfirmationEmailData
): Promise<EmailResult> {
  const { subject, html } = orderConfirmationEmailTemplate(data)
  return sendEmail(email, subject, html)
}

export async function sendPasswordResetEmail(
  email: string,
  data: PasswordResetEmailData
): Promise<EmailResult> {
  const { subject, html } = passwordResetEmailTemplate(data)
  return sendEmail(email, subject, html)
}

export async function sendEventReminderEmail(
  email: string,
  data: EventReminderEmailData
): Promise<EmailResult> {
  const { subject, html } = eventReminderEmailTemplate(data)
  return sendEmail(email, subject, html)
}

export async function sendVendorApprovalEmail(
  email: string,
  data: VendorApprovalEmailData
): Promise<EmailResult> {
  const { subject, html } = vendorApprovalEmailTemplate(data)
  return sendEmail(email, subject, html)
}

// Batch sending for multiple recipients
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.all(
    recipients.map((to) => sendEmail(to, subject, html))
  )

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const errors = results
    .filter((r) => !r.success && r.error)
    .map((r) => r.error as string)

  return { sent, failed, errors }
}
