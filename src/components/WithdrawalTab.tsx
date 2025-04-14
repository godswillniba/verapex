import React, { useState, useEffect } from 'react';
import { DocumentData } from 'firebase/firestore';
import { authStateListener } from "../../firebase/auth";
import { listenToUserData } from "../../firebase/firestore";
import { formatAmount } from '../utils/formatters';
import { WithdrawalTabProps } from '../types/finance.types';

// Define a default theme object to prevent undefined errors
const THEME = {
  secondary: '#007bff', // Example secondary color
};



const WithdrawalTab: React.FC<WithdrawalTabProps> = ({ data }) => {
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add state for mobile money provider and form inputs
  const [activeProvider, setActiveProvider] = useState<'MTN' | 'ORANGE'>('MTN');
  const [mobileNumber, setMobileNumber] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  // Add handler for withdrawal submission
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your withdrawal logic here
    console.log('Withdrawal submitted', {
      provider: activeProvider,
      mobileNumber,
      amount: withdrawalAmount
    });
    // You might want to call a Firebase function or API here
  };

  useEffect(() => {
    let unsubscribeUserData: () => void = () => {};

    const unsubscribeAuth = authStateListener((user) => {
      if (user) {
        unsubscribeUserData = listenToUserData(user, (data) => {
          setUserData(data);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserData();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Please sign in to view withdrawals</div>;
  }

  return (
    <div className="tab-content">
      <div className="grid-container">
        <div className="left-side">
          <div className="text-box">
            <h2>
              Money <span style={{ color: THEME.secondary }}>Withdrawal</span> <br /> Made EASY
            </h2>
          </div>

          <div className="earnings-box">
            <p className="earnings-title">Withdraw-able Balance</p>
            <h1 className="earnings-amount">
              {formatAmount(userData.balance?.withdrawable || 0)} {userData.currency}
            </h1>
          </div>
        </div>

        <div className="image-box">
          <img 
            src="/IMG_8053.webp"
            alt="Withdraw money" 
            className="refer-people-image"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      <div className="mobile-money-form-section">
        <div className="form-container">
          <div className="provider-tabs">
            <button 
              onClick={() => setActiveProvider('MTN')}
              className={`provider-tab ${activeProvider === 'MTN' ? 'active' : ''}`}
            >
              <div className="provider-logo mtn-logo">
                <span className="logo-text">MTN MoMo</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveProvider('ORANGE')}
              className={`provider-tab ${activeProvider === 'ORANGE' ? 'active' : ''}`}
            >
              <div className="provider-logo orange-logo">
                <span className="logo-text">orange™</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleWithdrawalSubmit} className="money-form">
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

      <div className="recent-refers-section">
        <p className="card-title">Recent Transactions</p>
        <div className="recent-refers-container">
          {userData.transactions && userData.transactions.length > 0 ? (
            userData.transactions.slice(0, 5).map((transaction: any) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-date">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
                <div className="transaction-amount">
                  {formatAmount(transaction.amount)}
                </div>
                <div className={`transaction-status ${transaction.status}`}>
                  {transaction.status}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-refers">
              <p>No recent transactions</p>
            </div>
          )}
        </div>
        <div className="expand-button-container">
          <button className="expand-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalTab;