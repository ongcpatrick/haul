import type { Product } from './types';
import { randomUUID } from 'crypto';

const VALID_CATEGORIES = new Set([
  'Electronics', 'Clothing', 'Footwear', 'Home', 'Beauty',
  'Sports', 'Toys', 'Books', 'Food', 'Other',
]);

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function cleanIdentifier(value: unknown, maxLength: number): string | null {
  return cleanText(value, maxLength)?.replace(/[<>"'`]/g, '') ?? null;
}

function cleanPrice(value: unknown): number | null {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000) return null;
  return Math.round(number * 100) / 100;
}

export function cleanHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function sanitizeProduct(value: unknown): Product | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const name = cleanText(input.name, 240);
  if (!name) return null;

  const folderId = Array.isArray(input.folderId)
    ? input.folderId.map((id) => cleanIdentifier(id, 80)).filter((id): id is string => Boolean(id)).slice(0, 20)
    : undefined;

  return {
    id: cleanIdentifier(input.id, 120) ?? `p_${randomUUID()}`,
    name,
    price: cleanPrice(input.price),
    originalPrice: cleanPrice(input.originalPrice),
    imageUrl: cleanHttpsUrl(input.imageUrl),
    sourceUrl: cleanHttpsUrl(input.sourceUrl),
    siteName: cleanText(input.siteName, 80) ?? '',
    category: typeof input.category === 'string' && VALID_CATEGORIES.has(input.category) ? input.category : null,
    ...(folderId ? { folderId } : {}),
  };
}

export function sanitizeProducts(value: unknown, maxCount = 25): Product[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxCount) return null;
  const products = value.map(sanitizeProduct);
  if (products.some((product) => product === null)) return null;
  return products as Product[];
}

export function cleanTitle(value: unknown): string | null {
  return cleanText(value, 120);
}
