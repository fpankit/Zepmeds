// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});


export { app, db };
