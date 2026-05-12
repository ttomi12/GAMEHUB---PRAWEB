import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGFZWIB8FaK5SGai7ZVrVofjxvjGjNU3I",
  authDomain: "gamehub-b3e82.firebaseapp.com",
  projectId: "gamehub-b3e82",
  storageBucket: "gamehub-b3e82.firebasestorage.app",
  messagingSenderId: "619179282422",
  appId: "1:619179282422:web:cce48e275063874de881d7",
  measurementId: "G-1EJJ1R7R12"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);