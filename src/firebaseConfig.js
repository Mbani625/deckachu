// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUgcfoebthGcSGjEbfnvFp1ImvZfXBOcg",
  authDomain: "deckachu-12d8b.firebaseapp.com",
  projectId: "deckachu-12d8b",
  storageBucket: "deckachu-12d8b.firebasestorage.app",
  messagingSenderId: "975256252223",
  appId: "1:975256252223:web:fda77ddd4bf8c4ac042d8a",
  measurementId: "G-YYZ5NCETYJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ✅ Export the correct references
export { app as firebaseApp, db };
