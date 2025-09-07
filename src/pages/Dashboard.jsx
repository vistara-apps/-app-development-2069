import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Coins, Building2, Gift, Plus } from 'lucide-react';
import { mockTokens, mockBusinesses, mockAnalytics, mockUser } from '../data/mockData';
import TokenBadge from '../components/TokenBadge';
import BusinessCard from '../components/BusinessCard';
import CallToActionButton from '../components/CallToActionButton';

const Dashboard = () => {
  const [selectedToken, setSelectedToken] = useState(null);

  const handleMintToken = (businessId) => {
    alert(`Minting token for business ${businessId}! (This would integrate with smart contracts)`);
  };

  const handleRedeemToken = (token) => {
    alert(`Redeeming ${token.symbol} token! (This would process the redemption)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {mockUser.username}!</h1>
        <p className="text-purple-100">You've earned {mockUser.totalTokensEarned} tokens across {mockAnalytics.businessesVisited} local businesses</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Token Value</p>
              <p className="text-2xl font-bold text-white">${mockAnalytics.totalTokenValue}</p>
            </div>
            <Coins className="w-8 h-8 text-purple-500" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 text-sm">{mockAnalytics.tokenGrowth} this week</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Businesses Visited</p>
              <p className="text-2xl font-bold text-white">{mockAnalytics.businessesVisited}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rewards Earned</p>
              <p className="text-2xl font-bold text-white">{mockAnalytics.rewardsEarned}</p>
            </div>
            <Gift className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Tokens</p>
              <p className="text-2xl font-bold text-white">{mockTokens.length}</p>
            </div>
            <Coins className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Weekly Token Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockAnalytics.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }} 
            />
            <Bar dataKey="tokens" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Your Tokens */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Your Tokens</h2>
          <CallToActionButton variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Discover More
          </CallToActionButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockTokens.map((token) => (
            <div key={token.tokenId} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{token.name}</h3>
                <TokenBadge token={token} variant="small" />
              </div>
              <p className="text-gray-400 text-sm mb-3">{token.redemptionValue}</p>
              <div className="flex space-x-2">
                <CallToActionButton 
                  variant="primary" 
                  className="flex-1 text-sm py-2"
                  onClick={() => handleRedeemToken(token)}
                >
                  Redeem
                </CallToActionButton>
                <CallToActionButton 
                  variant="secondary" 
                  className="flex-1 text-sm py-2"
                  onClick={() => handleMintToken(token.businessId)}
                >
                  Earn More
                </CallToActionButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Businesses */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Featured Local Businesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockBusinesses.slice(0, 3).map((business) => (
            <BusinessCard 
              key={business.businessId} 
              business={business} 
              variant="compact"
              userTokens={mockTokens}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;