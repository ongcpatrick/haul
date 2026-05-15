-- Add 'apple' to the social_connections platform constraint.
-- Run this if you applied the initial 20260514_social_community.sql already.
ALTER TABLE social_connections
  DROP CONSTRAINT IF EXISTS social_connections_platform_check;

ALTER TABLE social_connections
  ADD CONSTRAINT social_connections_platform_check
  CHECK (platform IN ('facebook', 'twitter', 'instagram', 'apple'));
