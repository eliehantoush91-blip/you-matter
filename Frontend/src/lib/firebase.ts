import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC7ylegcjSguVn4WZdCMC4t6NAAkNl_iE8",
  authDomain: "for-elie.firebaseapp.com",
  projectId: "for-elie",
  storageBucket: "for-elie.firebasestorage.app",
  messagingSenderId: "367390659906",
  appId: "1:367390659906:web:60bb0c742af91f9bd924db",
  measurementId: "G-PY6XV6W9MH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);



export default app;
