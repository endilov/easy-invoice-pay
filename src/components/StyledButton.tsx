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
      <button 
        className="codepen-button"
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    </div>
  );
};