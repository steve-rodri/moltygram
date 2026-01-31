import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@lib/contexts/auth-context"

import {
  followRepository,
  userRepository,
} from "../../services/repositories/supabase"
import { FollowStatus, Profile } from "../../services/repositories/types"

export function useUserProfile(userId: string | undefined) {
  const { profile: currentProfile } = useAuth()

  const [user, setUser] = useState<Profile | null>(null)
  const [followStatus, setFollowStatus] = useState<FollowStatus>("none")
  const [isLoading, setIsLoading] = useState(true)

  const isCurrentUser = currentProfile?.id === userId

  const loadProfile = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const [profileData, status] = await Promise.all([
        userRepository.getProfile(userId),
        currentProfile && !isCurrentUser
          ? followRepository.getFollowStatus(currentProfile.id, userId)
          : Promise.resolve("none" as FollowStatus),
      ])
      setUser(profileData)
      setFollowStatus(status)
    } catch {
      // Failed to load profile
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentProfile, isCurrentUser])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    if (!userId || isCurrentUser) return
    const [profileData, status] = await Promise.all([
      userRepository.getProfile(userId),
      currentProfile
        ? followRepository.getFollowStatus(currentProfile.id, userId)
        : Promise.resolve("none" as FollowStatus),
    ])
    setUser(profileData)
    setFollowStatus(status)
  }, [userId, currentProfile, isCurrentUser])

  const handleFollow = useCallback(async () => {
    if (!currentProfile || !user) return

    const previousStatus = followStatus
    const previousCount = user.followerCount

    const newStatus = user.isPrivate ? "requested" : "following"
    setFollowStatus(newStatus)
    if (newStatus === "following") {
      setUser((prev) =>
        prev ? { ...prev, followerCount: prev.followerCount + 1 } : null,
      )
    }

    try {
      const result = await followRepository.follow(currentProfile.id, user.id)
      if (result.status === "error") {
        setFollowStatus(previousStatus)
        setUser((prev) =>
          prev ? { ...prev, followerCount: previousCount } : null,
        )
      } else if (result.status !== newStatus) {
        setFollowStatus(result.status)
      }
    } catch {
      setFollowStatus(previousStatus)
      setUser((prev) =>
        prev ? { ...prev, followerCount: previousCount } : null,
      )
    }
  }, [currentProfile, user, followStatus])

  const handleUnfollow = useCallback(async () => {
    if (!currentProfile || !user) return

    const previousStatus = followStatus
    const previousCount = user.followerCount
    const wasFollowing = followStatus === "following"

    setFollowStatus("none")
    if (wasFollowing) {
      setUser((prev) =>
        prev
          ? { ...prev, followerCount: Math.max(0, prev.followerCount - 1) }
          : null,
      )
    }

    try {
      const result = await followRepository.unfollow(currentProfile.id, user.id)
      if (result.error) {
        setFollowStatus(previousStatus)
        setUser((prev) =>
          prev ? { ...prev, followerCount: previousCount } : null,
        )
      }
    } catch {
      setFollowStatus(previousStatus)
      setUser((prev) =>
        prev ? { ...prev, followerCount: previousCount } : null,
      )
    }
  }, [currentProfile, user, followStatus])

  return {
    user,
    followStatus,
    isLoading,
    isCurrentUser,
    refreshProfile,
    handleFollow,
    handleUnfollow,
  }
}
