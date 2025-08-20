'use server';

/**
 * @fileOverview A Genkit flow for sending an admin review email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as sgMail from '@sendgrid/mail';
import { Event } from '@/lib/types';


const SendReviewEmailInputSchema = z.object({
  requestId: z.string().describe("The unique ID of the submission request."),
  event: z.any().describe("The event data object that was scraped."),
});

export type SendReviewEmailInput = z.infer<typeof SendReviewEmailInputSchema>;

export async function sendReviewEmail(input: SendReviewEmailInput): Promise<void> {
  return sendReviewEmailFlow(input);
}

const sendReviewEmailFlow = ai.defineFlow(
  {
    name: 'sendReviewEmailFlow',
    inputSchema: SendReviewEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { requestId, event } = input;
    
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vnvinit67@gmail.com';
    const REVIEW_URL_BASE = process.env.REVIEW_URL_BASE || 'https://mumbai-event-techies.vercel.app/admin/review';

    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set. Emails will not be sent.');
      return;
    }
     if (!ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set. Cannot send email.');
      return;
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const adminKey = process.env.ADMIN_KEY || "SUPER_SECRET_ADMIN_KEY";
    if (!adminKey) {
        console.error('ADMIN_KEY is not set. Cannot generate review link.');
        return;
    }

    const reviewUrl = `${REVIEW_URL_BASE}/${requestId}?key=${adminKey}`;
    const eventTitle = event.title || 'Untitled Event';

    const msg = {
      to: ADMIN_EMAIL,
      from: 'noreply@mumbai-event-techies.com', // This needs to be a verified sender in your SendGrid account
      subject: `Review New Event Submission: ${eventTitle}`,
      html: `
        <h1>New Event Submission</h1>
        <p>A new event has been submitted and is ready for your review.</p>
        
        <h2>${eventTitle}</h2>
        
        <p><strong>Description:</strong> ${event.description || 'N/A'}</p>
        <p><strong>Date:</strong> ${event.event_date ? new Date(event.event_date).toLocaleString() : 'N/A'}</p>
        <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
        <p><strong>Category:</strong> ${event.category || 'N/A'}</p>
        <p><strong>Original URL:</strong> <a href="${event.originalUrl}">${event.originalUrl}</a></p>
        
        <p style="margin-top: 20px;">
          <a href="${reviewUrl}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px;">
            Review Event Now
          </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Request ID: ${requestId}</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Review email sent to ${ADMIN_EMAIL} for event: ${requestId}`);
    } catch (error) {
      console.error('Error sending email with SendGrid:', error);
      if ((error as any).response) {
        console.error((error as any).response.body);
      }
      // Re-throw the error so the flow fails if email sending fails
      throw error;
    }
  }
);
