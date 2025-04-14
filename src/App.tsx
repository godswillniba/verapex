import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import CreateAccount from "./pages/SignUp";
import NoPage from "./pages/NoPage";
import FinanceApp from "./pages/FinanceApp";
import FinaceAppMock from "./pages/FinaceAppMock";

import { useEffect, useState } from "react";
import { authStateListener } from "../firebase/auth";
import Preloader from "./components/Preloader";
import RouteTransition from "./components/RouteTransition";
import ChatBox from "./components/ChatBox";
import KYCVerification from "./pages/kyc/KYCVerification";
import { getUserProfileData } from "../firebase/firestore";
import InitialDeposit from "./components/InitialDeposit";
  import MobilePurchases from "./components/market/MobilePurchases";

// Root level authentication checker
const AuthenticationChecker = ({ children }) => {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);

      // Only redirect if we're on the landing page or root
      if (user && (location.pathname === "/" || location.pathname === "/start")) {
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  if (!authChecked) {
    return <Preloader fullScreen={true} size={60} text="Checking authentication..." />;
  }

  if (shouldRedirect) {
    return <Navigate to="/finance" replace />;
  }

  return children;
};

// Regular authentication check
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return <div style={{
               textAlign: "center",
               padding: "50px",
               fontFamily: "Arial, sans-serif",
               backgroundColor: "black",
               minHeight: "100vh",
               display: "flex",
               flexDirection: "column",
               justifyContent: "center",
               alignItems: "center",
               color: "#333",
             }} >Loading your data...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// KYC verification check for protected finance routes
const KYCProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileVerified, setIsProfileVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authStateListener(async (user) => {
      setIsAuthenticated(!!user);

      if (user) {
        try {
          const userData = await getUserProfileData(user.uid);
          setIsProfileVerified(userData?.isProfileVerified || false);
        } catch (error) {
          console.error("Error fetching user profile data:", error);
          setIsProfileVerified(false);
        }
      }

      setAuthChecked(true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading || !authChecked) {
    return <Preloader fullScreen={true} size={60} text="Loading Your Dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isProfileVerified) {
    return <Navigate to="/kyc" />;
  }

  return children;
};

export default function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const splashScreen = document.getElementById('splash-screen');

    const initApp = async () => {
      try {
        await Promise.all([
          import('./pages/FinanceApp'),
          import('./components/HomeTab'),
          Promise.all([
            new Promise(resolve => {
              const img = new Image();
              img.src = '/refer-people-image.png';
              img.onload = resolve;
            }),
            new Promise(resolve => {
              const img = new Image();
              img.src = '/withdrawal-image.png';
              img.onload = resolve;
            })
          ]),
          new Promise(resolve => setTimeout(resolve, 300))
        ]);

        setIsLoading(false);

        if (splashScreen) {
          splashScreen.style.opacity = '0';
          splashScreen.style.transition = 'opacity 0.3s ease-out';
          setTimeout(() => splashScreen.remove(), 300);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <Preloader fullScreen={true} size={60} text="Initializing application..." />;
  }

  return (
    <>
      <BrowserRouter>
        <AuthenticationChecker>
          <RouteTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route 
  path="/initial-deposit" 
  element={
    <KYCProtectedRoute>
      <InitialDeposit />
    </KYCProtectedRoute>
  } 
/>
              <Route path="/start" element={<LandingPage />} />
              <Route
                path="/login"
                element={<LogIn />}
              />
              <Route
                path="/signup"
                element={<CreateAccount />}
              />
              <Route
                path="/kyc"
                element={
                  <PrivateRoute>
                    <KYCVerification />
                  </PrivateRoute>
                }
              />
              <Route path="/dash" element={<FinaceAppMock />} />

              
              <Route path="/market" element={<MobilePurchases />} />
              <Route
                path="/finance"
                element={
                  <KYCProtectedRoute>
                    <FinanceApp />
                  </KYCProtectedRoute>
                }
              />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </RouteTransition>
        </AuthenticationChecker>
      </BrowserRouter>
      <ChatBox />
    </>
  );
}