import React, { useState, ChangeEvent } from 'react';
import './OrangeMoneyPayment.css';

interface OrangeMoneyPaymentProps {
  accountNumber: string;
  accountName: string;
  amount: number;
  onSubmit: (receipt: File | null) => void;
}

const OrangeMoneyPayment: React.FC<OrangeMoneyPaymentProps> = ({
  accountNumber,
  accountName,
  amount,
  onSubmit
}) => {
  const [receipt, setReceipt] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(receipt);
  };

  return (
    <div className="orange-money-container">
      <h2 className="orange-money-title">Orange Money Payment</h2>

      <div className="payment-details">
        <div className="detail-row">
          <div className="detail-label">Account</div>
          <div className="detail-value">{accountNumber}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Name</div>
          <div className="detail-value">{accountName}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Amount</div>
          <div className="detail-value">{amount}</div>
        </div>
      </div>

      <p className="payment-instructions">
        Send a payment of {amount} XAF to the Orange Money number 
        provided above and upload a screenshot of the payment 
        receipt in the upload box below and hit submit
      </p>

      <form onSubmit={handleSubmit}>
        <div className="upload-container">
          <label htmlFor="receipt-upload" className="upload-area">
            <div className="upload-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
                <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
              </svg>
            </div>
            <span className="upload-text">Upload Payment Screenshot</span>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!receipt}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default OrangeMoneyPayment;