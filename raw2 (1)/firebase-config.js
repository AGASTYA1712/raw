// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// --- Your web app's Firebase configuration ---
// This object MUST contain your actual project keys from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyCMX4BNuJdKzxlsvfpZ-lOK3gCI2Vdzv7o",
  authDomain: "city-care-84712.firebaseapp.com",
  projectId: "city-care-84712",
  storageBucket: "city-care-84712.appspot.com",
  messagingSenderId: "846856159868",
  appId: "1:846856159868:web:ce1690b9fa538927f4fff9",
  measurementId: "G-WS64ZHZ6ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it for use in other files
export const auth = getAuth(app);
