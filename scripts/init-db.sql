-- ============================================================================
-- Events Database Initialization Script
-- ============================================================================
-- This script sets up the PostgreSQL database with necessary schemas,
-- extensions, and initial configuration for the events-stepperslife app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS files;

-- Set search path
ALTER DATABASE events_db SET search_path TO public, auth, events, payments, files;

-- ============================================================================
-- Auth Schema Tables (NextAuth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(255),
    scope TEXT,
    id_token TEXT,
    session_state VARCHAR(255),
    oauth_token_secret TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    image TEXT,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================================================
-- Events Schema Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS events.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    venue_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    event_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    capacity INT,
    ticket_price DECIMAL(10, 2),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events.ticket_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events.events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity_available INT,
    quantity_sold INT DEFAULT 0,
    position INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events.events(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES events.ticket_tiers(id),
    user_id UUID REFERENCES auth.users(id),
    ticket_number VARCHAR(50) UNIQUE,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'valid',
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events.bundle_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_id UUID NOT NULL REFERENCES events.events(id),
    bundle_type VARCHAR(100),
    quantity INT DEFAULT 1,
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Payments Schema Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_id UUID REFERENCES events.events(id),
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES payments.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    method VARCHAR(50),
    payment_provider VARCHAR(50),
    provider_transaction_id VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments.payments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reason VARCHAR(255),
    provider_refund_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Files Schema Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS files.uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    bucket VARCHAR(100),
    upload_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_provider ON auth.accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

CREATE INDEX IF NOT EXISTS idx_events_date ON events.events(date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events.events(city, state);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events.events(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id ON events.ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON events.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON events.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_user_id ON events.bundle_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_event_id ON events.bundle_purchases(event_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON payments.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON payments.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON payments.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments.payments(status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON payments.refunds(payment_id);

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON files.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_bucket ON files.uploads(bucket);

-- ============================================================================
-- Create Views for Common Queries
-- ============================================================================

CREATE OR REPLACE VIEW events.upcoming_events AS
SELECT e.* FROM events.events e
WHERE e.date > CURRENT_TIMESTAMP AND e.status = 'active'
ORDER BY e.date ASC;

CREATE OR REPLACE VIEW events.user_tickets AS
SELECT t.*, e.name as event_name, e.date as event_date, tt.price
FROM events.tickets t
JOIN events.events e ON t.event_id = e.id
LEFT JOIN events.ticket_tiers tt ON t.tier_id = tt.id
ORDER BY e.date DESC;

-- ============================================================================
-- Create Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Triggers
-- ============================================================================

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION auth.update_timestamp();

CREATE TRIGGER update_accounts_timestamp BEFORE UPDATE ON auth.accounts
FOR EACH ROW EXECUTE FUNCTION auth.update_timestamp();

CREATE TRIGGER update_sessions_timestamp BEFORE UPDATE ON auth.sessions
FOR EACH ROW EXECUTE FUNCTION auth.update_timestamp();

CREATE TRIGGER update_events_timestamp BEFORE UPDATE ON events.events
FOR EACH ROW EXECUTE FUNCTION auth.update_timestamp();

CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON payments.orders
FOR EACH ROW EXECUTE FUNCTION auth.update_timestamp();

CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON payments.payments
FOR EACH ROW EXECUTE FUNCTION auth.update_timestamp();

-- ============================================================================
-- Initial Data (Optional - Comment out if not needed)
-- ============================================================================

-- Create a test event
INSERT INTO events.events (name, description, date, city, state, venue_name, event_type, status)
VALUES (
    'Test Chicago Steppin Event',
    'Welcome to the test event for Chicago Steppin!',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    'Chicago',
    'IL',
    'Test Venue',
    'TICKETED_EVENT',
    'active'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Grants (if using database user other than postgres)
-- ============================================================================

-- Uncomment and modify if you need specific user grants
-- GRANT USAGE ON SCHEMA public, auth, events, payments, files TO eventuser;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public, auth, events, payments, files TO eventuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public, auth, events, payments, files TO eventuser;

GRANT ALL PRIVILEGES ON DATABASE events_db TO eventuser;
