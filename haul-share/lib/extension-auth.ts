import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import sql from './db';

const TOKEN_BYTES = 32;

export function createExtensionToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

export function hashExtensionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isExtensionTokenShape(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token);
}

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function getUserIdFromExtensionToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  if (!isExtensionTokenShape(token)) return null;

  const tokenHash = hashExtensionToken(token);
  const [row] = await sql<{ user_id: string; token_hash: string }[]>`
    SELECT user_id, token_hash FROM extension_tokens
    WHERE token_hash = ${tokenHash} AND expires_at > now()
    LIMIT 1
  `;

  if (!row || !constantTimeEquals(row.token_hash.trim(), tokenHash)) return null;
  return row.user_id;
}
