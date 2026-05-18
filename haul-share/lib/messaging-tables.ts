import sql from './db';

let migrated = false;

export async function ensureMessagingTables(): Promise<void> {
  if (migrated) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type       TEXT NOT NULL CHECK (type IN ('direct', 'group')),
        name       TEXT,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (conversation_id, user_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body            TEXT,
        haul_id         UUID REFERENCES hauls(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conv_time ON messages(conversation_id, created_at ASC)`;
    migrated = true;
  } catch {
    // Tables may already exist or DB may be unavailable — proceed and let the caller handle errors
  }
}
