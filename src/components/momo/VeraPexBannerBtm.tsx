import React from 'react';
import './App.css';

interface VeraPexBannerProps {
  className?: string;
}

const VeraPexBannerBtm: React.FC<VeraPexBannerProps> = ({ className = '' }) => {
  return (
    <div className={`verapex-banner ${className}`}>
      <h5 className="verapex-banner-title">Why is this required ?</h5>
      <p className="verapex-banner-text">
        This measure helps ensure that all users on our platform are real and actively participating in trading. It also protects VeraPex from automated bots and fraudulent activity, maintaining a safe and reliable environment for everyone.
      </p>
      <br />

      <h5 className="verapex-banner-title">What happens to the initial deposit?</h5>
      <p className="verapex-banner-text">
        Once your KYC is verified and the deposit is made, the full amount of 3,500 XAF will be available in your VeraPex account balance. It's your money, ready for trading or withdrawal as you choose.
      </p>
      <br />
      <h5 className="verapex-banner-title">How long does KYC verification take?</h5>
      <p className="verapex-banner-text">
        KYC verification typically takes between 5 to 15 minutes during business hours. In some cases, it may take up to 24 hours depending on the volume of requests and the accuracy of the submitted information.
      </p>
      <br />

      <h5 className="verapex-banner-title">Is my information secure?</h5>
      <p className="verapex-banner-text">
        Absolutely. VeraPex uses advanced encryption protocols and follows strict data protection policies to ensure that your personal information remains private and secure at all times.
      </p>
      <br />

      <h5 className="verapex-banner-title">Can I trade without completing KYC?</h5>
      <p className="verapex-banner-text">
        No. KYC verification is mandatory for all users before trading can begin. This is part of our compliance with financial regulations and our commitment to creating a transparent and trustworthy trading environment.
      </p>
      <br />
      
    </div>
  );
};

export default VeraPexBannerBtm;