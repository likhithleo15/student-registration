import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2yA6mRtDoh6Jhd6JQU5kbj_sWM1vOfVc",
  authDomain: "student-registration-5bdb2.firebaseapp.com",
  projectId: "student-registration-5bdb2",
  storageBucket: "student-registration-5bdb2.firebasestorage.app",
  messagingSenderId: "1007566862922",
  appId: "1:1007566862922:web:1000f1912273eb23b5c4b3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);