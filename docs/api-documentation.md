# LocalToken Rewards API Documentation

## Overview

LocalToken Rewards is a Base MiniApp that connects users with local businesses through tokenized loyalty programs. This documentation covers the API endpoints, database schema, smart contract interfaces, and integration patterns.

## Table of Contents

1. [Authentication](#authentication)
2. [Database API](#database-api)
3. [Smart Contract Integration](#smart-contract-integration)
4. [Farcaster Frame Integration](#farcaster-frame-integration)
5. [QR Code System](#qr-code-system)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Deployment](#deployment)

## Authentication

The application uses wallet-based authentication combined with Supabase Auth for session management.

### Wallet Connection Flow

1. User connects wallet via RainbowKit
2. Application creates/retrieves user profile using wallet address
3. Supabase session is established for database access

```javascript
// Example authentication
import { useAccount } from 'wagmi'
import { userApi } from '../api/userApi'

const { address } = useAccount()
const user = await userApi.getUserByWallet(address)
```

## Database API

### Business API (`businessApi`)

#### Get Businesses
```javascript
// Get all active businesses with optional filtering
const businesses = await businessApi.getBusinesses({
  category: 'Coffee & Tea',
  location: 'Downtown'
})
```

#### Create Business
```javascript
const business = await businessApi.createBusiness({
  name: 'Brew & Bean Coffee',
  description: 'Artisan coffee roasted daily',
  location: '123 Main St, Downtown',
  contactInfo: 'contact@brewbean.com',
  category: 'Coffee & Tea',
  rewardScheme: 'Earn 1 token per $5 spent',
  ownerWallet: '0x...'
})
```

#### Get Business Analytics
```javascript
const analytics = await businessApi.getBusinessAnalytics(businessId)
// Returns: { totalTokensMinted, totalTokensRedeemed, uniqueUsers, totalTransactions }
```

### Event API (`eventApi`)

#### Get Events
```javascript
// Get upcoming events
const events = await eventApi.getEvents({
  upcoming: true,
  businessId: 'optional-business-id'
})
```

#### Create Event
```javascript
const event = await eventApi.createEvent({
  businessId: 'business-uuid',
  title: 'Happy Hour Coffee',
  description: '50% off all specialty drinks',
  startTime: '2024-01-15T15:00:00Z',
  endTime: '2024-01-15T17:00:00Z',
  location: '123 Main St',
  dealDetails: 'Double tokens on all purchases',
  type: 'deal',
  tokenReward: 5
})
```

#### RSVP to Event
```javascript
const rsvp = await eventApi.rsvpToEvent(eventId, userId, 'attending')
```

### User API (`userApi`)

#### Get User Profile
```javascript
const user = await userApi.getUserByWallet('0x...')
```

#### Update User Profile
```javascript
const updatedUser = await userApi.updateUser(userId, {
  username: 'newusername',
  preferences: { notifications: true }
})
```

#### Get User Token Balances
```javascript
const tokens = await userApi.getUserTokens(userId)
// Returns array of token balances with business info
```

#### Record Transaction
```javascript
const transaction = await userApi.recordTransaction({
  userId: 'user-uuid',
  businessId: 'business-uuid',
  tokenId: 'token-uuid',
  type: 'mint', // or 'redeem'
  amount: 5,
  transactionHash: '0x...',
  metadata: { source: 'qr_scan' }
})
```

## Smart Contract Integration

### Token Contract Hooks

#### useTokenContract Hook
```javascript
import { useTokenContract } from '../hooks/useTokenContract'

const {
  balance,
  totalSupply,
  mintTokens,
  redeemTokens,
  isLoading,
  error
} = useTokenContract(tokenAddress)

// Mint tokens (business owner only)
await mintTokens(recipientAddress, amount, businessId, tokenId)

// Redeem tokens
await redeemTokens(amount, businessId, tokenId)
```

#### useTokenFactory Hook
```javascript
import { useTokenFactory } from '../hooks/useTokenContract'

const {
  businessTokens,
  createBusinessToken,
  isLoading
} = useTokenFactory()

// Create new business token
const txHash = await createBusinessToken('Coffee Bean Token', 'CBT')
```

### Smart Contract ABIs

#### Business Token Contract
- `mint(address to, uint256 amount)` - Mint tokens to address
- `redeem(uint256 amount)` - Redeem tokens
- `balanceOf(address account)` - Get token balance
- `totalSupply()` - Get total token supply
- `businessOwner()` - Get business owner address

#### Token Factory Contract
- `createBusinessToken(string name, string symbol)` - Deploy new token
- `getBusinessTokens(address owner)` - Get tokens owned by address

## Farcaster Frame Integration

### Frame Endpoints

#### Business Discovery Frame
```
GET /frames/business/:businessId
```
Returns Open Graph metadata for business discovery frame.

#### Token Claim Frame
```
POST /frames/claim-token
```
Handles token claiming from Farcaster frames.

### Frame Metadata Structure
```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://app.com/frame-image.png" />
<meta property="fc:frame:button:1" content="Claim Tokens" />
<meta property="fc:frame:post_url" content="https://app.com/frames/claim-token" />
```

## QR Code System

### QR Code Generation
```javascript
import QRCodeGenerator from '../components/QRCodeGenerator'

<QRCodeGenerator
  businessId="business-uuid"
  tokenId="token-uuid"
  amount={5}
  metadata={{ source: 'purchase' }}
/>
```

### QR Code Scanning
```javascript
import QRScanner from '../components/QRScanner'

<QRScanner
  isOpen={scannerOpen}
  onScan={(qrData) => {
    // Handle scanned token data
    console.log(qrData) // { type: 'token_mint', businessId, tokenId, amount }
  }}
  onClose={() => setScannerOpen(false)}
/>
```

### QR Code Data Structure
```json
{
  "type": "token_mint",
  "businessId": "business-uuid",
  "tokenId": "token-uuid",
  "amount": 5,
  "timestamp": 1704067200000,
  "metadata": {
    "source": "purchase",
    "location": "store_front"
  }
}
```

## Error Handling

### API Error Structure
```javascript
{
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "message": "Business with ID xyz not found",
    "details": {
      "businessId": "xyz",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Common Error Codes
- `WALLET_NOT_CONNECTED` - User wallet not connected
- `INSUFFICIENT_TOKENS` - Not enough tokens for redemption
- `BUSINESS_NOT_FOUND` - Business does not exist
- `TOKEN_CONTRACT_ERROR` - Smart contract interaction failed
- `QR_SCAN_ERROR` - QR code scanning failed
- `FRAME_VALIDATION_ERROR` - Farcaster frame validation failed

### Error Handling Pattern
```javascript
try {
  const result = await businessApi.getBusinessById(businessId)
  return result
} catch (error) {
  console.error('API Error:', error)
  
  if (error.code === 'BUSINESS_NOT_FOUND') {
    // Handle specific error
  } else {
    // Handle generic error
  }
  
  throw error
}
```

## Rate Limiting

### API Rate Limits
- **Business API**: 100 requests per minute per IP
- **Event API**: 50 requests per minute per IP
- **User API**: 200 requests per minute per authenticated user
- **Frame Endpoints**: 1000 requests per minute per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

## Database Schema

### Tables Overview

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    farcaster_profile TEXT,
    email TEXT,
    favorite_businesses UUID[],
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Businesses
```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact_info TEXT,
    category TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    reward_scheme TEXT,
    owner_wallet TEXT NOT NULL,
    token_contract_address TEXT,
    status TEXT DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tokens
```sql
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    contract_address TEXT UNIQUE NOT NULL,
    minting_criteria JSONB DEFAULT '{}',
    redemption_value TEXT,
    token_value DECIMAL(10,4) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Loyalty Transactions
```sql
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    business_id UUID REFERENCES businesses(id),
    token_id UUID REFERENCES tokens(id),
    type TEXT NOT NULL CHECK (type IN ('mint', 'redeem')),
    amount INTEGER NOT NULL,
    transaction_hash TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deployment

### Environment Variables
See `.env.example` for complete configuration.

### Required Services
1. **Supabase** - Database and authentication
2. **Base RPC** - Blockchain interaction
3. **IPFS/CDN** - Asset storage
4. **Vercel/Netlify** - Frontend hosting

### Deployment Steps
1. Set up Supabase project and run migrations
2. Deploy smart contracts to Base network
3. Configure environment variables
4. Deploy frontend to hosting platform
5. Set up domain and SSL certificates

### Smart Contract Deployment
```bash
# Deploy Token Factory contract
npx hardhat deploy --network base --tags TokenFactory

# Verify contracts
npx hardhat verify --network base <contract-address>
```

### Database Migration
```bash
# Run Supabase migrations
supabase db push

# Seed sample data
supabase db seed
```

## Security Considerations

### Row Level Security (RLS)
All database tables have RLS policies to ensure data privacy:
- Users can only access their own data
- Business owners can only modify their businesses
- Public data is read-only for non-owners

### Smart Contract Security
- Token minting restricted to business owners
- Redemption requires token ownership
- All transactions are logged on-chain

### API Security
- Wallet-based authentication
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration for allowed origins

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Smart Contract Tests
```bash
npx hardhat test
```

## Support

For technical support or questions about the API:
- GitHub Issues: [Repository Issues](https://github.com/vistara-apps/-app-development-2069/issues)
- Documentation: [Full Documentation](https://docs.localtoken.app)
- Discord: [Community Discord](https://discord.gg/localtoken)

---

*Last updated: January 2024*
