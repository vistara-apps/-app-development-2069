import React from 'react';
import { Coins } from 'lucide-react';

const TokenBadge = ({ token, variant = 'small', onClick }) => {
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    large: 'px-4 py-3 text-base'
  };

  return (
    <div 
      className={`inline-flex items-center ${sizeClasses[variant]} bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105`}
      onClick={onClick}
    >
      <Coins className="w-4 h-4 mr-2" />
      <span className="font-semibold">{token.balance}</span>
      <span className="ml-1 opacity-90">{token.symbol}</span>
    </div>
  );
};

export default TokenBadge;