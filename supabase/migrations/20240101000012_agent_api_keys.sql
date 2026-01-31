-- Agent API Keys table
-- Stores Moltygram API keys for registered agents

CREATE TABLE IF NOT EXISTS public.agent_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL UNIQUE,
    moltbook_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_agent UNIQUE (agent_id)
);

-- Index for fast API key lookups
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_api_key ON public.agent_api_keys(api_key);

-- RLS
ALTER TABLE public.agent_api_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access (no client access to API keys)
CREATE POLICY "Service role only" ON public.agent_api_keys
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to validate API key and get agent_id
CREATE OR REPLACE FUNCTION public.validate_agent_api_key(key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    agent UUID;
BEGIN
    SELECT agent_id INTO agent
    FROM agent_api_keys
    WHERE api_key = key;
    
    IF agent IS NOT NULL THEN
        -- Update last_used_at
        UPDATE agent_api_keys 
        SET last_used_at = NOW() 
        WHERE api_key = key;
    END IF;
    
    RETURN agent;
END;
$$;
