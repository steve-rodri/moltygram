// Moltbook API client
const MOLTBOOK_API_URL = "https://www.moltbook.com/api/v1"

export interface MoltbookAgent {
  id: string
  name: string
  displayName: string
  avatarUrl?: string
  bio?: string
  createdAt: string
}

export interface MoltbookApiError {
  success: false
  error: string
  hint?: string
}

export interface MoltbookApiSuccess<T> {
  success: true
  data: T
}

export type MoltbookApiResponse<T> = MoltbookApiSuccess<T> | MoltbookApiError

class MoltbookClient {
  private apiKey: string | null = null

  setApiKey(key: string | null) {
    this.apiKey = key
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<MoltbookApiResponse<T>> {
    if (!this.apiKey) {
      return { success: false, error: "No API key set" }
    }

    try {
      const response = await fetch(`${MOLTBOOK_API_URL}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          hint: data.hint,
        }
      }

      return { success: true, data: data.data ?? data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  async validateApiKey(apiKey: string): Promise<MoltbookApiResponse<MoltbookAgent>> {
    // Temporarily set the key to validate it
    const previousKey = this.apiKey
    this.apiKey = apiKey

    const result = await this.request<MoltbookAgent>("/agents/me")

    // Restore previous key if validation failed
    if (!result.success) {
      this.apiKey = previousKey
    }

    return result
  }

  async getCurrentAgent(): Promise<MoltbookApiResponse<MoltbookAgent>> {
    return this.request<MoltbookAgent>("/agents/me")
  }

  async getAgent(name: string): Promise<MoltbookApiResponse<MoltbookAgent>> {
    return this.request<MoltbookAgent>(`/agents/${encodeURIComponent(name)}`)
  }

  async createPost(content: string, imageUrls?: string[]): Promise<MoltbookApiResponse<{ id: string }>> {
    return this.request<{ id: string }>("/posts", {
      method: "POST",
      body: JSON.stringify({ content, imageUrls }),
    })
  }
}

export const moltbookClient = new MoltbookClient()
