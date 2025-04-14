import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface MobileMoneyFormProps {
  onSubmit: (formData: {
    provider: 'MTN' | 'ORANGE';
    mobileNumber: string;
    amount: string;
  }) => void;
  initialProvider?: 'MTN' | 'ORANGE';
  initialMobileNumber?: string;
  initialAmount?: string;
}

const MobileMoneyForm: React.FC<MobileMoneyFormProps> = ({
  onSubmit,
  initialProvider = 'MTN',
  initialMobileNumber = '',
  initialAmount = '',
}) => {
  const [activeProvider, setActiveProvider] = useState<'MTN' | 'ORANGE'>(initialProvider);
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [withdrawalAmount, setWithdrawalAmount] = useState(initialAmount);

  const handleProviderChange = (provider: 'MTN' | 'ORANGE') => {
    if (provider === 'ORANGE') {
      // Show error toast for Orange
      toast.error('Orange payments are unavailable at the moment', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Default back to MTN
      setActiveProvider('MTN');
    } else {
      setActiveProvider(provider);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      provider: activeProvider,
      mobileNumber,
      amount: withdrawalAmount,
    });
  };

  return (
    <div className="mobile-money-form-section">
      <ToastContainer />
      <div className="form-container">
        <div className="provider-tabs">
          <button 
            type="button"
            onClick={() => handleProviderChange('MTN')}
            className={`provider-tab ${activeProvider === 'MTN' ? 'active' : ''}`}
          >
            <div className="provider-logo mtn-logo">
              <span className="logo-text">MTN MoMo</span>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => handleProviderChange('ORANGE')}
            className={`provider-tab ${activeProvider === 'ORANGE' ? 'active' : ''}`}
          >
            <div className="provider-logo orange-logo">
              <span className="logo-text">orange™</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="money-form">
          <div className="form-field">
            <input
              type="text"
              value={mobileNumber}
              required
              onChange={(e) => {
                // Limit to 9 digits and only numbers
                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                setMobileNumber(value);
              }}
              placeholder={`${activeProvider} Money Number`}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <input
              type="number"
              value={withdrawalAmount}
              required
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder="Enter Amount"
              className="form-input"
              min="0"
              step="0.01"
            />
            <div className="form-action">
              <button type="submit" className="process-button">
                Process
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileMoneyForm;