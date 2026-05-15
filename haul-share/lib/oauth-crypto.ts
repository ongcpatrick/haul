import { createCipheriv, createDecipheriv, createHash, createSign, randomBytes } from 'crypto';

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

// ── Apple client secret (ES256-signed JWT) ───────────────────────────────────
// Apple requires a fresh JWT as the client_secret on every token exchange.
// Env vars: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_SERVICE_ID, APPLE_PRIVATE_KEY
// The private key is the raw content of the .p8 file (newlines as \n in env).
export function generateAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const serviceId = process.env.APPLE_SERVICE_ID;
  const rawKey = process.env.APPLE_PRIVATE_KEY;
  if (!teamId || !keyId || !serviceId || !rawKey) {
    throw new Error('Apple OAuth not configured — set APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_SERVICE_ID, APPLE_PRIVATE_KEY');
  }
  const privateKey = rawKey.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 15_777_000, // ~6 months max
    aud: 'https://appleid.apple.com',
    sub: serviceId,
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signer = createSign('SHA256');
  signer.update(data);
  // dsaEncoding: 'ieee-p1363' gives raw r||s signature (required for ES256 JWTs)
  const sig = signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return `${data}.${sig}`;
}

// Decode Apple's id_token payload (no need to verify sig — we received it directly from Apple)
export function decodeAppleIdToken(idToken: string): { sub: string; email?: string } {
  const parts = idToken.split('.');
  if (parts.length < 2) throw new Error('Invalid id_token');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { sub: string; email?: string };
  return payload;
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
export function stateCookieOpts(name: string, value: string): string {
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`;
}

export function clearCookie(name: string): string {
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
