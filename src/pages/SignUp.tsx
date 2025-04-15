import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "../components/css/SignUp.css";
import BackButton from "../components/BackButton"

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    // State for first step
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [referrerId, setReferrerId] = useState("");
    const [isReferrerFromUrl, setIsReferrerFromUrl] = useState(false);

    // State for second step
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{
      score: number;
      feedback: string;
    }>({ score: 0, feedback: "" });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // State to track current step
    const [currentStep, setCurrentStep] = useState(1);

    // Ref for the content wrapper to scroll to top
    const contentWrapperRef = useRef<HTMLDivElement>(null);

    // Extract referrer ID from URL on component mount
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get("ref");
      if (refParam) {
        setReferrerId(refParam);
        setIsReferrerFromUrl(true); // Set flag when referrer comes from URL
      }
    }, []);

    useEffect(() => {
      // Validate password and check if passwords match whenever either password field changes
      if (password) {
        // Check password strength
        const strength = checkPasswordStrength(password);
        setPasswordStrength(strength);

        // Check if passwords match
        if (confirmPassword) {
          if (password === confirmPassword) {
            setPasswordsMatch(true);
            setErrorMessage("");
          } else {
            setPasswordsMatch(false);
            setErrorMessage("Passwords do not match");
          }
        }
      } else {
        setPasswordsMatch(false);
        setPasswordStrength({ score: 0, feedback: "" });
        setErrorMessage("");
      }
    }, [password, confirmPassword]);

    // Scroll to top whenever step changes
    useEffect(() => {
      if (contentWrapperRef.current) {
        // Scroll the content wrapper to the top
        contentWrapperRef.current.scrollTop = 0;

        // Also ensure the window is scrolled to the top
        window.scrollTo(0, 0);
      }
    }, [currentStep]);

    // Password strength checker
    const checkPasswordStrength = (
      pass: string,
    ): { score: number; feedback: string } => {
      let score = 0;
      let feedback = "";

      if (pass.length < 8) {
        return {
          score: 0,
          feedback: "Password should be at least 8 characters long",
        };
      }

      // Length check
      score += Math.min(2, Math.floor(pass.length / 4));

      // Complexity checks
      if (/[A-Z]/.test(pass)) score += 1;
      if (/[a-z]/.test(pass)) score += 1;
      if (/[0-9]/.test(pass)) score += 1;
      if (/[^A-Za-z0-9]/.test(pass)) score += 1;

      // Provide feedback based on score
      if (score < 3) {
        feedback = "Weak password. Try adding numbers and special characters.";
      } else if (score < 4) {
        feedback = "Moderate password. Try adding more variety.";
      } else if (score < 5) {
        feedback = "Good password.";
      } else {
        feedback = "Strong password!";
      }

      return { score, feedback };
    };

    // Input sanitizer to prevent XSS
    const sanitizeInput = (input: string): string => {
        // Remove any potentially dangerous characters but keep valid input
        return input.replace(/[^\w\s@.-]/g, '');
    };

    // Validators
    const validateEmail = (emailValue: string): boolean => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = regex.test(emailValue);

      if (!isValid && emailValue) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }

      return isValid;
    };

    const validatePhone = (phoneValue: string): boolean => {
      // Assuming Cameroon phone format
      const regex = /^[6-9]\d{8}$/;
      const isValid = regex.test(phoneValue);

      if (!isValid && phoneValue) {
        setPhoneError("Please enter a valid 9-digit phone number");
      } else {
        setPhoneError("");
      }

      return isValid;
    };

    // Handle referrer ID change
    const handleReferrerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isReferrerFromUrl) {
        const sanitizedValue = sanitizeInput(e.target.value);
        setReferrerId(sanitizedValue);
      }
    };

    // Get full phone number with country code
    const getFullPhoneNumber = (): string => {
      return `+237${phoneInput}`;
    };

    // Merge first and middle name
    const getMergedName = (): string => {
      // Trim and combine first and middle names, handling cases with or without middle name
      return middleName
        ? `${firstName.trim()} ${middleName.trim()}`.trim()
        : firstName.trim();
    };

    // Handlers for first step
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeInput(e.target.value);
      setFirstName(sanitizedValue);
    };

    const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeInput(e.target.value);
      setMiddleName(sanitizedValue);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, ""); // Only keep digits
      setPhoneInput(value);
      validatePhone(value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      validateEmail(value);
    };

    // Handlers for second step
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setConfirmPassword(e.target.value);
    };

    const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTermsAccepted(e.target.checked);
    };



    // Navigation handlers
    const handleNextClick = () => {
      // Validate all fields before proceeding
      const isEmailValid = validateEmail(email);
      const isPhoneValid = validatePhone(phoneInput);

      if (isEmailValid && isPhoneValid && firstName) {
        setCurrentStep(2);
      } else {
        if (!firstName) {
          setErrorMessage("Please enter your first name");
        } else if (!isEmailValid) {
          setErrorMessage("Please enter a valid email address");
        } else if (!isPhoneValid) {
          setErrorMessage("Please enter a valid phone number");
        }
      }
    };

    const handleBackClick = () => {
      setCurrentStep(1);
      setErrorMessage("");
    };

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const handleCreateAccount = async () => {
      // Validate all inputs again
      if (passwordsMatch && termsAccepted && passwordStrength.score >= 3) {
        try {
          // Get the full phone number with country code
          const fullPhoneNumber = getFullPhoneNumber();

          // Prepare the data to send
          const userData = {
            name: getMergedName(), // Use merged name instead of separate firstName and middleName
            phone: fullPhoneNumber,
            email,
            referrerId,
            password,
            confirmPassword,
          };

          // Debug log: Inspect userData before sending
          console.log("Sending registration data:", userData);

          // Send the POST request
          const response = await fetch(
            "https://6f49c1e3-0c16-44cb-8923-e185e16f95d8-00-xv5dpi7cxs54.worf.replit.dev/register",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData),
            },
          );

          // Debug log: Log the raw response
          console.log("Server response status:", response.status);
          console.log(
            "Response headers:",
            Object.fromEntries(response.headers.entries()),
          );

          // Parse the response
          const result = await response.json();
          console.log("Parsed response data:", result);

          // Handle the response
          if (response.ok) {
            // Show success toast and navigate
            toast.success(result.message || "Account created successfully! You can now log in.");
            // Wait a moment for the toast to be visible before navigating
            setTimeout(() => {
              navigate("/finance");
            }, 3000);
          } else {
            // Show error message from the server
            toast.error(
              result.error || "Failed to create account. Please try again.",
            );
            setErrorMessage(
              result.error || "Failed to create account. Please try again.",
            );
          }
        } catch (error: any) {
          console.error("Error creating account:", error);
          console.error("Error details:", {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
          });
          setErrorMessage(
            "An unexpected error occurred. Please try again later.",
          );
        } finally {
          setIsCreatingAccount(false);
        }
      } else {
        if (!passwordsMatch) {
          setErrorMessage("Passwords do not match");
        } else if (passwordStrength.score < 3) {
          setErrorMessage("Please use a stronger password");
        } else if (!termsAccepted) {
          setErrorMessage("Please accept the terms and conditions");
        }
      }
    };

    const isNextButtonDisabled =
      !firstName || !phoneInput || !email || !!phoneError || !!emailError;
    const isCreateButtonDisabled =
      !passwordsMatch ||
      !termsAccepted ||
      !password ||
      !confirmPassword ||
      passwordStrength.score < 3;


    

  return (
    <div className="signup-container">
      <BackButton 
        location="/login"/>
      <div className="signup-image-container"></div>
      <div className="signup-content-wrapper" ref={contentWrapperRef}>
        {/* Back button at top left */}
        {currentStep === 2 && (
          <button
            className="signup-back-button"
            onClick={handleBackClick}
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="signup-header-section">
          <h1 className="signup-title">Create an Account</h1>
          {currentStep === 1 ? (
            <p className="signup-subtitle">
              We're happy to have you onboard, create an account with us and
              start earning from your little but big investments
            </p>
          ) : (
            <p className="signup-subtitle">
              Create a secure password to safely access your account.
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="signup-global-error-message" role="alert">
            {errorMessage}
          </div>
        )}

        {currentStep === 1 ? (
          <form
            className="signup-form-section"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* First Name with floating label */}
            <div className="signup-input-floating">
              <input
                type="text"
                id="firstName"
                placeholder=" "
                className="signup-form-input"
                value={firstName}
                onChange={handleFirstNameChange}
                required
                maxLength={50}
              />
              <label htmlFor="firstName">First Name</label>
            </div>

            {/* Middle Name with floating label */}
            <div className="signup-input-floating">
              <input
                type="text"
                id="middleName"
                placeholder=" "
                className="signup-form-input"
                value={middleName}
                onChange={handleMiddleNameChange}
                maxLength={50}
              />
              <label htmlFor="middleName">Middle Name</label>
            </div>

            {/* Phone Number with floating label */}
            <div className="signup-input-floating signup-phone-input-floating">
              <div className="signup-phone-input-container">
                <span className="signup-country-code">+237</span>
                <input
                  type="tel"
                  id="phoneNumber"
                  placeholder=" "
                  className={`signup-form-input signup-phone-input ${phoneError ? "input-error" : ""}`}
                  value={phoneInput}
                  onChange={handlePhoneChange}
                  required
                  maxLength={9}
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? "phone-error" : undefined}
                />
                <label htmlFor="phoneNumber">Phone Number</label>
              </div>
              {phoneError && (
                <p id="phone-error" className="signup-error-message">
                  {phoneError}
                </p>
              )}
            </div>

            {/* Email with floating label */}
            <div className="signup-input-floating">
              <input
                type="email"
                id="email"
                placeholder=" "
                className={`signup-form-input ${emailError ? "input-error" : ""}`}
                value={email}
                onChange={handleEmailChange}
                required
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "signup-email-error" : undefined}
              />
              <label htmlFor="email">Email</label>
              {emailError && (
                <p id="email-error" className="signup-error-message">
                  {emailError}
                </p>
              )}
            </div>


            <div className="signup-input-floating">
              <input
                type="text"
                id="referrerId"
                placeholder=" "
                className={`signup-form-input ${isReferrerFromUrl ? "signup-referrer-readonly" : ""}`}
                value={referrerId}
                onChange={handleReferrerIdChange}
                maxLength={50}
                readOnly={isReferrerFromUrl}
              />
              <label htmlFor="referrerId">
                Referrer ID{" "}
                {isReferrerFromUrl && (
                  <span className="signup-referrer-tag">
                    (From referral link)
                  </span>
                )}
              </label>

              {isReferrerFromUrl ? (
                <p className="signup-help-text">
                  This field was automatically filled from your referral link
                  and cannot be changed
                </p>
              ) : (
                <p className="signup-help-text">
                  Enter a referrer ID if you were referred by someone
                </p>
              )}
            </div>



            <button
              type="button"
              className="signup-next-button"
              onClick={handleNextClick}
              disabled={isNextButtonDisabled}
              style={{ opacity: isNextButtonDisabled ? 0.6 : 1 }}
            >
              Next
            </button>
          </form>
        ) : (
          <form
            className="signup-form-section"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Password with floating label */}
            <div className="signup-input-floating">
              <input
                type="password"
                id="password"
                placeholder=" "
                value={password}
                onChange={handlePasswordChange}
                className={`signup-form-input ${passwordStrength.score < 3 && password ? "input-error" : ""}`}
                required
                minLength={8}
                aria-describedby="password-strength"
              />
              <label htmlFor="password">Password</label>
              {password && (
                <div
                  id="password-strength"
                  className={`signup-password-strength strength-${passwordStrength.score}`}
                >
                  <div className="signup-strength-meter">
                    <div
                      className="signup-strength-meter-fill"
                      style={{
                        width: `${Math.min(100, passwordStrength.score * 20)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="signup-strength-text">
                    {passwordStrength.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password with floating label */}
            <div className="signup-input-floating">
              <input
                type="password"
                id="confirmPassword"
                placeholder=" "
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`signup-form-input ${!passwordsMatch && confirmPassword ? "input-error" : ""}`}
                required
                aria-invalid={!passwordsMatch && !!confirmPassword}
              />
              <label htmlFor="confirmPassword">Re-Enter Password</label>
              {!passwordsMatch && confirmPassword && (
                <p className="signup-error-message">Passwords do not match</p>
              )}
            </div>

            <div className="signup-terms-checkbox">
              <input
                type="checkbox"
                id="termsCheckbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
              />
              <label htmlFor="termsCheckbox">
                By clicking this you accept to our{" "}
                <a href="/terms" className="signup-terms-link">
                  Terms & Conditions
                </a>
              </label>
            </div>

            <button
              type="button"
              className="signup-next-button"
              onClick={() => {
                setIsCreatingAccount(true);
                handleCreateAccount();
              }}
              disabled={isCreateButtonDisabled}
              style={{ opacity: isCreateButtonDisabled ? 0.6 : 1 }}
            >
              {isCreatingAccount ? "Creating Account..." : "Create My Account"}
            </button>
          </form>
        )}

        <div className="signup-terms-section">
          <a href="/terms">Terms & Conditions</a>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
