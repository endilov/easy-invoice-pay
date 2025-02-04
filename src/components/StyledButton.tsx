import React from 'react';

interface StyledButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const StyledButton = ({ children, onClick, type = "button", disabled }: StyledButtonProps) => {
  return (
    <div className="styled-button-wrapper">
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq">
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 9 0" />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq2">
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0" />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq3">
          <feColorMatrix values="1 0 0 0.2 0 0 1 0 0.2 0 0 0 1 0.2 0 0 0 0 2 0" />
        </filter>
      </svg>
      <button 
        className="real-button" 
        onClick={onClick}
        type={type}
        disabled={disabled}
      />
      <div className="backdrop" />
      <div className="button-container">
        <div className="spin spin-blur" />
        <div className="spin spin-intense" />
        <div className="backdrop" />
        <div className="button-border">
          <div className="spin spin-inside" />
          <div className="button">{children}</div>
        </div>
      </div>
    </div>
  );
}