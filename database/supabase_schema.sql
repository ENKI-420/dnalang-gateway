-- DNALang Gateway - AURA Multi-Agent System
-- Supabase Database Schema
-- Σₛ = dna::}{::lang
-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

-- ==========================================
-- Sessions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS aura_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL DEFAULT 'aura_chat',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_sessions_user_id ON aura_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_aura_sessions_status ON aura_sessions(status);
CREATE INDEX IF NOT EXISTS idx_aura_sessions_created_at ON aura_sessions(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE aura_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
    ON aura_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
    ON aura_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON aura_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
    ON aura_sessions FOR DELETE
    USING (auth.uid() = user_id);


-- ==========================================
-- Messages Table
-- ==========================================

CREATE TABLE IF NOT EXISTS aura_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES aura_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'agent')),
    content TEXT NOT NULL,
    agent_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_messages_session_id ON aura_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_aura_messages_created_at ON aura_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aura_messages_role ON aura_messages(role);
CREATE INDEX IF NOT EXISTS idx_aura_messages_agent_id ON aura_messages(agent_id);

-- RLS
ALTER TABLE aura_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their sessions"
    ON aura_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM aura_sessions
            WHERE aura_sessions.id = aura_messages.session_id
            AND aura_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their sessions"
    ON aura_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM aura_sessions
            WHERE aura_sessions.id = aura_messages.session_id
            AND aura_sessions.user_id = auth.uid()
        )
    );


-- ==========================================
-- Agent States Table
-- ==========================================

CREATE TABLE IF NOT EXISTS aura_agent_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES aura_sessions(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('architect', 'engineer', 'reviewer', 'debugger', 'research', 'synthesizer')),
    state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, agent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_agent_states_session_id ON aura_agent_states(session_id);
CREATE INDEX IF NOT EXISTS idx_aura_agent_states_agent_type ON aura_agent_states(agent_type);

-- RLS
ALTER TABLE aura_agent_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent states in their sessions"
    ON aura_agent_states FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM aura_sessions
            WHERE aura_sessions.id = aura_agent_states.session_id
            AND aura_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage agent states"
    ON aura_agent_states FOR ALL
    USING (auth.role() = 'service_role');


-- ==========================================
-- Usage Tracking Table
-- ==========================================

CREATE TABLE IF NOT EXISTS aura_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES aura_sessions(id) ON DELETE SET NULL,
    usage_type VARCHAR(50) NOT NULL CHECK (usage_type IN ('agent_call', 'quantum_exec', 'message', 'autopilot_step')),
    quantity INTEGER NOT NULL DEFAULT 1,
    cost_credits DECIMAL(10, 4) DEFAULT 0.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_usage_user_id ON aura_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_aura_usage_session_id ON aura_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_aura_usage_type ON aura_usage(usage_type);
CREATE INDEX IF NOT EXISTS idx_aura_usage_created_at ON aura_usage(created_at DESC);

-- RLS
ALTER TABLE aura_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
    ON aura_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
    ON aura_usage FOR ALL
    USING (auth.role() = 'service_role');


-- ==========================================
-- AutoPilot Sequences Table
-- ==========================================

CREATE TABLE IF NOT EXISTS aura_autopilot_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES aura_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    current_step INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    results JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_autopilot_session_id ON aura_autopilot_sequences(session_id);
CREATE INDEX IF NOT EXISTS idx_aura_autopilot_status ON aura_autopilot_sequences(status);

-- RLS
ALTER TABLE aura_autopilot_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view autopilot sequences in their sessions"
    ON aura_autopilot_sequences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM aura_sessions
            WHERE aura_sessions.id = aura_autopilot_sequences.session_id
            AND aura_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage autopilot sequences"
    ON aura_autopilot_sequences FOR ALL
    USING (auth.role() = 'service_role');


-- ==========================================
-- Update Trigger for updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_aura_sessions_updated_at
    BEFORE UPDATE ON aura_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aura_agent_states_updated_at
    BEFORE UPDATE ON aura_agent_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aura_autopilot_sequences_updated_at
    BEFORE UPDATE ON aura_autopilot_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- Views for Analytics
-- ==========================================

CREATE OR REPLACE VIEW aura_usage_summary AS
SELECT
    user_id,
    usage_type,
    DATE_TRUNC('day', created_at) as usage_date,
    SUM(quantity) as total_quantity,
    SUM(cost_credits) as total_credits,
    COUNT(*) as usage_count
FROM aura_usage
GROUP BY user_id, usage_type, DATE_TRUNC('day', created_at);


CREATE OR REPLACE VIEW aura_session_stats AS
SELECT
    user_id,
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE status = 'active') as active_sessions,
    COUNT(*) FILTER (WHERE status = 'ended') as ended_sessions,
    AVG(EXTRACT(EPOCH FROM (ended_at - created_at))) as avg_session_duration_seconds
FROM aura_sessions
GROUP BY user_id;


-- ==========================================
-- Sample Data (Optional - for development)
-- ==========================================

-- Uncomment to insert sample test user data
-- INSERT INTO auth.users (id, email) VALUES
--     ('00000000-0000-0000-0000-000000000001', 'test@dnalang.dev')
-- ON CONFLICT DO NOTHING;

-- INSERT INTO aura_sessions (id, user_id, session_type, status) VALUES
--     ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'aura_chat', 'active')
-- ON CONFLICT DO NOTHING;
