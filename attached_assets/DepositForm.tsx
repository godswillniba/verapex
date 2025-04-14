import React, { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { THEME } from "./config";
import "./css/DepositForm.css";
import "react-toastify/dist/ReactToastify.css";
import { getAuth } from "firebase/auth";

type PaymentProvider = "MTN" | "ORANGE";
type PaymentStatus = "pending" | "processing" | "completed" | "failed";

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  message: string;
}

const DepositForm: React.FC = () => {
  const depositAmount = "3500"; // Fixed amount
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>("MTN");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orange Money account details
  const orangeAccountName = "John Doe"; // Replace with your actual name
  const orangeAccountNumber = "612345678"; // Replace with your actual number

  // Effect to get and store the firebase user ID on component mount
  useEffect(() => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setUid(user.uid);
        console.log("User authenticated successfully with UID:", user.uid);
      } else {
        // Handle case where user is not authenticated
        console.error("Error: User is not authenticated");
        toast.error("Authentication required. Please login again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        // You might want to redirect to login page here
      }
    } catch (error) {
      console.error("Error in authentication process:", error);
      toast.error("Authentication error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  }, []);

  // Payment status effect removed

  // Function to check payment status
  const checkPaymentStatus = async (paymentTxnId: string) => {
    try {
      // Set initial status
      setStatusMessage("Checking payment status...");
      setPaymentStatus("pending");

      // URL for checking payment status
      const statusUrl = `https://083831d6-f84b-40da-9276-de0da801eb12-00-3lo96s21r787o.picard.replit.dev/check_payment_status?transactionId=${paymentTxnId}&uid=${uid}`;

      console.log("Checking payment status at:", statusUrl);

      // Function to poll payment status
      const pollStatus = async () => {
        if (!isLoading) return; // Stop polling if loading state is false

        try {
          const response = await fetch(statusUrl);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result: PaymentResponse = await response.json();
          console.log("Payment status response:", result);

          setPaymentStatus(result.status);
          setStatusMessage(result.message);

          // If payment is still in progress, poll again after delay
          if (result.status === "pending" || result.status === "processing") {
            setTimeout(pollStatus, 3000); // Poll every 3 seconds
          } else {
            // Terminal state reached
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
          setPaymentStatus("failed");
          setStatusMessage("Failed to check payment status. Please contact support.");
          setIsLoading(false);
        }
      };

      // Start polling
      pollStatus();

    } catch (error) {
      console.error("Failed to initiate payment status checking:", error);
      toast.error("Could not connect to payment status service", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      // Verify user is authenticated
      if (!uid) {
        console.error("Validation error: No UID found, user not authenticated");
        toast.error("Authentication required. Please login again.", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });
        return false;
      }

      if (!mobileNumber || mobileNumber.trim() === "") {
        console.error("Validation error: Empty or invalid mobile number");
        toast.error("Please enter a valid mobile number", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });
        return false;
      }

      if (depositAmount !== "3500") {
        console.error(`Validation error: Incorrect deposit amount (${depositAmount}), should be 3500 EUR`);
        toast.error("Please deposit exactly 3500 EUR", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });
        return false;
      }

      // Only require receipt for Orange Money
      if (activeProvider === "ORANGE" && !receipt) {
        console.error("Validation error: Missing receipt for Orange Money payment");
        toast.error("Please upload your payment receipt", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });
        return false;
      }

      console.log("Form validation passed successfully");
      return true;
    } catch (error) {
      console.error("Unexpected error during form validation:", error);
      toast.error("An error occurred while validating your information", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
      return false;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submission initiated");

    if (!validateForm()) {
      console.error("Form submission stopped: validation failed");
      toast.error("Please check your input and try again", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setIsLoading(true);
    setPaymentStatus("pending");
    setStatusMessage(`Initiating ${activeProvider} payment for ${depositAmount} EUR...`);
    console.log(`Processing ${activeProvider} payment for amount: ${depositAmount} EUR`);
    
    const toastId = toast.loading(
      <div>
        <p>Processing your payment...</p>
        <div className={`payment-status ${getStatusClasses()}`}>
          <p>{statusMessage}</p>
          {transactionId && <small>Transaction ID: {transactionId}</small>}
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        theme: "dark"
      }
    );

    try {
      if (activeProvider === "MTN") {
        const paymentData = {
          phoneNumber: mobileNumber,
          amount: depositAmount,
          currency: "EUR",
          paymentProvider: activeProvider,
          uid: uid,
        };

        console.log("Sending MTN payment data to backend:", paymentData);

        try {
          const response = await fetch("https://083831d6-f84b-40da-9276-de0da801eb12-00-3lo96s21r787o.picard.replit.dev/process_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
          });

          const result = await response.json();
          
          // Dismiss any existing loading toasts
          toast.dismiss();

          if (!response.ok) {
            throw new Error(result.message || 'Payment processing failed');
          }

          toast.success(result.message || "Payment request submitted successfully!", {
            position: "top-right",
            autoClose: 500000,
            theme: "dark",
            draggable: false,
            closeOnClick: false,
              closeButton: false,
          });

          setIsLoading(false);
          setMobileNumber("");
          console.log("MTN payment request submitted");
        } catch (error) {
          console.error("Error sending payment data:", error);
          toast.error(error instanceof Error ? error.message : "Failed to process payment", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark"
          });
          setIsLoading(false);
        }
      } else if (activeProvider === "ORANGE") {
        const formData = new FormData();
        if (receipt) {
          formData.append("receipt", receipt);
          console.log("Attaching receipt file:", receipt.name, "Size:", receipt.size, "bytes");
        } else {
          console.error("Missing receipt file for Orange Money payment");
        }

        formData.append("amount", depositAmount);
        formData.append("currency", "EUR");
        formData.append("uid", uid || "");
        formData.append("paymentProvider", activeProvider);

        console.log("Sending Orange Money payment data to backend");

        try {
          const uploadResponse = await fetch("https://083831d6-f84b-40da-9276-de0da801eb12-00-3lo96s21r787o.picard.replit.dev/upload_receipt", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`HTTP error during receipt upload. Status: ${uploadResponse.status}, Response: ${errorText}`);
            throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
          }

          const uploadResult: PaymentResponse = await uploadResponse.json();
          console.log("Orange Money upload response:", uploadResult);

          if (!uploadResult.success) {
            console.error("Receipt upload failed:", uploadResult.message || "Unknown error");
            throw new Error(uploadResult.message || "Failed to upload receipt");
          }

          console.log("Orange Money receipt uploaded successfully");

          // Store transaction ID and start checking status
          if (uploadResult.transactionId) {
            setTransactionId(uploadResult.transactionId);
            checkPaymentStatus(uploadResult.transactionId);
          } else {
            console.error("No transaction ID returned from receipt upload");
            throw new Error("Receipt uploaded but no transaction ID was provided");
          }

          toast.info("Receipt uploaded successfully. Verifying payment...", {
            position: "top-right",
            autoClose: 5000,
            theme: "dark",
          });
        } catch (error) {
          console.error("Error uploading receipt:", error);
          toast.error(error instanceof Error ? error.message : "Failed to upload receipt", {
            position: "top-right",
            autoClose: 5000,
            theme: "dark",
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error submitting payment:", error);

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setPaymentStatus("failed");
      setStatusMessage(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
      });
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        setReceipt(selectedFile);
        console.log("Receipt file selected:", selectedFile.name, "Size:", selectedFile.size, "bytes", "Type:", selectedFile.type);
      } else {
        console.log("No file selected or file selection canceled");
      }
    } catch (error) {
      console.error("Error handling file selection:", error);
      toast.error("Failed to process selected file. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
    }
  };

  const triggerFileInput = () => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.click();
        console.log("File input triggered");
      } else {
        console.error("File input reference is null");
      }
    } catch (error) {
      console.error("Error triggering file input:", error);
    }
  };

  // Helper function to get payment status style classes
  const getStatusClasses = () => {
    if (!paymentStatus) return "";

    switch (paymentStatus) {
      case "pending": return "status-pending";
      case "processing": return "status-processing";
      case "completed": return "status-completed";
      case "failed": return "status-failed";
      default: return "";
    }
  };

  return (
    <div className="deposit-container">
      {/* Loading state handled in form submission */}

      <div className="deposit-header">
        <div className="header-content">
          <h2 className="header-title">
            Money <span className="accent-text">Deposit</span> <br /> Made Easy
          </h2>
          <p className="header-info">
            To activate your account, please make your first deposit of exactly 3500 EUR. Once deposited, this amount will be fully credited to your account, allowing you to start investing.
          </p>
        </div>
        <div className="header-image">
          <img
            src="https://ondepay-ng3t.vercel.app/assets/cardinfo-CqhEpF0j.png"
            alt="Deposit money"
            loading="eager"
            decoding="async"
            onError={(e) => console.error("Error loading deposit image:", e)}
          />
        </div>
      </div>

      {transactionId && paymentStatus && paymentStatus !== "completed" && paymentStatus !== "failed" && (
        <div className={`transaction-status-bar ${getStatusClasses()}`}>
          <div className="status-icon">
            {paymentStatus === "processing" ? (
              <div className="small-spinner"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <div className="status-info">
            <p className="status-message">{statusMessage}</p>
            <p className="status-id">Transaction ID: {transactionId}</p>
          </div>
        </div>
      )}

      <div className="deposit-form-wrapper">
        <div className="provider-selection">
          <button
            onClick={() => setActiveProvider("MTN")}
            className={`provider-tab ${activeProvider === "MTN" ? "active" : ""}`}
            type="button"
            disabled={isLoading}
          >
            <div className="provider-logo mtn">
              <span className="logo-text">MTN MoMo</span>
            </div>
          </button>

          <button
            onClick={() => setActiveProvider("ORANGE")}
            className={`provider-tab ${activeProvider === "ORANGE" ? "active" : ""}`}
            type="button"
            disabled={isLoading}
          >
            <div className="provider-logo orange">
              <span className="logo-text">orange™</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="deposit-form">
          {activeProvider === "MTN" ? (
            <>
              <div className="form-field">
                <input
                  type="text"
                  value={mobileNumber}
                  required
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    console.log("Mobile number updated:", e.target.value);
                  }}
                  placeholder="MTN Money Number (with country code if international)"
                  className="form-input"
                  disabled={isLoading}
                  // Removed maxLength to allow international numbers
                />
              </div>

              <div className="form-field">
                <input
                  type="number"
                  value={depositAmount}
                  required
                  disabled // Change readOnly to disabled
                  placeholder="Enter Amount"
                  className="form-input"
                />
              </div>
            </>
          ) : (
            <>
              <div className="orange-payment-info">
                <h3>Orange Money Payment Instructions</h3>
                <p>Please send <strong>3500 EUR</strong> to the following Orange Money account:</p>
                <div className="account-details">
                  <p><strong>Account Name:</strong> {orangeAccountName}</p>
                  <p><strong>Account Number:</strong> {orangeAccountNumber}</p>
                </div>
                <p>After sending the payment, please upload a screenshot of your receipt below.</p>
              </div>

              <div className="form-field upload-container">
                <input
                  ref={fileInputRef}
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden-input"
                  disabled={isLoading}
                />

                <div 
                  className={`upload-area ${receipt ? 'has-file' : ''} ${isLoading ? 'disabled' : ''}`}
                  onClick={isLoading ? undefined : triggerFileInput}
                >
                  {receipt ? (
                    <div className="file-preview-container">
                      <div className="preview-info">
                        <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        <div className="file-details">
                          <span className="file-name">{receipt.name}</span>
                          <span className="file-size">
                            {(receipt.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="change-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoading) {
                            console.log("Change file button clicked");
                            triggerFileInput();
                          }
                        }}
                        disabled={isLoading}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span className="upload-text">Upload Payment Receipt</span>
                      <span className="upload-hint">Click to browse or drag image here</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="form-action">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !uid}
            >
              {isLoading ? (
                <span className="button-loading">
                  <span className="spinner-small"></span>
                  Processing...
                </span>
              ) : (
                activeProvider === "MTN" ? "Process Payment" : "Submit Receipt"
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DepositForm;