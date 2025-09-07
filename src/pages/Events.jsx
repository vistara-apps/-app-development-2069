import React, { useState } from 'react';
import { Calendar, Filter, Clock } from 'lucide-react';
import { mockEvents, mockBusinesses } from '../data/mockData';
import EventCard from '../components/EventCard';
import CallToActionButton from '../components/CallToActionButton';

const Events = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const eventTypes = ['All', 'Events', 'Deals'];

  const filteredEvents = mockEvents.filter(event => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Events') return event.type === 'event';
    if (selectedFilter === 'Deals') return event.type === 'deal';
    return true;
  });

  const handleRSVP = (eventId) => {
    alert(`RSVP for event ${eventId}! (This would register attendance and potentially mint tokens)`);
  };

  const getBusinessForEvent = (businessId) => {
    return mockBusinesses.find(business => business.businessId === businessId);
  };

  const isUpcoming = (startTime) => {
    return new Date(startTime) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Local Events & Deals</h1>
        <p className="text-green-100">Don't miss out on exclusive events and token-earning opportunities</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400 w-5 h-5" />
            <div className="flex space-x-2">
              {eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedFilter === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>Updated 5 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const business = getBusinessForEvent(event.businessId);
          const upcoming = isUpcoming(event.startTime);
          
          return (
            <div key={event.eventId} className="space-y-4">
              <EventCard 
                event={event} 
                business={business}
              />
              {upcoming && (
                <CallToActionButton 
                  variant="primary" 
                  className="w-full"
                  onClick={() => handleRSVP(event.eventId)}
                >
                  {event.type === 'event' ? 'RSVP Now' : 'Claim Deal'}
                </CallToActionButton>
              )}
              {!upcoming && (
                <div className="text-center py-2 text-gray-500">
                  This event has ended
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-4">No events found</div>
          <p className="text-gray-500">Check back later for upcoming events and deals</p>
        </div>
      )}

      {/* Upcoming This Week */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Coming Up This Week</h2>
        <div className="space-y-3">
          {mockEvents.filter(event => isUpcoming(event.startTime)).slice(0, 3).map((event) => {
            const business = getBusinessForEvent(event.businessId);
            
            return (
              <div key={event.eventId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">{event.title}</h4>
                  <p className="text-sm text-gray-400">{business?.name} • {new Date(event.startTime).toLocaleDateString()}</p>
                </div>
                <CallToActionButton variant="secondary" className="text-sm px-4 py-2">
                  View
                </CallToActionButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Events;