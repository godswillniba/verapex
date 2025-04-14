
import React, { useState, useEffect } from 'react';
import { DocumentData } from "firebase/firestore";
import { authStateListener } from "../../firebase/auth";
import { listenToUserData } from "../../firebase/firestore";
import { InvestmentTabProps } from '../types';
import { formatAmount } from '../utils/formatters';


const InvestmentTab: React.FC<InvestmentTabProps> = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <div>Please sign in to view investment plans</div>;
  }

  return (
    <div className="tab-content">
      <div className="investment-header">
        <h2>Investment Plans</h2>
      </div>

      <div className="investment-summary">
        <div className="summary-card">
          <h3>Total Investment</h3>
          <p className="amount">{formatAmount(userData.investments?.totalInvested || 0)} {userData.currency}</p>
        </div>
        <div className="summary-card">
          <h3>Expected Returns</h3>
          <p className="amount">{formatAmount(userData.investments?.expectedReturns || 0)} {userData.currency}</p>
        </div>
      </div>

      <div className="investment-header">
        <p>Choose an investment plan that suits your goals</p>
      </div>

      <div className="investment-plans">
        {userData.investments?.availableInvestmentPlans?.map((plan: any) => (
          <div 
            key={plan.id}
            className={`investment-card ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h3>{plan.name}</h3>
            <div className="plan-details">
              <p>Minimum Amount: <span>{formatAmount(plan.minAmount)} {userData.currency}</span></p>
              <p>Duration: <span>{plan.duration}</span></p>
              <p>ROI: <span>{plan.roi * (100)}%</span></p>
            </div>
            <button className="invest-button">
              Invest Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentTab;
