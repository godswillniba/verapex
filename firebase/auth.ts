import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";
import app from "./config";
import { getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config"; // Make sure to import db from your config

const auth = getAuth(app);

// Sign up with email and password
export const signUp = async (
  email: string, 
  password: string, 
  firstName: string, 
  middleName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${firstName} ${middleName}`
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Determine if input is email or phone
const isEmail = (input: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(input);
};

const isPhoneNumber = (input: string): boolean => {
  // Clean the input: remove spaces and +237 prefix
  const cleanedValue = input.replace(/\s+/g, '').replace(/^\+237/, '');
  // Check if input looks like a Cameroonian phone number (9 digits starting with 6-9)
  const phoneRegex = /^[6-9]\d{8}$/;
  return phoneRegex.test(cleanedValue);
};

// Format phone number to E.164 format for Firebase
const formatPhoneNumber = (phone: string): string => {
  // Clean the input and ensure it has the Cameroon country code
  const cleanedValue = phone.replace(/\s+/g, '').replace(/^\+237/, '');
  return `+237${cleanedValue}`;
};

// Sign in with email or phone
export const signIn = async (emailOrPhone: string, password: string) => {
  try {
    // Determine if the input is an email or phone number
    if (isEmail(emailOrPhone)) {
      // Email-based authentication
      const userCredential = await signInWithEmailAndPassword(auth, emailOrPhone, password);
      return userCredential.user;
    } else if (isPhoneNumber(emailOrPhone)) {
      // For phone-based authentication, we need to use a different approach
      // Firebase requires a two-step process for phone auth:
      // 1. Send a verification code
      // 2. Sign in with the code

      // Since we don't have the verification code in this flow,
      // we need to check if there's an existing user with this phone number
      // in your Firestore database and use that for authentication

      // This is a simplification - in a real implementation, you would:
      // 1. Query your Firestore for a user with this phone number
      // 2. Verify the password against a stored hash
      // 3. If valid, use custom tokens or another method to sign them in

      // For now, we'll throw an error suggesting to use email instead
      throw new Error("Phone login requires additional setup. Please use email login or implement phone verification.");
    } else {
      throw { code: 'auth/invalid-login-credentials' };
    }
  } catch (error) {
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check KYC status
export const checkKYCStatus = async (user: User) => {
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();

  if (!userData?.kyc || userData.kyc.status === 'rejected' || !userData.isKycCompleted) {
    return 'not_approved';
  }

  return userData.kyc.status;
};

// Auth state listener
export const authStateListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Session management
export const setSessionTimeout = (timeout: number = 30) => {
  const timeoutMinutes = timeout * 60 * 1000; // Convert to milliseconds
  let sessionTimer: NodeJS.Timeout;

  const resetTimer = () => {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
      logOut();
    }, timeoutMinutes);
  };

  // Reset timer on user activity
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();
};

// Track login history
export const trackLoginActivity = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const loginHistory = {
      timestamp: new Date(),
      device: navigator.userAgent,
      ip: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip)
    };

    await updateDoc(userRef, {
      loginHistory: arrayUnion(loginHistory)
    });
  } catch (error) {
    console.error("Error tracking login activity:", error);
  }
};

export default auth;