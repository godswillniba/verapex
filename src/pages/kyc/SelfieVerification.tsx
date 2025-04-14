import React, { useState, useRef, useEffect } from 'react';
import './SelfieVerification.css';

interface SelfieVerificationProps {
  onCapture: (image: string | null) => void;
  capturedImage: string | null;
  setStep: (step: number) => void;
}

const SelfieVerification: React.FC<SelfieVerificationProps> = ({ onCapture, capturedImage: propsCapturedImage, setStep }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [localCapturedImage, setLocalCapturedImage] = useState<string | null>(propsCapturedImage);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setError("");
    } catch (err) {
      setError("Camera access is required for verification. Please refresh the page and allow camera access to continue.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
    setLocalCapturedImage(imageDataUrl);
    onCapture(imageDataUrl);
    
    // Stop all tracks after capturing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const retake = () => {
    setLocalCapturedImage(null);
    onCapture(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="selfie-verification-container">
      <div className="progress-indicator">
        <div className="progress-dot completed" />
        <div className="progress-line" />
        <div className="progress-dot" />
        <div className="progress-line" />
        <div className="progress-dot" />
      </div>

      <div className="selfie-text">
        <h1>Selfie Verification</h1>
        <p className="align-face">Align your face in the middle</p>
        <p className="instruction">Make sure your face is inside the box and then capture</p>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="camera-container">
        {localCapturedImage ? (
          <img 
            src={localCapturedImage} 
            alt="Captured" 
            className="captured-image"
          />
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="camera-video"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="camera-overlay" />
          </>
        )}
      </div>

      {localCapturedImage ? (
        <button 
          onClick={retake}
          className="capture-button retake"
        >
          Retake
        </button>
      ) : (
        <button 
          onClick={captureImage}
          className="capture-button"
          disabled={!!error}
        >
          <div className="capture-button-inner" />
        </button>
      )}

      <div className="navigation-buttons">
        <button 
          onClick={() => {
            onCapture(localCapturedImage);
            setStep(2);
          }}
          className="nav-button next"
          disabled={!localCapturedImage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelfieVerification;