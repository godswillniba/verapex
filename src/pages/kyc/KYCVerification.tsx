import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KYCVerification.css';
import SelfieVerification from './SelfieVerification';
import DocumentUpload from './DocumentUpload';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateKYCStatus, getUserProfileData, listenToUserData } from '../../../firebase/firestore';
import { getCurrentUser } from '../../../firebase/auth';

const KYCVerification: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    submission_id?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if the user has already been verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Get the user's profile data
          const userData = await getUserProfileData(currentUser.uid);

          // If already verified, redirect to finance page
          if (userData?.isProfileVerified) {
            toast.info("Your profile is already verified");
            navigate('/finance');
            return;
          }
        } else {
          // Not authenticated, redirect to login
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        toast.error("Could not check verification status");
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [navigate]);

  // Add real-time listener for KYC status changes
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const setupKYCStatusListener = async () => {
      const currentUser = await getCurrentUser();

      // Store the initial state for comparison
      let initialKYCStatus: boolean | undefined;

      if (currentUser) {
        // Get initial user data to compare against
        const initialUserData = await getUserProfileData(currentUser.uid);
        initialKYCStatus = initialUserData?.isProfileVerified;

        // Set up listener that only reacts to changes after initial state is known
        unsubscribe = listenToUserData(currentUser, (userData) => {
          // Only navigate if the status has actually changed from the initial state
          // AND only if it transitions from true to false (rejection case)
          if (userData && 
              initialKYCStatus !== undefined && 
              initialKYCStatus === true && 
              userData.isProfileVerified === false) {
            toast.warning("Your profile verification has been rejected");
            navigate('/finance');
          }
        });
      }
    };

    setupKYCStatusListener();

    // Clean up listener on component unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 3) {
        setDocumentImage(null);
      }
      if (step === 2) {
        setSelfieImage(null);
      }
      setStep(step - 1);
    }
  };

  // Redirect to finance page after successful verification
  useEffect(() => {
    if (submitResult?.success) {
      // Set a timer to redirect after showing success message
      const timer = setTimeout(() => {
        navigate('/finance');
      }, 3000); // Redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [submitResult, navigate]);

  // Function to convert a base64 data URL to a Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("Error converting dataURL to Blob:", e);
      throw new Error("Failed to process image data");
    }
  };

  const handleSubmit = async () => {
    if (!selfieImage || !documentImage) {
      toast.error('Both selfie and document images are required');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    // Show processing toast
    const processingToastId = toast.loading("Processing your submission...");

    try {
      // Get the current authenticated user first
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Create a FormData object to send the files
      const formData = new FormData();

      // Convert base64 images to Blobs and append to FormData
      if (selfieImage) {
        const selfieBlob = dataURLtoBlob(selfieImage);
        formData.append('', selfieBlob, 'selfie.jpg'); // Empty field name
      }

      if (documentImage) {
        const documentBlob = dataURLtoBlob(documentImage);
        formData.append('', documentBlob, 'document.jpg'); // Empty field name
      }

      // Add metadata including the user's UID
      const metadata = {
        timestamp: new Date().toISOString(),
        userId: currentUser.uid  // Include the user's UID in the metadata
      };
      formData.append('metadata', JSON.stringify(metadata));

      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Send the request to your backend
      const response = await fetch('https://4073df24-1d26-4d94-b5e2-e55fc4e8913a-00-kvz6c9aypyb1.picard.replit.dev/api/submit-kyc', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      // Parse the response
      const result = await response.json();

      if (result.success) {
        // Update Firestore with the verification status - we already have currentUser here
        await updateKYCStatus(currentUser.uid, true);

        setSubmitResult({
          success: true,
          message: "KYC verification completed successfully! Redirecting to finance app...",
          submission_id: result.submission_id
        });

        // Update the loading toast to success
        toast.update(processingToastId, { 
          render: "KYC verification successful! Redirecting...", 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
      } else {
        throw new Error(result.message || 'Failed to submit KYC data');
      }
    } catch (error) {
      console.error('Error submitting KYC data:', error);

      let errorMessage = 'An unknown error occurred';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setSubmitResult({
        success: false,
        message: errorMessage
      });

      // Update the loading toast to error
      toast.update(processingToastId, { 
        render: errorMessage, 
        type: "error", 
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="kyc-container"><div>Checking verification status...</div></div>;
  }

  return (
    <div className="kyc-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {step === 1 && (
        <SelfieVerification 
          onCapture={setSelfieImage} 
          capturedImage={selfieImage}
          setStep={setStep}
        />
      )}

      {step === 2 && (
        <DocumentUpload
          onUpload={setDocumentImage}
          uploadedImage={documentImage}
          setStep={setStep}
        />
      )}

      {step === 3 && (
        <div className="review-container">
          <div className="progress-indicator">
            <div className="progress-dot completed" />
            <div className="progress-line completed" />
            <div className="progress-dot completed" />
            <div className="progress-line completed" />
            <div className="progress-dot completed" />
          </div>

          <div className="review-content">
            <h1>Review & Submit</h1>
            <div className="preview-images">
              <div className="preview-item">
                <h3>Selfie</h3>
                {selfieImage && <img src={selfieImage} alt="Selfie" />}
              </div>
              <div className="preview-item">
                <h3>Document</h3>
                {documentImage && <img src={documentImage} alt="Document" />}
              </div>
            </div>

            {submitResult && (
              <div className={`submit-result ${submitResult.success ? 'success' : 'error'}`}>
                <p>{submitResult.message}</p>
                {submitResult.submission_id && (
                  <p>Submission ID: {submitResult.submission_id}</p>
                )}
                {submitResult.success && (
                  <p className="redirect-message">Redirecting to finance app...</p>
                )}
              </div>
            )}

            <div className="navigation-buttons">
              <button onClick={handleBack} className="nav-button back" disabled={isSubmitting}>
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                className="nav-button submit"
                disabled={!selfieImage || !documentImage || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerification;