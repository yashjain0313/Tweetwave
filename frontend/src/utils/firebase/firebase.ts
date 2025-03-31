import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import axios from "axios";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const response = await sendGoogleUserToBackend(user);
    return response;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

const sendGoogleUserToBackend = async (user: FirebaseUser) => {
  try {
    const { displayName, email, uid, photoURL } = user;

    if (!email) {
      throw new Error("Email is required for authentication");
    }

    let fullname = displayName || "User";
    const username =
      email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || uid.substring(0, 10);

    const userData = {
      email,
      fullname,
      username,
      provider: "google",
      googleId: uid,
      profilePicture: photoURL || "",
    };

    const response = await axios.post("/api/auth/google-login", userData);
    return response.data;
  } catch (error) {
    console.error("Error sending Google user to backend:", error);
    throw error;
  }
};

export { auth, googleProvider };
