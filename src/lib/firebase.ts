// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// PASTE YOUR NEW FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
  apiKey: "YOUR_NEW_API_KEY",
  authDomain: "YOUR_NEW_AUTH_DOMAIN",
  projectId: "YOUR_NEW_PROJECT_ID",
  storageBucket: "YOUR_NEW_STORAGE_BUCKET",
  messagingSenderId: "YOUR_NEW_MESSAGING_SENDER_ID",
  appId: "YOUR_NEW_APP_ID"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence enabled.
// This allows data to be cached locally and accessed when the user is offline.
// It also ensures that writes are queued and sent to the server upon reconnection.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});


export { app, db };
