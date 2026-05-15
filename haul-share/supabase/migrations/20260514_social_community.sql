-- Social OAuth connections (tokens stored AES-256-GCM encrypted)
CREATE TABLE IF NOT EXISTS social_connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform            TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram')),
  platform_user_id    TEXT NOT NULL,
  platform_username   TEXT,
  encrypted_token     TEXT,
  -- platform_friend_ids: list of platform-side friend IDs (for mutual matching)
  platform_friend_ids JSONB NOT NULL DEFAULT '[]',
  connected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, platform),
  UNIQUE (platform, platform_user_id)
);
CREATE INDEX IF NOT EXISTS idx_social_conn_user ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_conn_platform ON social_connections(platform, platform_user_id);

-- Privacy + branding columns for circles (Facebook Group feel)
ALTER TABLE circles ADD COLUMN IF NOT EXISTS is_private     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE circles ADD COLUMN IF NOT EXISTS cover_color    TEXT    NOT NULL DEFAULT '#6366f1';
ALTER TABLE circles ADD COLUMN IF NOT EXISTS member_count   INT     NOT NULL DEFAULT 0;

-- Join requests for private circles
CREATE TABLE IF NOT EXISTS circle_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id  UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (circle_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_circle_requests_circle ON circle_requests(circle_id, status);
CREATE INDEX IF NOT EXISTS idx_circle_requests_user   ON circle_requests(user_id);

-- Materialise member_count via trigger so list queries stay fast
CREATE OR REPLACE FUNCTION update_circle_member_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE circles SET member_count = member_count + 1 WHERE id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE circles SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.circle_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_member_count ON circle_members;
CREATE TRIGGER trg_circle_member_count
AFTER INSERT OR DELETE ON circle_members
FOR EACH ROW EXECUTE FUNCTION update_circle_member_count();

-- Backfill existing counts
UPDATE circles c
SET member_count = (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = c.id);
