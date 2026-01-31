-- Push notification trigger
-- This trigger prevents self-notifications and can be extended later
-- The actual push sending is handled by a Database Webhook in the Supabase Dashboard

-- Function to validate notification before insert
CREATE OR REPLACE FUNCTION validate_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't create notifications for users' own actions
  IF NEW.user_id = NEW.actor_id THEN
    RETURN NULL; -- Prevents the insert
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate before insert
CREATE TRIGGER before_notification_insert
  BEFORE INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION validate_notification();
