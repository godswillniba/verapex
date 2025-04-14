import React, { useState, useEffect } from "react";
import "../components/css/LandingPage.css";
import {useNavigate} from "react-router-dom";
import Preloader from "../components/Preloader";


const LandingPage: React.FC = () => { 
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [raindrops, setRaindrops] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    const createRaindrop = () => {
      const left = Math.random() * window.innerWidth;
      const id = Date.now();
      setRaindrops(prev => [...prev, { id, left }]);
      setTimeout(() => {
        setRaindrops(prev => prev.filter(drop => drop.id !== id));
      }, 3000);
    };

    const interval = setInterval(createRaindrop, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const loginClick = () => {
    navigate("/login");
  };
  if (isLoading) {
    return <Preloader fullScreen={true} size={80} text="Loading VeraPex..." />;
  }

  return (
    <div className="landing-container">
      <div className="rain-container">
        {raindrops.map(drop => (
          <img 
            key={drop.id}
            src="../star.png"
            alt="raindrop"
            className="raindrop"
            style={{ left: `${drop.left}px` }}
          />
        ))}
      </div>
      <div className="background-container">
        <img src="bg-circle-mobile.317aa33b.svg" alt="Background Pattern" className="max-width-svg-image" />
      </div>
      <div className="content-wrapper">
        <div className="illustration-container">
          <div className="money-bag-illustration">
            <img src="../mainBanner.png" alt="Money Bag" className="money-bag-image" />
            <img src="../star.png" alt="Floating Coin" className="floating-coin coin-1" />
            <img src="../star.png" alt="Floating Coin" className="floating-coin coin-2" />
            <img src="../star.png" alt="Floating Coin" className="floating-coin coin-3" />
            <img src="../star.png" alt="Floating Coin" className="floating-coin coin-4" />
          </div>
        </div>

        <div className="text-content">
          <h1 className="main-heading">
            <span>Effortlessly&nbsp;Earn</span><br />
            <span>money online</span>
          </h1>
          <p className="tagline">
            <span>Invest,Trade and Grow Wisely with VeraPex Transforming Financial Opportunities Since 2020</span>
          </p>
        </div>

        <div className="action-buttons">
          <button className="primary-button" onClick={loginClick} >Login</button>
          <div className="divider">Or</div>
          <a href="/signup" className="secondary-button">
            Create an Account
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;