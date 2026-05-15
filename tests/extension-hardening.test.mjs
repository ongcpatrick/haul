import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, projectRoot), 'utf8'));
}

async function readText(path) {
  return readFile(new URL(path, projectRoot), 'utf8');
}

test('extension manifest avoids broad required host access', async () => {
  const manifest = await readJson('haul-extension/manifest.json');
  const hostPermissions = manifest.host_permissions ?? [];
  const contentMatches = (manifest.content_scripts ?? []).flatMap((script) => script.matches ?? []);

  assert.equal(hostPermissions.includes('<all_urls>'), false);
  assert.equal(contentMatches.includes('<all_urls>'), false);
  assert.equal(manifest.web_accessible_resources, undefined);
  assert.ok((manifest.optional_host_permissions ?? []).includes('<all_urls>'));
});

test('privacy policy discloses cloud features instead of promising local-only storage', async () => {
  const privacy = await readText('haul-extension/PRIVACY.md');

  assert.match(privacy, /AI/i);
  assert.match(privacy, /Cloudflare/i);
  assert.match(privacy, /Railway/i);
  assert.match(privacy, /Limited Use/i);
  assert.doesNotMatch(privacy, /data never leaves your device/i);
  assert.doesNotMatch(privacy, /does not transmit any data to external servers/i);
});
