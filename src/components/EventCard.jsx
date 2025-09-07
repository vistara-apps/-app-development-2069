import React from 'react';
import { Calendar, MapPin, Clock, Tag } from 'lucide-react';

const EventCard = ({ event, business, variant = 'default' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const eventTypeColors = {
    event: 'bg-blue-500',
    deal: 'bg-green-500'
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 p-4 card-gradient backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${eventTypeColors[event.type]}`}>
              {event.type === 'event' ? 'Event' : 'Deal'}
            </span>
            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">{event.description}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDate(event.startTime)}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{business?.name || event.location}</span>
        </div>
        {event.dealDetails && (
          <div className="flex items-center text-purple-400">
            <Tag className="w-4 h-4 mr-2" />
            <span>{event.dealDetails}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;