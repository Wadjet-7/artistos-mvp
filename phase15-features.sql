-- Phase 15: Notification preferences column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"commissions":true,"invoices":true,"contracts":true,"analytics_digest":true,"marketplace":true,"product_updates":false}';
