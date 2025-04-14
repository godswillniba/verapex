// MarketButton.tsx
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import './css/MarketButton.css';

interface MarketButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}

const MarketButton: React.FC<MarketButtonProps> = ({
  label = 'Market',
  onClick = () => {},
  variant = 'primary',
  size = 'md',
  iconPosition = 'left',
  disabled = false,
}) => {
  const buttonClasses = [
    'market-button',
    `market-button--${variant}`,
    `market-button--${size}`,
    disabled ? 'market-button--disabled' : '',
  ].filter(Boolean).join(' ');

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22,
  }[size];

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {iconPosition === 'left' && (
        <ShoppingBag 
          size={iconSize} 
          className={label ? 'market-button__icon market-button__icon--left' : 'market-button__icon'} 
        />
      )}

      {label && <span className="market-button__label">{label}</span>}

      {iconPosition === 'right' && (
        <ShoppingBag 
          size={iconSize} 
          className={label ? 'market-button__icon market-button__icon--right' : 'market-button__icon'} 
        />
      )}
    </button>
  );
};

export default MarketButton;