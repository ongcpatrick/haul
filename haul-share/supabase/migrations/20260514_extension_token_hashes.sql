-- Rotate extension tokens into hashed storage.
-- Existing plaintext tokens cannot be safely migrated; users should reconnect the extension.

DROP INDEX IF EXISTS idx_extension_tokens_token;

ALTER TABLE extension_tokens
  DROP CONSTRAINT IF EXISTS extension_tokens_token_key;

ALTER TABLE extension_tokens
  DROP COLUMN IF EXISTS token;

ALTER TABLE extension_tokens
  ADD COLUMN IF NOT EXISTS token_hash CHAR(64);

DELETE FROM extension_tokens WHERE token_hash IS NULL;

ALTER TABLE extension_tokens
  ALTER COLUMN token_hash SET NOT NULL;

ALTER TABLE extension_tokens
  ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '7 days');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'extension_tokens_token_hash_key'
  ) THEN
    ALTER TABLE extension_tokens
      ADD CONSTRAINT extension_tokens_token_hash_key UNIQUE (token_hash);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_extension_tokens_token_hash ON extension_tokens(token_hash);
