-- ============================================================
-- MIGRATION: Add Referrer Tracking Columns to site_events
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Add referrer tracking columns to site_events table
ALTER TABLE site_events
ADD COLUMN IF NOT EXISTS referrer_type text,
ADD COLUMN IF NOT EXISTS referrer_source text,
ADD COLUMN IF NOT EXISTS referrer_domain text;

-- Add index for faster referrer queries
CREATE INDEX IF NOT EXISTS idx_site_events_referrer_type
ON site_events(referrer_type);

CREATE INDEX IF NOT EXISTS idx_site_events_referrer_domain
ON site_events(referrer_domain);

-- Add comment for documentation
COMMENT ON COLUMN site_events.referrer_type IS 'Traffic source type: direct, referral, social, search';
COMMENT ON COLUMN site_events.referrer_source IS 'Source name (e.g., Facebook, google, example.com)';
COMMENT ON COLUMN site_events.referrer_domain IS 'Full referring domain';
