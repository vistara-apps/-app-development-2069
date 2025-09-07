import React from 'react';

const CallToActionButton = ({ children, variant = 'primary', onClick, disabled, className = '' }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white focus:ring-purple-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 focus:ring-gray-500'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default CallToActionButton;