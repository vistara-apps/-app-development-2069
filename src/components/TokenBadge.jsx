import React from 'react'
import { Coins, Building2 } from 'lucide-react'

const TokenBadge = ({ 
  token, 
  business, 
  balance, 
  className = '',
  showBusiness = true,
  size = 'md',
  onClick 
}) => {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Support legacy props
  const displayBalance = balance || token?.balance || 0
  const displaySymbol = token?.symbol || 'TOKENS'

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Coins className={`text-blue-600 ${iconSizes[size]}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {token?.name || 'Token'}
            </h3>
            {showBusiness && business && (
              <div className="flex items-center space-x-1 text-gray-600 text-sm">
                <Building2 className="w-3 h-3" />
                <span>{business.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {displayBalance}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {displaySymbol}
          </div>
        </div>
      </div>
      
      {token?.redemption_value && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Redeem:</span> {token.redemption_value}
          </p>
        </div>
      )}
    </div>
  )
}

export default TokenBadge
