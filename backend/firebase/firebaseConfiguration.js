// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDd3Tanizzje3lWTGlubvcqBW5LXfEQG64",
  authDomain: "gridirongpt-16422.firebaseapp.com",
  projectId: "gridirongpt-16422",
  storageBucket: "gridirongpt-16422.appspot.com",
  messagingSenderId: "967576037530",
  appId: "1:967576037530:web:c11b28681a75ee81ab9723",
  measurementId: "G-LJG46GXFEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);