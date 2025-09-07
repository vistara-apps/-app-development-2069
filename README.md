# LocalToken Rewards

A Base MiniApp that connects users with local businesses through tokenized loyalty programs.

## 🚀 Features

- **Tokenized Loyalty Programs**: Businesses can issue custom digital tokens to customers
- **Local Business Discovery**: Find and explore local businesses with loyalty programs
- **Event Management**: Discover local events and special offers
- **QR Code Integration**: Easy token minting through QR code scanning
- **Farcaster Frame Integration**: Seamless interaction within the Farcaster ecosystem
- **Wallet Integration**: Connect with Base-compatible wallets via RainbowKit

## 🛠 Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Blockchain**: Base (Ethereum L2)
- **Wallet**: RainbowKit + Wagmi
- **Backend**: Supabase (Database + Auth)
- **Smart Contracts**: Solidity (ERC-20 tokens)
- **QR Codes**: qrcode + qr-scanner libraries
- **Frames**: Farcaster Frame integration

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account
- A WalletConnect project ID
- Base network RPC access

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/-app-development-2069.git
cd -app-development-2069
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Contract Addresses (after deployment)
VITE_TOKEN_FACTORY_ADDRESS=0x...
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the database migration:

```bash
# If you have Supabase CLI installed
supabase db push

# Or manually run the SQL from supabase/migrations/001_initial_schema.sql
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗 Project Structure

```
src/
├── api/                 # API layer for database operations
│   ├── businessApi.js   # Business-related API calls
│   ├── eventApi.js      # Event management API
│   └── userApi.js       # User profile and transactions
├── components/          # Reusable UI components
│   ├── AppShell.jsx     # Main layout component
│   ├── BusinessCard.jsx # Business display component
│   ├── EventCard.jsx    # Event display component
│   ├── QRCodeGenerator.jsx # QR code generation
│   ├── QRScanner.jsx    # QR code scanning
│   └── TokenBadge.jsx   # Token display component
├── hooks/               # Custom React hooks
│   └── useTokenContract.js # Smart contract interactions
├── lib/                 # Utility libraries
│   └── supabase.js      # Supabase client configuration
├── pages/               # Page components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Businesses.jsx   # Business directory
│   ├── Events.jsx       # Events listing
│   ├── Profile.jsx      # User profile
│   └── BusinessOnboarding.jsx # Business registration
├── data/                # Mock data and constants
└── App.jsx              # Main application component
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key to `.env`
3. Run the database migration from `supabase/migrations/001_initial_schema.sql`
4. Enable Row Level Security (RLS) policies

### Smart Contract Deployment

The application requires deployed smart contracts on Base network:

1. **Token Factory Contract**: Creates new business tokens
2. **Business Token Contract**: ERC-20 tokens for each business

Deploy using Hardhat or your preferred deployment tool.

### WalletConnect Configuration

1. Create a project at [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Add your project ID to the environment variables

## 🎯 Usage

### For Users

1. **Connect Wallet**: Connect your Base-compatible wallet
2. **Discover Businesses**: Browse local businesses with loyalty programs
3. **Earn Tokens**: Scan QR codes at participating businesses to earn tokens
4. **Redeem Rewards**: Use tokens to claim rewards and discounts
5. **Attend Events**: RSVP to local events and earn bonus tokens

### For Businesses

1. **Register Business**: Complete the onboarding flow at `/business-onboarding`
2. **Create Token Program**: Set up your loyalty token and reward scheme
3. **Generate QR Codes**: Create QR codes for customers to scan
4. **Manage Events**: Create events and special offers
5. **Track Analytics**: Monitor token distribution and customer engagement

## 🔗 API Documentation

Comprehensive API documentation is available in [`docs/api-documentation.md`](docs/api-documentation.md).

Key API endpoints:

- **Business API**: Create, read, update business profiles
- **Event API**: Manage events and RSVPs
- **User API**: User profiles and token transactions
- **Smart Contract Hooks**: Token minting and redemption

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Smart contract tests (if applicable)
npm run test:contracts
```

## 🚀 Deployment

### Frontend Deployment

Deploy to Vercel, Netlify, or similar platform:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Database Migration

Ensure your production Supabase instance has the latest schema:

```bash
supabase db push --project-ref your-project-ref
```

### Environment Variables

Set all required environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [API Documentation](docs/api-documentation.md)
- **Issues**: [GitHub Issues](https://github.com/vistara-apps/-app-development-2069/issues)
- **Discord**: [Community Discord](https://discord.gg/localtoken)

## 🙏 Acknowledgments

- Built on [Base](https://base.org/) - Ethereum L2 network
- Powered by [Farcaster](https://farcaster.xyz/) frames
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Wallet integration via [RainbowKit](https://rainbowkit.com/)

---

**LocalToken Rewards** - Connecting communities through tokenized loyalty programs 🏪✨
