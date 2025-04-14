      import './App.css';
      import React, { useState, useEffect } from "react";
      import { toast, ToastContainer } from "react-toastify";
      import { getAuth } from "firebase/auth";
      import { useNavigate } from "react-router-dom"; // Correct import with curly braces

      // Define the PaymentResponse type
      interface PaymentResponse {
        status: "pending" | "processing" | "completed" | "failed";
        message: string;
        transactionId?: string;
      }

      interface MoMoPaymentFormProps {
        onSubmit?: (phoneNumber: string, amount: number) => void;
      }

      const MoMoPaymentForm: React.FC<MoMoPaymentFormProps> = ({ onSubmit }) => {
        // State variables
        const [mobileNumber, setMobileNumber] = useState('');
        const [depositAmount, setDepositAmount] = useState('3500');
        const [uid, setUid] = useState<string | null>(null);
        const [isLoading, setIsLoading] = useState(false);
        const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
        const [statusMessage, setStatusMessage] = useState<string | null>(null);

        // Get the navigate function from the hook
        const navigate = useNavigate();

        // Effect to get and store the firebase user ID on component mount
useEffect(() => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    setUid(user.uid);
    console.log("User authenticated successfully with UID:", user.uid);
  } else {
    console.error("Error: User is not authenticated");
    toast.error("Authentication required. Please login again.", {
      position: "top-right",
      autoClose: 3000,
      theme: "dark",
    });
    navigate('/login');
  }
}, [navigate]);

     

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await processPayment();
    }

    // Also call the onSubmit prop if provided
    if (onSubmit && mobileNumber && depositAmount) {
      onSubmit(mobileNumber, parseFloat(depositAmount));
    }
  };

  // Function to check payment status
  const checkPaymentStatus = async (paymentTxnId: string) => {
    try {
      // Set initial status
      setStatusMessage("Checking payment status...");
      setPaymentStatus("pending");
      setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  // Function to validate form input
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

      return true;
    } catch (error) {
      console.error("Error during form validation:", error);
      toast.error("Form validation error occurred", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
      return false;
    }
  };

  // Function to process payment
  const processPayment = async () => {
    try {
      setIsLoading(true);

      const paymentData = {
        phoneNumber: mobileNumber,
        amount: depositAmount,
        currency: "EUR",
        paymentProvider: "MTN",
        uid: uid,
      };

      console.log("Sending MTN payment data to backend:", paymentData);

      const response = await fetch(
        "https://083831d6-f84b-40da-9276-de0da801eb12-00-3lo96s21r787o.picard.replit.dev/process_payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();

      // Dismiss any existing loading toasts
      toast.dismiss();

      if (!response.ok) {
        throw new Error(result.message || "Payment processing failed");
      }

      toast.success(result.message || "Payment request submitted successfully!", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        draggable: false,
        closeOnClick: false,
        closeButton: false,
      });

      // If there's a transaction ID, start checking status
      if (result.transactionId) {
        checkPaymentStatus(result.transactionId);
      } else {
        setIsLoading(false);
      }

      setMobileNumber("");
      console.log("MTN payment request submitted");

    } catch (error) {
      console.error("Error sending payment data:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process payment",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        }
      );
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="momo-container">
        {isLoading && paymentStatus && (
          <div className="status-container">
            <p className={`status-message status-${paymentStatus}`}>
              {statusMessage || "Processing payment..."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="momo-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="payment-row">
            <div className="amount-container">
              <input
                type="number"
                value={depositAmount}
                // Keep onChange for technical consistency but amount is fixed
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter Amount"
                className="amount-input"
                min="1"
                required
                disabled
              />
            </div>

            <button 
              type="submit" 
              className="pay-button"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Pay"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MoMoPaymentForm;