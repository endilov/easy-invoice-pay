import React from 'react';
import visaIcon from '../assets/visa.svg';
import mastercardIcon from '../assets/mastercard.svg';
import amexIcon from '../assets/amex.svg';

interface CardTypeIconProps {
  cardNumber: string;
}

export const CardTypeIcon: React.FC<CardTypeIconProps> = ({ cardNumber }) => {
  const firstDigit = cardNumber.charAt(0);
  const baseClasses = "absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-8 transition-all duration-300";
  
  const getIcon = () => {
    switch (firstDigit) {
      case "4":
        return (
          <div className={`${baseClasses} opacity-80 hover:opacity-100`}>
            <img 
              src={visaIcon} 
              alt="Visa" 
              className="w-full h-full object-contain"
            />
          </div>
        );
      case "5":
        return (
          <div className={`${baseClasses} opacity-80 hover:opacity-100`}>
            <img 
              src={mastercardIcon} 
              alt="Mastercard" 
              className="w-full h-full object-contain"
            />
          </div>
        );
      case "6":
        return (
          <div className={`${baseClasses} opacity-80 hover:opacity-100`}>
            <img 
              src={amexIcon} 
              alt="American Express" 
              className="w-full h-full object-contain"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return getIcon();
};