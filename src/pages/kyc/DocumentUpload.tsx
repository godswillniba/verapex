import React, { useState, useRef } from 'react';
import './DocumentUpload.css';

interface DocumentUploadProps {
  onUpload: (image: string | null) => void;
  uploadedImage: string | null;
  setStep: (step: number) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, uploadedImage, setStep }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(uploadedImage);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreviewUrl(result);
          onUpload(result);
        };
        reader.readAsDataURL(file);
        setError("");
      } else {
        setError("Please select an image file");
      }
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      // Handle file submission logic here
      console.log('File submitted:', selectedFile.name);
    }
  };

  return (
    <div className="document-upload-container">
      <div className="progress-indicator">
        <div className="progress-dot completed" />
        <div className="progress-line completed" />
        <div className="progress-dot completed" />
        <div className="progress-line" />
        <div className="progress-dot" />
      </div>

      <div className="document-text">
        <h1>Document Verification</h1>
        <p className="align-face">Upload your identity document</p>
        <p className="instruction">Make sure the document is clear and all details are visible</p>
        {error && <p className="error">{error}</p>}
        <div className="accepted-docs">
          <div className="doc-type">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="12" cy="10" r="2" />
              <path d="M8 14h8" />
            </svg>
            <div>ID Card/Driver's License</div>
          </div>
          <div className="doc-type">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="9" x2="17" y2="9" />
              <line x1="7" y1="13" x2="17" y2="13" />
              <line x1="7" y1="17" x2="12" y2="17" />
            </svg>
            <div>Passport</div>
          </div>
          <div className="doc-type">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="9" x2="17" y2="9" />
              <line x1="7" y1="13" x2="17" y2="13" />
              <line x1="7" y1="17" x2="12" y2="17" />
            </svg>
            <div>School ID</div>
          </div>
          <div className="doc-type">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="9" x2="17" y2="9" />
              <line x1="7" y1="13" x2="17" y2="13" />
              <line x1="7" y1="17" x2="12" y2="17" />
            </svg>
            <div>Birth Certificate</div>
          </div>
          <div className="doc-type">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="12" y2="16" />
            </svg>
            <div>Other official documents</div>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Document preview" className="document-preview" />
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="upload-placeholder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Click to upload document</p>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <button 
          onClick={() => setStep(1)} 
          className="nav-button back"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(3)}
          className="nav-button next"
          disabled={!selectedFile}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;