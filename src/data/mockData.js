export const mockTokens = [
  {
    tokenId: '1',
    name: 'Coffee Bean Token',
    symbol: 'CBT',
    contractAddress: '0x1234...5678',
    businessId: '1',
    balance: 15,
    value: 0.50,
    redemptionValue: 'Free coffee after 10 tokens'
  },
  {
    tokenId: '2',
    name: 'Pizza Point',
    symbol: 'PPT',
    contractAddress: '0x2345...6789',
    businessId: '2',
    balance: 8,
    value: 1.00,
    redemptionValue: '20% off next order'
  },
  {
    tokenId: '3',
    name: 'Bookstore Reward',
    symbol: 'BSR',
    contractAddress: '0x3456...7890',
    businessId: '3',
    balance: 3,
    value: 2.00,
    redemptionValue: '$5 off books over $25'
  }
];

export const mockBusinesses = [
  {
    businessId: '1',
    name: 'Brew & Bean Coffee',
    description: 'Artisan coffee roasted daily with locally sourced beans',
    location: '123 Main St, Downtown',
    contactInfo: 'hello@brewbean.com',
    tokenContractAddress: '0x1234...5678',
    category: 'Coffee & Tea',
    rating: 4.8,
    image: '☕',
    rewardScheme: 'Earn 1 token per $5 spent, redeem 10 tokens for free coffee'
  },
  {
    businessId: '2',
    name: 'Mario\'s Pizza Palace',
    description: 'Authentic Italian pizza made with fresh ingredients',
    location: '456 Oak Ave, Little Italy',
    contactInfo: 'info@mariospizza.com',
    tokenContractAddress: '0x2345...6789',
    category: 'Restaurant',
    rating: 4.6,
    image: '🍕',
    rewardScheme: 'Earn tokens with every order, get discounts and free items'
  },
  {
    businessId: '3',
    name: 'Page Turner Books',
    description: 'Independent bookstore with curated selection and cozy reading nooks',
    location: '789 Elm St, Arts District',
    contactInfo: 'books@pageturner.com',
    tokenContractAddress: '0x3456...7890',
    category: 'Books & Media',
    rating: 4.9,
    image: '📚',
    rewardScheme: 'Earn tokens for purchases and book reviews'
  },
  {
    businessId: '4',
    name: 'Green Garden Market',
    description: 'Organic produce and sustainable goods from local farmers',
    location: '321 Pine St, Green District',
    contactInfo: 'hello@greengarden.com',
    category: 'Grocery',
    rating: 4.7,
    image: '🥬',
    rewardScheme: 'Seasonal token rewards for eco-friendly shopping'
  }
];

export const mockEvents = [
  {
    eventId: '1',
    businessId: '1',
    title: 'Happy Hour Coffee',
    description: '50% off all specialty drinks from 3-5 PM',
    startTime: '2024-01-15T15:00:00',
    endTime: '2024-01-15T17:00:00',
    location: 'Brew & Bean Coffee',
    dealDetails: 'Double tokens on all purchases during happy hour',
    type: 'deal'
  },
  {
    eventId: '2',
    businessId: '2',
    title: 'Pizza Making Workshop',
    description: 'Learn to make authentic Italian pizza with our head chef',
    startTime: '2024-01-20T18:00:00',
    endTime: '2024-01-20T20:00:00',
    location: 'Mario\'s Pizza Palace',
    dealDetails: 'Participants receive 20 bonus tokens',
    type: 'event'
  },
  {
    eventId: '3',
    businessId: '3',
    title: 'Book Club Meeting',
    description: 'Monthly discussion of "The Seven Husbands of Evelyn Hugo"',
    startTime: '2024-01-25T19:00:00',
    endTime: '2024-01-25T21:00:00',
    location: 'Page Turner Books',
    dealDetails: '15% off featured book for attendees',
    type: 'event'
  },
  {
    eventId: '4',
    businessId: '4',
    title: 'Farmers Market Special',
    description: 'Fresh winter produce and seasonal items',
    startTime: '2024-01-22T08:00:00',
    endTime: '2024-01-22T14:00:00',
    location: 'Green Garden Market',
    dealDetails: 'Triple tokens on all organic purchases',
    type: 'deal'
  }
];

export const mockUser = {
  userId: '0x1234567890abcdef',
  username: 'crypto_local',
  farcasterProfile: '@crypto_local',
  totalTokensEarned: 156,
  totalTokensRedeemed: 89,
  favoriteBusinesses: ['1', '3'],
  memberSince: '2023-08-15'
};

export const mockAnalytics = {
  totalTokenValue: 47.50,
  tokenGrowth: '+12%',
  businessesVisited: 8,
  rewardsEarned: 23,
  weeklyActivity: [
    { day: 'Mon', tokens: 5 },
    { day: 'Tue', tokens: 8 },
    { day: 'Wed', tokens: 12 },
    { day: 'Thu', tokens: 6 },
    { day: 'Fri', tokens: 15 },
    { day: 'Sat', tokens: 20 },
    { day: 'Sun', tokens: 10 }
  ]
};