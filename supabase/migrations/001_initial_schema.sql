-- LocalToken Rewards Database Schema
-- This migration creates the initial database structure for the LocalToken Rewards application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
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

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact_info TEXT,
    category TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    image_url TEXT,
    reward_scheme TEXT,
    owner_wallet TEXT NOT NULL,
    token_contract_address TEXT,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tokens table
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    contract_address TEXT UNIQUE NOT NULL,
    minting_criteria JSONB DEFAULT '{}',
    redemption_value TEXT,
    token_value DECIMAL(10,4) DEFAULT 0,
    max_supply BIGINT,
    current_supply BIGINT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty transactions table
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mint', 'redeem')),
    amount INTEGER NOT NULL,
    transaction_hash TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    deal_details TEXT,
    type TEXT DEFAULT 'event' CHECK (type IN ('event', 'deal')),
    max_attendees INTEGER,
    token_reward INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User events table (for RSVPs)
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'not_attending', 'maybe')),
    rsvp_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, event_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_businesses_owner_wallet ON businesses(owner_wallet);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_tokens_business_id ON tokens(business_id);
CREATE INDEX idx_tokens_contract_address ON tokens(contract_address);
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_business_id ON loyalty_transactions(business_id);
CREATE INDEX idx_loyalty_transactions_token_id ON loyalty_transactions(token_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_events_business_id ON events(business_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_event_id ON user_events(event_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = wallet_address);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = wallet_address);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

-- Businesses are publicly readable, but only owners can modify
CREATE POLICY "Businesses are publicly readable" ON businesses FOR SELECT USING (status = 'active');
CREATE POLICY "Business owners can modify their businesses" ON businesses FOR ALL USING (auth.uid()::text = owner_wallet);

-- Tokens are publicly readable
CREATE POLICY "Tokens are publicly readable" ON tokens FOR SELECT USING (status = 'active');
CREATE POLICY "Business owners can manage their tokens" ON tokens FOR ALL USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = tokens.business_id 
        AND businesses.owner_wallet = auth.uid()::text
    )
);

-- Loyalty transactions are readable by users and business owners
CREATE POLICY "Users can view their own transactions" ON loyalty_transactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = loyalty_transactions.user_id 
        AND users.wallet_address = auth.uid()::text
    )
);
CREATE POLICY "Business owners can view their business transactions" ON loyalty_transactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = loyalty_transactions.business_id 
        AND businesses.owner_wallet = auth.uid()::text
    )
);

-- Events are publicly readable
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (status = 'active');
CREATE POLICY "Business owners can manage their events" ON events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = events.business_id 
        AND businesses.owner_wallet = auth.uid()::text
    )
);

-- User events are readable by users and event business owners
CREATE POLICY "Users can manage their own event RSVPs" ON user_events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = user_events.user_id 
        AND users.wallet_address = auth.uid()::text
    )
);
CREATE POLICY "Business owners can view event RSVPs" ON user_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM events 
        JOIN businesses ON businesses.id = events.business_id
        WHERE events.id = user_events.event_id 
        AND businesses.owner_wallet = auth.uid()::text
    )
);

-- Insert some sample data for development
INSERT INTO businesses (name, description, location, category, owner_wallet, status) VALUES
('Brew & Bean Coffee', 'Artisan coffee roasted daily with locally sourced beans', '123 Main St, Downtown', 'Coffee & Tea', '0x1234567890abcdef', 'active'),
('Mario''s Pizza Palace', 'Authentic Italian pizza made with fresh ingredients', '456 Oak Ave, Little Italy', 'Restaurant', '0x2345678901bcdef0', 'active'),
('Page Turner Books', 'Independent bookstore with curated selection and cozy reading nooks', '789 Elm St, Arts District', 'Books & Media', '0x3456789012cdef01', 'active'),
('Green Garden Market', 'Organic produce and sustainable goods from local farmers', '321 Pine St, Green District', 'Grocery', '0x4567890123def012', 'active');

-- Insert sample tokens
INSERT INTO tokens (business_id, name, symbol, contract_address, redemption_value, token_value) 
SELECT 
    b.id,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 'Coffee Bean Token'
        WHEN b.name = 'Mario''s Pizza Palace' THEN 'Pizza Point'
        WHEN b.name = 'Page Turner Books' THEN 'Bookstore Reward'
        WHEN b.name = 'Green Garden Market' THEN 'Garden Token'
    END,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 'CBT'
        WHEN b.name = 'Mario''s Pizza Palace' THEN 'PPT'
        WHEN b.name = 'Page Turner Books' THEN 'BSR'
        WHEN b.name = 'Green Garden Market' THEN 'GGT'
    END,
    '0x' || substr(md5(b.name), 1, 40),
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 'Free coffee after 10 tokens'
        WHEN b.name = 'Mario''s Pizza Palace' THEN '20% off next order'
        WHEN b.name = 'Page Turner Books' THEN '$5 off books over $25'
        WHEN b.name = 'Green Garden Market' THEN '10% off organic produce'
    END,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 0.50
        WHEN b.name = 'Mario''s Pizza Palace' THEN 1.00
        WHEN b.name = 'Page Turner Books' THEN 2.00
        WHEN b.name = 'Green Garden Market' THEN 0.75
    END
FROM businesses b;

-- Insert sample events
INSERT INTO events (business_id, title, description, start_time, end_time, location, deal_details, type, token_reward)
SELECT 
    b.id,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 'Happy Hour Coffee'
        WHEN b.name = 'Mario''s Pizza Palace' THEN 'Pizza Making Workshop'
        WHEN b.name = 'Page Turner Books' THEN 'Book Club Meeting'
        WHEN b.name = 'Green Garden Market' THEN 'Farmers Market Special'
    END,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN '50% off all specialty drinks from 3-5 PM'
        WHEN b.name = 'Mario''s Pizza Palace' THEN 'Learn to make authentic Italian pizza with our head chef'
        WHEN b.name = 'Page Turner Books' THEN 'Monthly discussion of "The Seven Husbands of Evelyn Hugo"'
        WHEN b.name = 'Green Garden Market' THEN 'Fresh winter produce and seasonal items'
    END,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
    b.location,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 'Double tokens on all purchases during happy hour'
        WHEN b.name = 'Mario''s Pizza Palace' THEN 'Participants receive 20 bonus tokens'
        WHEN b.name = 'Page Turner Books' THEN '15% off featured book for attendees'
        WHEN b.name = 'Green Garden Market' THEN 'Triple tokens on all organic purchases'
    END,
    CASE 
        WHEN b.name IN ('Brew & Bean Coffee', 'Green Garden Market') THEN 'deal'
        ELSE 'event'
    END,
    CASE 
        WHEN b.name = 'Brew & Bean Coffee' THEN 5
        WHEN b.name = 'Mario''s Pizza Palace' THEN 20
        WHEN b.name = 'Page Turner Books' THEN 10
        WHEN b.name = 'Green Garden Market' THEN 15
    END
FROM businesses b;
