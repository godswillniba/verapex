import React, { useEffect, useState } from "react";
import { authStateListener } from "../../firebase/auth";
import { listenToUserData } from "../../firebase/firestore";
import { DocumentData } from "firebase/firestore";

const FinanceAppMock: React.FC = () => {
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserData: () => void = () => {};

    const unsubscribeAuth = authStateListener((user) => {
      if (user) {
        unsubscribeUserData = listenToUserData(user, (data) => {
          setUserData(data);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserData();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Please sign in to access your finance dashboard</div>;
  }

  return (
    <div>
      <h1>Welcome to Your Finance Dashboard, {userData.displayName}</h1>

      {/* Display user data */}
      <div>
        <h2>Your Profile</h2>
        <img
          src={userData?.photoURL || userData?.profileImage || '/userImage/profile-pic.webp'}
          alt="Profile"
          style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }}
          onError={(e) => {
            console.log('Image failed to load:', e.currentTarget.src);
            e.currentTarget.src = '/userImage/profile-pic.webp';
          }}
        />
        <p>Email: {userData.email}</p>
        <p>
          Name: {userData.firstName} {userData.middleName}
        </p>
        {userData.createdAt && (
          <p>
            Account Created: {userData.createdAt.toDate().toLocaleDateString()}
          </p>
        )}
      </div>

      <div>
        <h2>Your Financial Summary</h2>
        <pre>{JSON.stringify(userData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default FinanceAppMock;