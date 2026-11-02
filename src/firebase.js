// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByWErI-_d1rptZp0-7dIRk7z_vSxyqg9c",
  authDomain: "digital-art-gallery-1911.firebaseapp.com",
  projectId: "digital-art-gallery-1911",
  storageBucket: "digital-art-gallery-1911.firebasestorage.app",
  messagingSenderId: "71226845852",
  appId: "1:71226845852:web:cc0c2902dc378d496b5b59"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app
export default app;