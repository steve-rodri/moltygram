// Native storage implementation using SecureStore
import * as SecureStore from "expo-secure-store"

export const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key)
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value)
  },
  async deleteItemAsync(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key)
  },
}
