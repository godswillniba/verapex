import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleArrows, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { HomeTabProps } from '../types';
import SkeletonLoader from './SkeletonLoader';
import { authStateListener } from "../../firebase/auth";
import { listenToUserData } from "../../firebase/firestore";
import { DocumentData } from "firebase/firestore";
import CryptoTracker from './CryptoTracker';
import StockTracker from './StockTracker';
import MarketButton from './MarketButton';




const HomeTab: React.FC<HomeTabProps> = ({ data, showBalance, setShowBalance }) => {
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const navigate = useNavigate()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection. Please check your network.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{`Date: ${label}`}</p>
          <p>{`Value: ${Number(payload[0].value).toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const formatAmount = (amount: number | string) => {
    if (!showBalance) return '(•_•)•(•_•)';
    const formattedNumber = Number(amount).toFixed(2);
    return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!isOnline) {
    return <div>No internet connection. Please check your network connection.</div>;
  }

  if (!userData && isOnline) {
    return <div>Please sign in to access your finance dashboard</div>;
  }

  return (
    <div className="home-tab">
      <div className="user-name">
        {userData?.name}
        <p style={{ fontSize: '10px', color:'grey'}}>{userData?.uid}</p>
      </div>

      <div className="balance-section">
        <div className="section-title">Total Balance</div>
        <div className="total-balance-card">
          <div className="balance-amount">
            {formatAmount(userData?.balance?.total ?? 0)}&nbsp;{userData?.currency}
            <button onClick={toggleBalance} className="balance-toggle">
              {showBalance ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="locked-balance">
          <span>Locked Funds: {formatAmount(userData?.balance?.lockedAmounts ?? 0)} {userData?.currency}</span>
          <div className="tooltip-container">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="help-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div className="tooltip-text">
              Locked amount represents funds that are currently unavailable for withdrawal due to pending transactions or investment lock periods.
            </div>
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="green-card">
          <div className="card-title">Referrals</div>
          <div className="card-amount">{formatAmount(userData?.earnings?.referrals ?? 0)}</div>
          <div className="referral-count">

            <button className="fa-pple-btn">
            <span>{showBalance ? userData?.referrals?.count ?? 0 : '(•_•)'}</span>&nbsp;

              <FontAwesomeIcon icon={faPeopleArrows} />
            </button>
          </div>
        </div>

        <div className="green-card">
          <div className="card-title">Task Earnings</div>
          <div className="card-amount">{formatAmount(userData?.earnings?.tasks ?? 0)}</div>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="green-card">
          <div className="card-title">Available Balance</div>
          <div className="card-amount">{formatAmount(userData?.balance?.withdrawable ?? 0)}</div>
        </div>

        <div className="dark-card transaction-card">
          <button className="transaction-btn">
            <FontAwesomeIcon 
              icon={faMoneyBillTransfer} 
              className="transaction-icon" 
            /><div className="transaction-text">Transac..</div>
          </button>

        </div>
      </div>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center' 
        }}> 
        <MarketButton 
          variant="primary" 
          size="md" 
          label="Our Shop" 
          onClick={() => {
            // Delay navigation by 500 milliseconds (0.5 seconds)
            setTimeout(() => {
              navigate('/market');
            }, 500);
          }}
        />
      </div>


      <div className="graph-card">
        <div className="graph-container">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.graphData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#A0A0A0', fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                height={60} 
              />
              <YAxis tick={{ fill: '#A0A0A0', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#90BE56" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#90BE56' }} 
                activeDot={{ r: 5 }} 
                isAnimationActive={true}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="market-trackers">
        <CryptoTracker />
        <StockTracker />


      </div>
    </div>
  );
};

export default HomeTab;