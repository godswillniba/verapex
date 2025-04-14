import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  DocumentData,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import app from "./config";
import { User } from "firebase/auth";

// Initialize Firestore
const db = getFirestore(app);


export const getUserProfileData = async (userId: string): Promise<DocumentData | null> => {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return {
        uid: userId,
        ...docSnap.data(),
      };
    } else {
      console.log("No user document found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return null;
  }
};

// Set up real-time listener for user data
export const listenToUserData = (
  user: User | null,
  callback: (data: DocumentData | null) => void,
) => {
  if (!user) {
    callback(null);
    return () => {};
  }
  const userRef = doc(db, "users", user.uid);
  // Set up the listener
  const unsubscribe = onSnapshot(
    userRef,
    (doc) => {
      // Success case - document exists
      if (doc.exists()) {
        const data = {
          uid: user.uid,
          ...doc.data(),
        };
        callback(data);
      } else {
        // Document doesn't exist
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to user data:", error);
      callback(null);
    },
  );
  // Return the unsubscribe function
  return unsubscribe;
};

// Create user document in Firestore during signup
export const createUserDocument = async (
  user: User,
  firstName: string,
  middleName: string,
) => {
  if (!user) return null;
  try {
    const userRef = doc(db, "users", user.uid);
    // User data to be stored
    const userData = {
      uid: user.uid,
      email: user.email,
      firstName,
      middleName,
      displayName: `${firstName} ${middleName}`,
      createdAt: new Date(),
      isProfileVerified: false, // Add KYC verification status, default to false
      isFirstDepositCompleted: false, // Initialize deposit status to false
      // Add any other fields you need
    };
    await setDoc(userRef, userData);
    return userData;
  } catch (error) {
    console.error("Error creating user document:", error);
    return null;
  }
};

// Update user data
export const updateUserData = async (
  userId: string,
  data: Partial<DocumentData>,
) => {
  if (!userId) return null;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user data:", error);
    return false;
  }
};

// Update KYC verification status
export const updateKYCStatus = async (userId: string, isVerified: boolean) => {
  return updateUserData(userId, { isProfileVerified: isVerified });
};

// Update deposit completion status
export const updateDepositStatus = async (userId: string, isCompleted: boolean) => {
  return updateUserData(userId, { isFirstDepositCompleted: isCompleted });
};

// Leaderboard functionality
export const listenToLeaderboardData = (callback: (data: DocumentData[]) => void) => {
  const leaderboardRef = collection(db, "users");

  const unsubscribe = onSnapshot(
    query(leaderboardRef, 
      orderBy("referrals.count", "desc"), 
      orderBy("earnings.referrals", "desc"),
      limit(10)
    ),
    (snapshot) => {
      const leaderboardData = snapshot.docs.map(doc => ({
        displayName: doc.data().displayName,
        referralCount: doc.data().referrals?.count || 0,
        earnings: doc.data().earnings?.referrals || 0
      }));
      callback(leaderboardData);
    },
    (error) => {
      console.error("Error fetching leaderboard data:", error);
      callback([]);
    }
  );
  return unsubscribe;
};

export default db;