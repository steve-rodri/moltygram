import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@lib/contexts/auth-context"
import { blockRepository } from "@services/repositories/supabase"
import { Profile } from "@services/repositories/types"

export function useBlockedUsers() {
  const { profile } = useAuth()

  const [blockedUsers, setBlockedUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unblockingIds, setUnblockingIds] = useState<Set<string>>(new Set())

  const loadBlockedUsers = useCallback(async () => {
    if (!profile) return
    setIsLoading(true)
    try {
      const users = await blockRepository.getBlockedUsers(profile.id)
      setBlockedUsers(users)
    } catch {
      // Failed to load blocked users
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  useEffect(() => {
    loadBlockedUsers()
  }, [loadBlockedUsers])

  const handleUnblock = useCallback(
    async (userId: string) => {
      if (!profile || unblockingIds.has(userId)) return
      setUnblockingIds((prev) => new Set(prev).add(userId))
      try {
        const result = await blockRepository.unblock(profile.id, userId)
        if (!result.error) {
          setBlockedUsers((prev) => prev.filter((u) => u.id !== userId))
        }
      } finally {
        setUnblockingIds((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    },
    [profile, unblockingIds],
  )

  const isUnblocking = useCallback(
    (userId: string) => unblockingIds.has(userId),
    [unblockingIds],
  )

  return {
    blockedUsers,
    isLoading,
    handleUnblock,
    isUnblocking,
  }
}
