import React from 'react';
import { MapPin, Star, Coins } from 'lucide-react';
import TokenBadge from './TokenBadge';

const BusinessCard = ({ business, variant = 'compact', userTokens = [] }) => {
  const businessToken = userTokens.find(token => token.businessId === business.businessId);
  
  const cardClasses = {
    compact: 'p-4',
    detailed: 'p-6'
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 ${cardClasses[variant]} card-gradient backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{business.image}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">{business.name}</h3>
            <p className="text-sm text-gray-400">{business.category}</p>
          </div>
        </div>
        {businessToken && (
          <TokenBadge token={businessToken} variant="small" />
        )}
      </div>
      
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{business.description}</p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{business.location}</span>
        </div>
        <div className="flex items-center text-yellow-400">
          <Star className="w-4 h-4 mr-1 fill-current" />
          <span>{business.rating}</span>
        </div>
      </div>
      
      {variant === 'detailed' && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center text-sm text-purple-400">
            <Coins className="w-4 h-4 mr-2" />
            <span>{business.rewardScheme}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCard;