import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

// ── Key management ────────────────────────────────────────────────────────────
// SOCIAL_TOKEN_ENCRYPTION_KEY must be a 64-char lowercase hex string (32 bytes).
// Generate one with: openssl rand -hex 32
function getKey(): Buffer {
  const hex = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY ?? '';
  if (hex.length < 64) {
    // Fallback for dev: derive from a constant. Production MUST set the env var.
    return createHash('sha256').update('haul-dev-key-CHANGE-IN-PROD').digest();
  }
  return Buffer.from(hex.slice(0, 64), 'hex');
}

// ── Token encryption (AES-256-GCM) ───────────────────────────────────────────
export function encryptToken(token: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: [12 iv][16 tag][ciphertext]
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

export function decryptToken(encoded: string): string {
  const key = getKey();
  const buf = Buffer.from(encoded, 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}

// ── CSRF state ────────────────────────────────────────────────────────────────
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

// ── PKCE (required for Twitter OAuth 2.0) ────────────────────────────────────
export function generatePKCEVerifier(): string {
  // 43–128 URL-safe chars
  return randomBytes(48).toString('base64url');
}

export function computePKCEChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
export function stateCookieOpts(name: string, value: string): string {
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`;
}

export function clearCookie(name: string): string {
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
