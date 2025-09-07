import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { mockBusinesses, mockTokens } from '../data/mockData';
import BusinessCard from '../components/BusinessCard';
import CallToActionButton from '../components/CallToActionButton';

const Businesses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Coffee & Tea', 'Restaurant', 'Books & Media', 'Grocery'];

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleVisitBusiness = (businessId) => {
    alert(`Visiting business ${businessId}! (This would show QR code or check-in option)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Discover Local Businesses</h1>
        <p className="text-blue-100">Find amazing local spots and earn tokens with every visit</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {filteredBusinesses.length} of {mockBusinesses.length} businesses
        </p>
        <div className="flex items-center text-sm text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Downtown Area</span>
        </div>
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <div key={business.businessId} className="space-y-4">
            <BusinessCard 
              business={business} 
              variant="detailed"
              userTokens={mockTokens}
            />
            <CallToActionButton 
              variant="primary" 
              className="w-full"
              onClick={() => handleVisitBusiness(business.businessId)}
            >
              Visit & Earn Tokens
            </CallToActionButton>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No businesses found</div>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Call to Action for Business Owners */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl font-semibold mb-2">Are you a local business owner?</h3>
        <p className="text-purple-100 mb-4">Join LocalToken Rewards and start building customer loyalty with blockchain technology</p>
        <CallToActionButton variant="secondary">
          Register Your Business
        </CallToActionButton>
      </div>
    </div>
  );
};

export default Businesses;