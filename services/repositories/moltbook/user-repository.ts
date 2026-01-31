import {
  Profile,
  ProfileUpdate,
  UserRepository,
  UserSettings,
} from "../types"

import { moltbookClient, MoltbookAgent } from "./client"

function mapAgentToProfile(agent: MoltbookAgent): Profile {
  return {
    id: agent.id,
    handle: agent.name,
    name: agent.displayName || agent.name,
    pronouns: undefined,
    bio: agent.bio,
    avatarUrl: agent.avatarUrl,
    avatarTransform: undefined,
    coverPhotoUrl: undefined,
    coverPhotoTransform: undefined,
    isPrivate: false, // Agents are public by default
    followerCount: 0, // TODO: fetch from Moltbook when available
    followingCount: 0,
    createdAt: agent.createdAt,
  }
}

// Default settings for agents
const defaultSettings: UserSettings = {
  notificationLikes: true,
  notificationComments: true,
  notificationFollows: true,
  notificationMentions: true,
  screenTimeLimit: 0,
}

export const userRepository: UserRepository = {
  async getProfile(userId: string): Promise<Profile | null> {
    // First try to get current agent if the userId matches
    const currentAgent = await moltbookClient.getCurrentAgent()
    if (currentAgent.success && currentAgent.data.id === userId) {
      return mapAgentToProfile(currentAgent.data)
    }

    // TODO: Moltbook API needs an endpoint to get agent by ID
    // For now, return null for other users
    return null
  },

  async getProfileByHandle(handle: string): Promise<Profile | null> {
    const result = await moltbookClient.getAgent(handle)
    if (!result.success) {
      return null
    }
    return mapAgentToProfile(result.data)
  },

  async createProfile(_userId: string, _data: ProfileUpdate): Promise<Profile> {
    // Profiles are created on Moltbook.com, not in the app
    throw new Error("Profiles are created on moltbook.com")
  },

  async updateProfile(_userId: string, _updates: ProfileUpdate): Promise<Profile> {
    // TODO: Moltbook API needs profile update endpoint
    throw new Error("Profile updates coming soon - manage your profile at moltbook.com for now")
  },

  async getSettings(_userId: string): Promise<UserSettings> {
    // TODO: Store settings locally or on Moltbook
    return defaultSettings
  },

  async updateSettings(
    _userId: string,
    _updates: Partial<UserSettings>,
  ): Promise<UserSettings> {
    // TODO: Store settings locally or on Moltbook
    return defaultSettings
  },

  async searchUsers(_query: string, _limit?: number): Promise<Profile[]> {
    // TODO: Moltbook API needs search endpoint
    return []
  },

  async checkHandleAvailable(_handle: string): Promise<boolean> {
    // Handles are managed on Moltbook.com
    return false
  },
}
