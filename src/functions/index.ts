/**
 * @fileOverview Firebase Functions for the Mumbai Event Techies app.
 *
 * This file contains the backend cloud functions that power the application,
 * such as sending notification emails when new events are submitted.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Get environment variables
const SENDGRID_API_KEY = functions.config().sendgrid?.key;
const ADMIN_EMAIL = functions.config().admin?.email || 'vnvinit67@gmail.com';
const REVIEW_URL_BASE = functions.config().admin?.review_url_base || 'https://mumbai-event-techies.vercel.app/admin/review';
const ADMIN_KEY = functions.config().admin?.key;

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('SendGrid Mail initialized.');
} else {
  console.error('SendGrid API key not found. Emails will not be sent.');
}

/**
 * A Cloud Function that triggers when a new document is created in the
 * `pendingEvents` collection. It sends an email to the admin for review.
 */
export const onNewEventSubmitted = functions.firestore
  .document('pendingEvents/{requestId}')
  .onCreate(async (snap, context) => {
    const { requestId } = context.params;
    const event = snap.data();

    console.log(`New event submitted with ID: ${requestId}`);

    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not configured. Cannot send review email.');
      return;
    }
    
    if (!ADMIN_KEY) {
        console.error('ADMIN_KEY is not set. Cannot generate review link.');
        return;
    }
    
    const reviewUrl = `${REVIEW_URL_BASE}/${requestId}?key=${ADMIN_KEY}`;
    const eventTitle = event.title || 'Untitled Event';

    const msg = {
      to: ADMIN_EMAIL,
      from: {
          name: 'Mumbai Event Techies',
          email: 'noreply@mumbai-event-techies.com', // This must be a verified sender in SendGrid
      },
      subject: `Review New Event Submission: ${eventTitle}`,
      html: `
        <h1>New Event Submission</h1>
        <p>A new event has been submitted via the URL scraper and is ready for your review.</p>
        
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
      console.log(`Review email successfully sent to ${ADMIN_EMAIL} for event: ${requestId}`);
    } catch (error) {
      console.error('Error sending email with SendGrid:', error);
      if ((error as any).response) {
        console.error('SendGrid Error Response:', (error as any).response.body);
      }
    }
  });

