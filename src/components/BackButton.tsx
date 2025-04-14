import React from 'react';
import './css/BackButton.css';

interface BackButtonProps {
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
  location?: string; // Added location prop to specify custom navigation path
}

const BackButton: React.FC<BackButtonProps> = ({
  className = 'button',
  ariaLabel = 'Go back',
  onClick,
  location,
}) => {
  const handleBackClick = () => {
    if (onClick) {
      // Use custom onClick handler if provided
      onClick();
    } else if (location) {
      // Navigate to the specified location if provided
      window.location.href = location;
    } else {
      // Default behavior - go back in browser history
      window.history.back();
    }
  };

  return (
    <button
      className={className}
      onClick={handleBackClick}
      aria-label={ariaLabel}
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
        color=""
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default BackButton;