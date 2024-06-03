import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDL2_hHgVFfeVchCgNGpmsHMcAoujayCj4",
  authDomain: "pass-the-cheese.firebaseapp.com",
  projectId: "pass-the-cheese",
  storageBucket: "pass-the-cheese.appspot.com",
  messagingSenderId: "27399289966",
  appId: "1:27399289966:web:30cfdcd47702087d36ba7f",
  measurementId: "G-DQCL6JEW7G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };