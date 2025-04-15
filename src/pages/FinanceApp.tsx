import React, { useState, useEffect, useRef } from 'react';
import { Bell, Home, FileText, Users, DollarSign, TrendingUp, LogOut, X } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../components/css/App.css';

import HomeTab from '../components/HomeTab';
import TasksTab from '../components/TasksTab';
import ReferralsTab from '../components/ReferralsTab';
import WithdrawalTab from '../components/WithdrawalTab';
import InvestmentTab from '../components/InvestmentTab';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logOut, authStateListener } from '../../firebase/auth';
import { listenToUserData } from '../../firebase/firestore';
import { faGear, faArrowUpFromBracket, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { QRCodeSVG } from 'qrcode.react';
import NotificationButton from '../components/NotificationButton'
import { isPWA, handleNotificationClick } from '../components/notification';

import { faBell } from '@fortawesome/free-solid-svg-icons';

// Define TabName type
type TabName = 'home' | 'tasks' | 'referrals' | 'withdrawal' | 'investment';

const FinanceApp: React.FC = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toggleQRCode = () => setShowQRCode((prev) => !prev);
  const [userData, setUserData] = useState<any>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isUserNotificationModalOpen, setIsUserNotificationModalOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const [isDepositSheetOpen, setIsDepositSheetOpen] = useState(false);

  const maskData = (data: string, type: 'email' | 'phone' | 'uid') => {
    if (!showQRCode || !data) return data;

    if (type === 'email') {
      const [user, domain] = data.split('@');
      const maskedUser = user.slice(0, 2) + '*'.repeat(user.length - 2);
      return `${maskedUser}@${domain}`;
    }

    if (type === 'phone') {
      return data.slice(0, 5) + '*'.repeat(data.length - 7) + data.slice(-2);
    }

    return data;
  };


  useEffect(() => {
    let unsubscribeUserData: () => void = () => {};

    const unsubscribeAuth = authStateListener((user) => {
      if (user) {
        unsubscribeUserData = listenToUserData(user, (data) => {
          setUserData(data);

          const imagesToPreload = [
            '/refer-people-image.png',
            '/withdrawal-image.png',
            data?.photoURL || data?.profileImage || '/userImage/profile-pic.webp'
          ];

          Promise.all(
            imagesToPreload.map((src) => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = reject;
              });
            })
          )
          .then(() => setImagesLoaded(true))
          .catch(console.error);
        });
      } else {
        setUserData(null);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserData();
    };
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logOut();
    }, 1000);
  };

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab data={userData} showBalance={showBalance} setShowBalance={setShowBalance} />;
      case 'tasks':
        return <TasksTab data={userData} />;
      case 'referrals':
        return <ReferralsTab data={userData} />;
      case 'withdrawal':
        return <WithdrawalTab data={userData} />;
      case 'investment':
        return <InvestmentTab data={userData} />;
      default:
        return <HomeTab data={userData} showBalance={showBalance} setShowBalance={setShowBalance} />;
    }
  };

  const navigationItems = [
    { name: 'home', icon: <Home className="nav-icon" />, label: 'Home' },
    { name: 'tasks', icon: <FileText className="nav-icon" />, label: 'Tasks' },
    { name: 'referrals', icon: <Users className="nav-icon" />, label: 'Referrals' },
    { name: 'withdrawal', icon: <DollarSign className="nav-icon" />, label: 'Withdrawal' },
    { name: 'investment', icon: <TrendingUp className="nav-icon" />, label: 'Investment' },
  ];

  const ProfileBottomSheet = () => (
    <BottomSheet 
      isOpen={isProfileSheetOpen} 
      onClose={() => setIsProfileSheetOpen(false)}
      title="Profile Information"
    > 

      <button 
        className="settings-btn" 
        onClick={() => console.log('Settings clicked')}
      >
         <FontAwesomeIcon 
            icon={faGear} 
            size="lg" 
            spin 
          />

      </button>
      <div className="profile-content">
        <div className="profile-image-container">
          <div className={`flip-container ${showQRCode ? 'flipped' : ''}`}>
            <div className="flipper">
              <div className="front">
                <img
                  src={userData?.photoURL || userData?.profileImage || '/userImage/profile-pic.webp'}
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <div className="back">
                <div className="qr-code-container">
                  <QRCodeSVG
                    value={userData?.referrals?.link || 'https://example.com'}
                    size={180}
                    level="H"
                    fgColor="#000000"
                    bgColor="#ffffff"
                    includeMargin={false}
                    imageSettings={{
                      src: "/public/favicon/favicon.svg",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-info-section">
          <div className="info-group">
            <div className="name-wrapper">
              <div className="name-row">
                <h3>{userData?.name || userData?.email}</h3>
                <div className="profile-actions">

                  <button 
                    className="qr-share-btn" 
                    onClick={toggleQRCode}
                  >
                    <FontAwesomeIcon icon={faQrcode} />
                  </button>
                </div>
              </div>
              <p className="uid">{userData?.uid}</p>
            </div>
          </div>



          <div className="info-item">
            <label>Email:</label>
            <p>{maskData(userData?.email, 'email')}</p>
            <span className="verification-status">
              {userData?.isEmailVerified ? '✓ Verified' : '⚠ Unverified'}
            </span>
          </div>

          <div className="info-item">
            <label>Phone:</label>
            <p>{maskData(userData?.phone || '', 'phone')}</p>
          </div>



          <div className="info-item">
            <label>Account Created:</label>
            <p>{userData?.createdAt?.seconds ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
          </div>

          <div className="info-item">
            <label>KYC Status:</label>
            <p className={userData?.isProfileVerified ? 'verified' : 'unverified'}>
              {userData?.isProfileVerified ? 'Verified' : 'Unverified'}
            </p>
          </div>

          <div className="info-item">
            <label>Referral Code:</label>
            <p>{userData?.referrals?.code || 'N/A'}</p>
          </div>

          <div className="info-item">
            <label>Total Balance:</label>
            <p>{userData?.balance?.total?.toLocaleString() || '0'} {userData?.currency || 'XAF'}</p>
          </div>

          <button 
            className="logout-button" 
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </BottomSheet>
  );

  const NotificationBottomSheet = () => {
    useEffect(() => {
      if (isPWA() && isNotificationSheetOpen) {
        handleNotificationClick();
      }
    }, [isNotificationSheetOpen]);

    return (
      <BottomSheet 
        isOpen={isNotificationSheetOpen} 
        onClose={() => setIsNotificationSheetOpen(false)}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Notifications
          <FontAwesomeIcon icon={faBell} />
        </div>}
      >
        <div className="notifications-sheet-content">
          {userData?.notifications?.items?.length > 0 ? (
            userData.notifications.items.map((notification: { message: string; timestamp: Date; date: string }, index: number) => (
              <div key={index} className="notification-item">
                <div className="notification-text">{notification.message}</div>
                <div className="notification-date">{notification.date}</div>
              </div>
            ))
          ) : (
            <>
              <div className="no-notifications">No notifications yet</div>
            </>
          )}
        </div>
      </BottomSheet>
    );
  };


  return (
    <div className="app-container nav-container">
      <div className="side-nav">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-cm">Content</span>
            <span className="logo-i"></span>
          </div>
        </div>

        {navigationItems.map((item) => (
          <div 
            key={item.name}
            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
            onClick={() => handleTabChange(item.name as TabName)}
          >
            {item.icon}
            <div className="nav-text">{item.label}</div>
          </div>
        ))}

        <div 
          className={`logout-container ${isLoggingOut ? 'animating' : ''}`} 
          onClick={!isLoggingOut ? handleLogout : undefined}
        >
          <div className="logout-content">
            <LogOut className="logout-icon" />
            <div className="logout-text">LogOut</div>
          </div>
        </div>
      </div>

      <div className="header">
        <div 
          className="profile-btn-img"
          onClick={() => setIsProfileSheetOpen(true)}
          role="button"
          aria-label="Open profile"
          tabIndex={0}
        >
          <img
            src={userData?.photoURL || userData?.profileImage || '/userImage/profile-pic.webp'}
            alt="Profile"
            onError={(e) => {
              console.log('Image failed to load:', e.currentTarget.src);
              e.currentTarget.src = '/userImage/profile-pic.webp';
            }}
          />
        </div>

        <div className="logo">
          <span className="logo-cm">Vera</span>
          <span className="logo-i">Pex</span>
        </div>

        <div 
          className="notification-container"
          onClick={() => setIsNotificationSheetOpen(true)}
          role="button"
          aria-label="Open notifications"
          tabIndex={0}
        >
          <Bell className="icon" />
          <div className="notification-badge">{/*data.notifications.count*/}</div> 
        </div>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>

      <div className="bottom-nav">
        {navigationItems.map((item) => (
          <div 
            key={item.name}
            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
            onClick={() => handleTabChange(item.name as TabName)}
          >
            {item.icon}
            <div className="nav-text">{item.label}</div>
          </div>
        ))}
      </div>
      <ProfileBottomSheet />
      <NotificationBottomSheet />
      <BottomSheet 
        isOpen={isDepositSheetOpen} 
        onClose={() => setIsDepositSheetOpen(false)}
        title="Make a Deposit"
      >
        {/* Deposit sheet content here */}
      </BottomSheet>
      <ToastContainer />
    </div>
  );
};

export default FinanceApp;
