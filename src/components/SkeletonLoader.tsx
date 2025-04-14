
import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="skeleton-home-tab animate-pulse">
      <div className="skeleton-user-name"></div>
      
      <div className="skeleton-balance-section">
        <div className="skeleton-section-title"></div>
        <div className="skeleton-total-balance-card">
          <div className="skeleton-balance-amount"></div>
        </div>
        <div className="skeleton-locked-balance"></div>
      </div>

      <div className="skeleton-two-column-grid">
        <div className="skeleton-green-card">
          <div className="skeleton-card-title"></div>
          <div className="skeleton-card-amount"></div>
          <div className="skeleton-referral-count"></div>
        </div>
        <div className="skeleton-green-card">
          <div className="skeleton-card-title"></div>
          <div className="skeleton-card-amount"></div>
        </div>
      </div>

      <div className="skeleton-two-column-grid">
        <div className="skeleton-green-card">
          <div className="skeleton-card-title"></div>
          <div className="skeleton-card-amount"></div>
        </div>
        <div className="skeleton-dark-card"></div>
      </div>

      <div className="skeleton-graph-card"></div>
    </div>
  );
};

export default SkeletonLoader;
