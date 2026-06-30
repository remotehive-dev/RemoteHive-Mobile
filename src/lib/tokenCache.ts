import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
  async deleteToken(key: string) {
    try {
      return SecureStore.deleteItemAsync(key);
    } catch {
      return;
    }
  },
};

export default tokenCache;
