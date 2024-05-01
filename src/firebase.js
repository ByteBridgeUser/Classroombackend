import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxWpGLflEj0k_iIpcN7bD1Lgre_wsPgmo",
  authDomain: "cabzeee-a2e2f.firebaseapp.com",
  projectId: "cabzeee-a2e2f",
  storageBucket: "cabzeee-a2e2f.appspot.com",
  messagingSenderId: "721955449007",
  appId: "1:721955449007:web:e2b768a2c90e1561110c5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app);
export const auth = getAuth(app);
export default app;