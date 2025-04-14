import React from 'react';
import MobileMoneyForm from './MobileMoneyForm';
import './css/Blog.css';


// Define a default theme object
const THEME = {
  secondary: '#007bff',
};

const Deposit = () => {
  return (
    <div className="depo-content" >
      <div className="grid-container">
        <div className="left-side">
          <div className="text-box">
            <h2>
              Activate  <span style={{ color: THEME.secondary }}>Your</span> <br /> Account
            </h2>
          </div>

          <div className="earnings-box">
            
            <h1 className="earnings-amount"> 😊😊😊😊😊😊

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

      <p className="header-info" style={{ fontSize: '0.7rem' }}>
        To activate your account, please make your first deposit of exactly 3500 XAF. Once deposited, this amount will be fully credited to your account, allowing you to start investing.
      </p>


      {/* Mobile Money Form Component */}
      <MobileMoneyForm onSubmit={() => {}} />

      
        
      
    </div>
  );
};

export default Deposit;