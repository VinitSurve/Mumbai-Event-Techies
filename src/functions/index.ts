/**
 * @fileOverview Firebase Functions for the Mumbai Event Techies application.
 *
 * This file contains the backend logic for handling events triggered by Firestore,
 * such as sending notification emails when a new event is submitted for review.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Get environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vnvint67@gmail.com';
const REVIEW_URL_BASE = process.env.REVIEW_URL_BASE || 'https://mumbai-event-techies.vercel.app/admin/review';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
}

/**
 * Triggered when a new document is created in the `pendingEvents` collection.
 * Sends an email notification to the admin for review.
 */
export const onEventSubmitted = functions.firestore
  .document('pendingEvents/{requestId}')
  .onCreate(async (snap, context) => {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured. Cannot send email.');
      return null;
    }

    const eventData = snap.data();
    const requestId = context.params.requestId;

    if (!eventData) {
      console.error(`No data found for pending event with ID: ${requestId}`);
      return null;
    }
    
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) {
        console.error('ADMIN_KEY is not set. Cannot generate review link.');
        return null;
    }

    const reviewUrl = `${REVIEW_URL_BASE}/${requestId}?key=${adminKey}`;
    const eventTitle = eventData.title || 'Untitled Event';

    const msg = {
      to: ADMIN_EMAIL,
      from: 'noreply@mumbai-event-techies.com', // Use a verified sender in your SendGrid account
      subject: `Review New Event Submission: ${eventTitle}`,
      html: `
        <h1>New Event Submission</h1>
        <p>A new event has been submitted and is ready for your review.</p>
        
        <h2>${eventTitle}</h2>
        
        <p><strong>Description:</strong> ${eventData.description || 'N/A'}</p>
        <p><strong>Date:</strong> ${eventData.event_date ? new Date(eventData.event_date).toLocaleString() : 'N/A'}</p>
        <p><strong>Location:</strong> ${eventData.location || 'N/A'}</p>
        <p><strong>Category:</strong> ${eventData.category || 'N/A'}</p>
        <p><strong>Original URL:</strong> <a href="${eventData.originalUrl}">${eventData.originalUrl}</a></p>
        
        <p>
          <a href="${reviewUrl}" style="background-color: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Review Event Now
          </a>
        </p>
        
        <p>Request ID: ${requestId}</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Review email sent to ${ADMIN_EMAIL} for event: ${requestId}`);
    } catch (error) {
      console.error('Error sending email with SendGrid:', error);
      if (error.response) {
        console.error(error.response.body);
      }
    }

    return null;
  });
