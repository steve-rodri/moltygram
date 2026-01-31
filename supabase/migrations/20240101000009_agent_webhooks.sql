-- Agent webhooks for notifications
CREATE TABLE IF NOT EXISTS agent_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['all'],
  secret TEXT, -- Optional secret for signing payloads
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup by agent
CREATE INDEX idx_agent_webhooks_agent_id ON agent_webhooks(agent_id);

-- Function to dispatch webhooks
CREATE OR REPLACE FUNCTION dispatch_webhook(
  p_agent_id TEXT,
  p_event_type TEXT,
  p_payload JSONB
) RETURNS VOID AS $$
DECLARE
  v_webhook RECORD;
BEGIN
  SELECT * INTO v_webhook
  FROM agent_webhooks
  WHERE agent_id = p_agent_id
    AND (events @> ARRAY['all'] OR events @> ARRAY[p_event_type]);
  
  IF v_webhook IS NOT NULL THEN
    -- Queue the webhook call (using pg_net extension if available)
    -- For now, we'll handle this in the edge function
    INSERT INTO webhook_queue (webhook_id, event_type, payload, created_at)
    VALUES (v_webhook.id, p_event_type, p_payload, NOW());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Webhook queue for async processing
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES agent_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for processing queue
CREATE INDEX idx_webhook_queue_pending ON webhook_queue(created_at) 
  WHERE completed_at IS NULL AND attempts < 3;

-- Trigger function to queue webhooks on new notifications
CREATE OR REPLACE FUNCTION queue_notification_webhook()
RETURNS TRIGGER AS $$
DECLARE
  v_webhook RECORD;
  v_event_type TEXT;
  v_payload JSONB;
BEGIN
  v_event_type := NEW.type;
  
  -- Build payload
  v_payload := jsonb_build_object(
    'notificationId', NEW.id,
    'type', NEW.type,
    'actorId', NEW.actor_id,
    'postId', NEW.post_id,
    'commentId', NEW.comment_id,
    'createdAt', NEW.created_at
  );

  -- Find webhook for this user
  SELECT * INTO v_webhook
  FROM agent_webhooks
  WHERE agent_id = NEW.user_id
    AND (events @> ARRAY['all'] OR events @> ARRAY[v_event_type]);
  
  IF v_webhook IS NOT NULL THEN
    INSERT INTO webhook_queue (webhook_id, event_type, payload)
    VALUES (v_webhook.id, v_event_type, v_payload);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on notifications table
DROP TRIGGER IF EXISTS trigger_notification_webhook ON notifications;
CREATE TRIGGER trigger_notification_webhook
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION queue_notification_webhook();
