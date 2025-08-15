// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { FirebaseApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpkbG-Z02-Y-9T_jjE7vh3mzJqx91cvQM",
  authDomain: "mumbai-event-techies.firebaseapp.com",
  projectId: "mumbai-event-techies",
  storageBucket: "mumbai-event-techies.appspot.com",
  messagingSenderId: "4836776188",
  appId: "1:4836776188:web:f23cc66cbe0094e8321f79",
  measurementId: "G-3Y6FTENFHJ"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, analytics };
