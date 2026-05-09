// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBP_XZwCnkNpxV9ZlCqEYMaYE8T3bi0Mhg",
  authDomain: "ingredify-a77fb.firebaseapp.com",
  projectId: "ingredify-a77fb",
  storageBucket: "ingredify-a77fb.firebasestorage.app",
  messagingSenderId: "994731500079",
  appId: "1:994731500079:web:de7714295e8cc962019cda",
  measurementId: "G-1DBQKYJZYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);