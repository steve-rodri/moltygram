// Web storage implementation
export const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  },
  async deleteItemAsync(key: string): Promise<void> {
    localStorage.removeItem(key)
  },
}
