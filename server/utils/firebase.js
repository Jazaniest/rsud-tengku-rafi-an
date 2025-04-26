// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging"
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
  appId: "1:96564787793:web:167c33de18b9f0d9f4d670",
  measurementId: "G-D05931F7NJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const generateToken = async () => {
    const permission = await Notification.requestPermission();
    console.log(permission);
}