// Chrome storage helpers for Haul product saves.

const STORAGE_KEY = 'haul_products';

const StorageErrorCode = {
  GET_FAILED: 'GET_FAILED',
  SET_FAILED: 'SET_FAILED',
  REMOVE_FAILED: 'REMOVE_FAILED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
};

class StorageError extends Error {
  constructor(message, code, originalError) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    if (originalError?.stack) this.stack = originalError.stack;
  }
}

class Storage {
  async get(key, defaultValue) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? defaultValue;
    } catch (err) {
      throw new StorageError(
        `Failed to read "${key}" from chrome.storage.local: ${err.message}. Check storage permission.`,
        StorageErrorCode.GET_FAILED,
        err
      );
    }
  }

  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (err) {
      const isQuota = err.message?.includes('QUOTA_BYTES') || err.message?.includes('quota');
      throw new StorageError(
        isQuota
          ? `Storage quota exceeded writing "${key}". Remove old saves to free space.`
          : `Failed to write "${key}" to chrome.storage.local: ${err.message}`,
        isQuota ? StorageErrorCode.QUOTA_EXCEEDED : StorageErrorCode.SET_FAILED,
        err
      );
    }
  }

  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
    } catch (err) {
      throw new StorageError(
        `Failed to remove "${key}" from chrome.storage.local: ${err.message}`,
        StorageErrorCode.REMOVE_FAILED,
        err
      );
    }
  }
}

const _storage = new Storage();

async function getProducts() {
  return _storage.get(STORAGE_KEY, []);
}

async function saveProduct(product) {
  const products = await getProducts();
  const updated = [product, ...products];
  await _storage.set(STORAGE_KEY, updated);
  return updated;
}

async function removeProduct(id) {
  const products = await getProducts();
  const updated = products.filter((p) => p.id !== id);
  await _storage.set(STORAGE_KEY, updated);
  return updated;
}

async function clearAll() {
  await _storage.set(STORAGE_KEY, []);
}
