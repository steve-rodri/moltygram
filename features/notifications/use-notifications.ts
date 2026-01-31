import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@lib/contexts/auth-context"

import { notificationRepository } from "../../services/repositories/supabase"
import { Notification } from "../../services/repositories/types"

export function useNotifications() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const loadNotifications = useCallback(async () => {
    if (!profile) return
    setIsLoading(true)
    try {
      const result = await notificationRepository.getNotifications(profile.id)
      setNotifications(result.data)
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
      await notificationRepository.markAllAsRead(profile.id)
    } catch {
      // Failed to load notifications
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleRefresh = async () => {
    if (!profile) return
    setIsRefreshing(true)
    try {
      const result = await notificationRepository.getNotifications(profile.id)
      setNotifications(result.data)
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
      await notificationRepository.markAllAsRead(profile.id)
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadMore = async () => {
    if (!profile || !hasMore || isLoadingMore || !cursor) return
    setIsLoadingMore(true)
    try {
      const result = await notificationRepository.getNotifications(
        profile.id,
        cursor,
      )
      setNotifications((prev) => [...prev, ...result.data])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    refresh: handleRefresh,
    loadMore,
  }
}
