import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../firebase/auth';
import "../components/css/LogIn.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LogIn: React.FC = () => {
  // State for login fields
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [inputError, setInputError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigation hook
  const navigate = useNavigate();

  // Ref for the content wrapper to scroll to top
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Input sanitizer to prevent XSS
  const sanitizeInput = (input: string): string => {
    // Remove any potentially dangerous characters but keep valid input
    return input.replace(/[^\w\s@.-]/g, '');
  };

  // Validators
  const validateInput = (value: string): boolean => {
    // Check if input is empty
    if (!value.trim()) {
      setInputError("Please enter your email or phone number");
      return false;
    }

    // Remove any spaces and the +237 prefix if present
    const cleanedValue = value.replace(/\s+/g, '').replace(/^\+237/, '');

    // Check if input looks like an email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Check if input looks like a Cameroonian phone number (9 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{8}$/;

    if (emailRegex.test(value)) {
      setInputError("");
      return true;
    }

    if (phoneRegex.test(cleanedValue)) {
      setInputError("");
      return true;
    }

    setInputError("Please enter a valid email or phone number");
    return false;
  };

  // Input handlers
  const handleEmailOrPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setEmailOrPhone(sanitizedValue);
    if (sanitizedValue) {
      validateInput(sanitizedValue);
    } else {
      setInputError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!validateInput(emailOrPhone)) {
      toast.error("Please enter a valid email or phone number");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      setErrorMessage("Please enter your password");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Sign in with email or phone
      await signIn(emailOrPhone, password);

      // Store remember me preference if needed
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Show success toast
      toast.success("Login successful!");

      // Redirect to the protected page after successful login
      navigate('/finance');
    } catch (err: any) {
      console.error("Login error:", err);

      // Map Firebase error messages to user-friendly messages
      let errorMsg = "Invalid login credentials";

      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMsg = "Invalid email format";
            break;
          case 'auth/user-disabled':
            errorMsg = "This account has been disabled. Contact support for assistance";
            break;
          case 'auth/user-not-found':
            errorMsg = "No account found with this email";
            break;
          case 'auth/wrong-password':
            errorMsg = "Incorrect password";
            break;
          case 'auth/too-many-requests':
            errorMsg = "Too many unsuccessful login attempts. Please try again later";
            break;
          case 'auth/network-request-failed':
            errorMsg = "Network error. Please check your connection";
            break;
          case 'auth/invalid-login-credentials':
            errorMsg = "Invalid login credentials";
            break;
        }
      } else if (err.message && err.message.includes("Phone login requires")) {
        errorMsg = "Phone login is not fully set up. Please use your email instead.";
      }

      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isLoginButtonDisabled = !emailOrPhone || !password || !!inputError || loading;

  return (
    <div className="login-account-container">
      <div className="login-image-container"></div>
      <div className="login-content-wrapper" ref={contentWrapperRef}>
        <div className="login-header-section">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Log in to your account to continue <br /><br /> investing
          </p>
        </div>

        {errorMessage && (
          <div className="login-global-error-message" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form-section" onSubmit={handleLogin}>
          <div className={`login-input-floating ${inputError ? 'input-error' : ''}`}>
            <input
              type="text"
              id="emailOrPhone"
              placeholder=" "
              className="login-form-input"
              value={emailOrPhone}
              onChange={handleEmailOrPhoneChange}
              required
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "input-error" : undefined}
            />
            <label htmlFor="emailOrPhone">Email or Phone Number</label>
            {inputError && <p id="input-error" className="login-error-message">{inputError}</p>}
          </div>

          <div className="login-input-floating">
            <input 
              type="password" 
              id="password" 
              placeholder=" "
              value={password}
              onChange={handlePasswordChange}
              className="login-form-input"
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="login-terms-checkbox">
            <input 
              type="checkbox" 
              id="rememberMeCheckbox" 
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            <label htmlFor="rememberMeCheckbox">
              Remember me on this device
            </label>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoginButtonDisabled}
            style={{ opacity: isLoginButtonDisabled ? 0.6 : 1 }}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div className="login-signup-section">
          <p className="forgot-password">Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>

        <div className="forgot-password">
          <a href="/forgot-password">Forgot Password?</a>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default LogIn;