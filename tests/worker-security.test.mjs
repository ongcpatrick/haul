import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hashSecret,
  isAllowedProxyUrl,
  sanitizeProduct,
  sanitizeProducts,
} from '../haul-worker/security.mjs';

test('sanitizeProduct keeps safe product fields and strips unsafe URLs', () => {
  const product = sanitizeProduct({
    id: 'abc123',
    name: '  Great Jacket  ',
    price: '49.99',
    originalPrice: 79.99,
    imageUrl: 'javascript:alert(1)',
    sourceUrl: 'https://example.com/product?sku=1',
    siteName: 'Example Shop',
    category: 'Clothing',
    folderId: ['one', 'two', '<bad>'],
  });

  assert.equal(product.name, 'Great Jacket');
  assert.equal(product.price, 49.99);
  assert.equal(product.originalPrice, 79.99);
  assert.equal(product.imageUrl, null);
  assert.equal(product.sourceUrl, 'https://example.com/product?sku=1');
  assert.equal(product.category, 'Clothing');
  assert.deepEqual(product.folderId, ['one', 'two', 'bad']);
});

test('sanitizeProducts rejects empty, invalid, and oversized payloads', () => {
  assert.throws(() => sanitizeProducts([], { maxCount: 2 }), /at least one product/i);
  assert.throws(() => sanitizeProducts([{ id: '1', price: 10 }], { maxCount: 2 }), /product name/i);
  assert.throws(
    () => sanitizeProducts([
      { id: '1', name: 'One' },
      { id: '2', name: 'Two' },
      { id: '3', name: 'Three' },
    ], { maxCount: 2 }),
    /too many products/i,
  );
});

test('isAllowedProxyUrl blocks SSRF-prone and non-image proxy targets', () => {
  assert.equal(isAllowedProxyUrl('http://example.com/image.jpg'), false);
  assert.equal(isAllowedProxyUrl('https://localhost/image.jpg'), false);
  assert.equal(isAllowedProxyUrl('https://127.0.0.1/image.jpg'), false);
  assert.equal(isAllowedProxyUrl('https://10.0.0.1/image.jpg'), false);
  assert.equal(isAllowedProxyUrl('https://shop.example.com/image.jpg'), true);
});

test('hashSecret is deterministic and does not expose the raw token', async () => {
  const first = await hashSecret('secret-token');
  const second = await hashSecret('secret-token');

  assert.equal(first, second);
  assert.notEqual(first, 'secret-token');
  assert.match(first, /^[a-f0-9]{64}$/);
});
