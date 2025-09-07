import React, { useState } from 'react';
import { User, Coins, Award, Calendar, Edit, Share2, Trophy } from 'lucide-react';
import { mockUser, mockTokens, mockBusinesses, mockAnalytics } from '../data/mockData';
import TokenBadge from '../components/TokenBadge';
import CallToActionButton from '../components/CallToActionButton';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(mockUser.username);

  const handleSaveProfile = () => {
    setIsEditing(false);
    alert('Profile updated!');
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`Check out my LocalToken profile: ${mockUser.farcasterProfile}`);
    alert('Profile link copied to clipboard!');
  };

  const getFavoriteBusinesses = () => {
    return mockBusinesses.filter(business => 
      mockUser.favoriteBusinesses.includes(business.businessId)
    );
  };

  const getTotalTokenValue = () => {
    return mockTokens.reduce((total, token) => total + (token.balance * token.value), 0);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b border-white border-opacity-50 focus:outline-none focus:border-opacity-100"
                />
              ) : (
                <h1 className="text-2xl font-bold">{username}</h1>
              )}
              <p className="text-purple-100">{mockUser.farcasterProfile}</p>
              <p className="text-purple-200 text-sm">Member since {new Date(mockUser.memberSince).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <CallToActionButton variant="secondary" onClick={handleSaveProfile}>
                Save
              </CallToActionButton>
            ) : (
              <CallToActionButton variant="secondary" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </CallToActionButton>
            )}
            <CallToActionButton variant="secondary" onClick={handleShareProfile}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </CallToActionButton>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <Coins className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{mockUser.totalTokensEarned}</p>
          <p className="text-gray-400 text-sm">Total Tokens Earned</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{mockUser.totalTokensRedeemed}</p>
          <p className="text-gray-400 text-sm">Rewards Redeemed</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">${getTotalTokenValue().toFixed(2)}</p>
          <p className="text-gray-400 text-sm">Portfolio Value</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{mockAnalytics.businessesVisited}</p>
          <p className="text-gray-400 text-sm">Businesses Visited</p>
        </div>
      </div>

      {/* Token Portfolio */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Token Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTokens.map((token) => {
            const business = mockBusinesses.find(b => b.businessId === token.businessId);
            
            return (
              <div key={token.tokenId} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{business?.image}</span>
                    <div>
                      <h4 className="font-medium text-white">{token.name}</h4>
                      <p className="text-sm text-gray-400">{business?.name}</p>
                    </div>
                  </div>
                  <TokenBadge token={token} variant="small" />
                </div>
                <div className="text-sm text-gray-400">
                  <p>Value: ${(token.balance * token.value).toFixed(2)}</p>
                  <p className="mt-1">{token.redemptionValue}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Favorite Businesses */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Favorite Businesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getFavoriteBusinesses().map((business) => (
            <div key={business.businessId} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="text-2xl">{business.image}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{business.name}</h4>
                <p className="text-sm text-gray-400">{business.category}</p>
              </div>
              <CallToActionButton variant="secondary" className="text-sm px-4 py-2">
                Visit
              </CallToActionButton>
            </div>
          ))}
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'Earned 5 CBT tokens', business: 'Brew & Bean Coffee', time: '2 hours ago', type: 'earn' },
            { action: 'Redeemed 10 PPT tokens', business: 'Mario\'s Pizza Palace', time: '1 day ago', type: 'redeem' },
            { action: 'Earned 3 BSR tokens', business: 'Page Turner Books', time: '2 days ago', type: 'earn' },
            { action: 'Joined loyalty program', business: 'Green Garden Market', time: '1 week ago', type: 'join' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'earn' ? 'bg-green-500' : 
                  activity.type === 'redeem' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {activity.type === 'earn' ? '+' : activity.type === 'redeem' ? '-' : '★'}
                </div>
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-sm">{activity.business}</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;