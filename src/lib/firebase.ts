import { initializeApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqVtmnTBcztmSeVWVnIgIBw5L6F9sUR9M",
  authDomain: "remotehive-11fa2.firebaseapp.com",
  projectId: "remotehive-11fa2",
  storageBucket: "remotehive-11fa2.firebasestorage.app",
  messagingSenderId: "621774243602",
  appId: "1:621774243602:web:d88e74640bf066b84ed5cb",
  measurementId: "G-1VYPM6G4F8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { PhoneAuthProvider, signInWithCredential };
