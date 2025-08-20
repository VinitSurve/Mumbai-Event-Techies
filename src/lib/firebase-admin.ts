// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountString) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
    }

    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // In a production environment, you might want to throw the error to halt startup
    // if the admin SDK is essential for the application's core functionality.
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;
