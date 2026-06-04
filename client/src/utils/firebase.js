import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "interviewiq-6a9e3.firebaseapp.com",
  projectId: "interviewiq-6a9e3",
  storageBucket: "interviewiq-6a9e3.firebasestorage.app",
  messagingSenderId: "267076114409",
  appId: "1:267076114409:web:171f818883dd3bd2d8dd78"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };