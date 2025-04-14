import React from 'react';
import './App.css';

interface VeraPexBannerProps {
  className?: string;
}

const VeraPexBanner: React.FC<VeraPexBannerProps> = ({ className = '' }) => {
  return (
    <div className={`verapex-banner ${className}`}>
      <p className="verapex-banner-text">
        To start using VeraPex, all users are required to complete KYC verification and fund their accounts with an initial deposit of 3,500 XAF.
      </p>
    </div>
  );
};

export default VeraPexBanner;