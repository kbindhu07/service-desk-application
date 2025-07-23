// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYhYM7AMksW6gkMkljRm1axcKd6C-xt7A",
  authDomain: "service-desk-app-91abc.firebaseapp.com",
  projectId: "service-desk-app-91abc",
  storageBucket: "service-desk-app-91abc.firebasestorage.app",
  messagingSenderId: "636144695347",
  appId: "1:636144695347:web:e89986fbffc555eef30b46",
  measurementId: "G-0522C11DBZ",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators locally only
if (window.location.hostname === "localhost") {
  // Firestore emulator connection — NO 'http://' or 'https://'
  connectFirestoreEmulator(db, "localhost", 8080);
  
  // Auth emulator connection — INCLUDE 'http://'
  connectAuthEmulator(auth, "http://localhost:9099");
}

export { auth, db };
