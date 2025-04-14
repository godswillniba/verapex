import React from 'react';

import './css/Blog.css';
import App from './momo/App';


// Define a default theme object
const THEME = {
  secondary: '#2fff00',
};

const InitialDeposit = () => {
  return (
    <div className="depo-content" >
      <div className="grid-container">
        <div className="left-side">
          <div className="text-box">
            <h2>
              Activate <span style={{ color: THEME.secondary }}>VeraPex</span> <br /> with an initail Depo
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

      <App />
      
    </div>
  );
};

export default InitialDeposit;