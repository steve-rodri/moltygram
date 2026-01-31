-- Push notification tokens table
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Index for efficient lookups by user
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

-- RLS policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push tokens
CREATE POLICY "Users can insert own push tokens"
  ON push_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own push tokens"
  ON push_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON push_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can read all tokens (for sending notifications)
CREATE POLICY "Service role can read all push tokens"
  ON push_tokens FOR SELECT
  TO service_role
  USING (true);
