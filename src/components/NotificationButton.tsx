
import React from 'react';
import './css/NotificationButton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { handleNotificationClick } from './notification';

const NotificationButton: React.FC = () => {
  const handleClick = () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in your browser');
      return;
    }
    handleNotificationClick();
  };

  return (
    <button
      className="notifyBtn"
      id="notifyBtn"
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faBell} />
    </button>
  );
};

export default NotificationButton;
