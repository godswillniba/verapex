
import React, { useState, useEffect } from 'react';
import { DocumentData } from 'firebase/firestore';
import { THEME } from './config';
import { toast } from 'react-toastify';
import { authStateListener } from "../../firebase/auth";
import { listenToUserData } from "../../firebase/firestore";
import { formatAmount } from '../utils/formatters';


// Define interfaces for type safety
import { Refer, ReferralItem } from '../types';

const ReferralsTab: React.FC = () => {
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

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;

    triggerVibration();
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: "dark",
        });
      })
      .catch((err) => {
        toast.error("Failed to copy!", {
          position: "top-right",
          autoClose: 2000,
        });
        console.error("Copy failed", err);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Please sign in to view referrals</div>;
  }

  const referrals = userData.referrals || {};
  const earnings = userData.earnings || {};
  const recentRefers = referrals.recentRefers || [];

  return (
    <div className="tab-content">
      <div className="grid-container">
        <div className="left-side">
          <div className="text-box">
            <h2>
              Earn <span style={{ color: THEME.secondary }}>Money</span> <br /> By Refer
            </h2>
          </div>

          <div className="earnings-box">
            <p className="earnings-title">Referral Earnings</p>
            <h1 className="earnings-amount">{formatAmount(earnings.referrals ?? 0)} {userData.currency}</h1>
            <p className="referral-count">
              <strong>{referrals.count ?? 0} Referrals</strong>
            </p>
          </div>
        </div>

        <div className="image-box">
          <img 
            src="/IMG_8050.png"
            alt="Refer friends" 
            className="refer-people-image"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      <div className="referral-code-section">
        <p className="card-title">Referral Link</p>
        <div className="referral-link-container">
          <p className="referral-link">
            {referrals.link ?? 'No referral link available'}
          </p>
          <button 
            className="copy-button"
            onClick={() => copyToClipboard(referrals.link)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <div className="referral-code-container">
          <p className="card-title">Referral Code</p>
          <div className="code-copy-container">
            <p className="referral-code">
              {referrals.code ?? 'No referral code available'}
            </p>
            <button 
              className="copy-button"
              onClick={() => copyToClipboard(referrals.code)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button 
              className="share-button"
              onClick={() => {
                triggerVibration();
                if (navigator.share && referrals.link && referrals.code) {
                  navigator.share({
                    title: "Join and Earn Rewards!",
                    text: `Use my referral code: ${referrals.code}`,
                    url: referrals.link,
                  })
                  .catch((error) => console.error("Error sharing:", error));
                } else {
                  console.error("Web Share API is not supported or missing data.");
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="recent-refers-section">
        <p className="card-title">Recent Refers</p>
        <div className="recent-refers-container">
          {recentRefers.length > 0 ? (
            recentRefers.map((refer: Refer) => (
              <div key={refer.id} className="refer-item">
                <div className="refer-name">{refer.name}</div>
                <div className="refer-date">{refer.date}</div>
                <div className="refer-amount">{refer.amount}</div>
              </div>
            ))
          ) : (
            <div className="empty-refers">
              <p>No recent referrals yet</p>
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

export default ReferralsTab;
