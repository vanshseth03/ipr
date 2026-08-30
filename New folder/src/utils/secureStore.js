import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const inMemoryStore = new Map();

export async function isSecureStoreAvailable() {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getSecureItem(key) {
  try {
    if (await isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.warn(`[SecureStore] getItem error for ${key}:`, error.message);
  }
  return inMemoryStore.get(key) ?? null;
}

export async function setSecureItem(key, value) {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, String(value));
      return;
    }
  } catch (error) {
    console.warn(`[SecureStore] setItem error for ${key}:`, error.message);
  }
  inMemoryStore.set(key, String(value));
}

export async function deleteSecureItem(key) {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch (error) {
    console.warn(`[SecureStore] deleteItem error for ${key}:`, error.message);
  }
  inMemoryStore.delete(key);
}
