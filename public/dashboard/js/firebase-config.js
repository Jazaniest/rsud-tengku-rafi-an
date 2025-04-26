// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3bkym_bjtQNx-ehY97XCaqKpTKMZYya0",
  authDomain: "rsud-tengku-rafi-an-fc8f1.firebaseapp.com",
  projectId: "rsud-tengku-rafi-an-fc8f1",
  storageBucket: "rsud-tengku-rafi-an-fc8f1.firebasestorage.app",
  messagingSenderId: "96564787793",
  appId: "1:96564787793:web:f88c2ee963e88c99f4d670",
  measurementId: "G-ZXDH1JG80C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };