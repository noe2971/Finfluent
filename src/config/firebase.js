// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "wealthify-c01b1.firebaseapp.com",
  projectId: "wealthify-c01b1",
  storageBucket: "wealthify-c01b1.appspot.com",
  messagingSenderId: "971931597834",
  appId: "1:971931597834:web:06321c7c9a6c0bc91d33f3",
  measurementId: "G-Z0WVJJHDR7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default firebaseConfig;