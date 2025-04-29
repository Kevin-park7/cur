-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE,
    confirmation_token TEXT,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    recovery_token TEXT,
    recovery_sent_at TIMESTAMP WITH TIME ZONE,
    email_change_token TEXT,
    email_change TEXT,
    email_change_sent_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    raw_app_meta_data JSONB DEFAULT '{}'::jsonb,
    raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    phone TEXT UNIQUE,
    phone_confirmed_at TIMESTAMP WITH TIME ZONE,
    phone_change TEXT,
    phone_change_token TEXT,
    phone_change_sent_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    email_change_confirm_status SMALLINT DEFAULT 0,
    banned_until TIMESTAMP WITH TIME ZONE,
    reauthentication_token TEXT,
    reauthentication_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    factor_id UUID,
    aal AUTHENTICATION_LEVEL,
    not_after TIMESTAMP WITH TIME ZONE
);

-- Create identities table
CREATE TABLE IF NOT EXISTS auth.identities (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    identity_data JSONB NOT NULL,
    provider TEXT NOT NULL,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    token TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    parent TEXT,
    session_id UUID REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- Create mfa_factors table
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friendly_name TEXT,
    factor_type TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    secret TEXT
);

-- Create mfa_challenges table
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factor_id UUID NOT NULL REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    ip_address INET
);

-- Create audit_log_entries table
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payload JSONB
);

-- Create flow_state table
CREATE TABLE IF NOT EXISTS auth.flow_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    auth_code TEXT NOT NULL,
    code_challenge_method TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    provider_access_token TEXT,
    provider_refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    authentication_method TEXT NOT NULL
);

-- Create sso_providers table
CREATE TABLE IF NOT EXISTS auth.sso_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sso_domains table
CREATE TABLE IF NOT EXISTS auth.sso_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sso_provider_id UUID NOT NULL REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

-- Create functions
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON auth.sessions
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_identities_updated_at
    BEFORE UPDATE ON auth.identities
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_refresh_tokens_updated_at
    BEFORE UPDATE ON auth.refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_mfa_factors_updated_at
    BEFORE UPDATE ON auth.mfa_factors
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_flow_state_updated_at
    BEFORE UPDATE ON auth.flow_state
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_sso_providers_updated_at
    BEFORE UPDATE ON auth.sso_providers
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_sso_domains_updated_at
    BEFORE UPDATE ON auth.sso_domains
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at_column();

-- Create RLS policies for auth tables
CREATE POLICY "Users can view their own data"
    ON auth.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON auth.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own sessions"
    ON auth.sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON auth.sessions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own identities"
    ON auth.identities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own refresh tokens"
    ON auth.refresh_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own refresh tokens"
    ON auth.refresh_tokens FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mfa factors"
    ON auth.mfa_factors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mfa factors"
    ON auth.mfa_factors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mfa factors"
    ON auth.mfa_factors FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mfa challenges"
    ON auth.mfa_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own audit logs"
    ON auth.audit_log_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own flow state"
    ON auth.flow_state FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow state"
    ON auth.flow_state FOR DELETE
    USING (auth.uid() = user_id); 