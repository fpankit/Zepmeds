
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpYF1VFWTjxRRXsx_hQAUBvbZetv945VE",
  authDomain: "zepmeds-admin-panel.firebaseapp.com",
  projectId: "zepmeds-admin-panel",
  storageBucket: "zepmeds-admin-panel.appspot.com",
  messagingSenderId: "731788163738",
  appId: "1:731788163738:web:644ab0e7387be742fefd23"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn('Firebase persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn('Firebase persistence is not available in this browser.');
    }
  });


export { app, db };
