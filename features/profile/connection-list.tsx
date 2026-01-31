import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"
import { IMAGE_CACHE_POLICY } from "@lib/constants/image"
import { followRepository } from "@services/repositories/supabase"
import { Profile } from "@services/repositories/types"

type ConnectionType = "followers" | "following" | "mutuals"

interface ConnectionListProps {
  userId: string
  type: ConnectionType
}

const EMPTY_MESSAGES: Record<ConnectionType, string> = {
  followers: "No followers yet",
  following: "Not following anyone yet",
  mutuals: "No mutuals yet",
}

export default function ConnectionList({ userId, type }: ConnectionListProps) {
  const router = useRouter()
  const [textSecondary, textTertiary] = useCSSVariable([
    "--color-text-secondary",
    "--color-text-tertiary",
  ]) as [string, string]
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetcher = getFetcher(type)
      const result = await fetcher(userId)
      setProfiles(result.data)
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      // Failed to load
    } finally {
      setIsLoading(false)
    }
  }, [userId, type])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadMore = async () => {
    if (!hasMore || isLoadingMore || !cursor) return
    setIsLoadingMore(true)
    try {
      const fetcher = getFetcher(type)
      const result = await fetcher(userId, cursor)
      setProfiles((prev) => [...prev, ...result.data])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const renderUser = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-border-light"
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      {item.avatarUrl ? (
        <StyledImage
          source={{ uri: item.avatarUrl }}
          className="w-11 h-11 rounded-full"
          cachePolicy={IMAGE_CACHE_POLICY}
        />
      ) : (
        <View className="w-11 h-11 rounded-full items-center justify-center bg-border-light">
          <User size={20} color={textTertiary} />
        </View>
      )}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold text-text">@{item.handle}</Text>
        <Text className="text-sm mt-0.5 text-text-secondary">{item.name}</Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={textSecondary} />
      </View>
    )
  }

  if (profiles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-text-secondary">
          {EMPTY_MESSAGES[type]}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={profiles}
      renderItem={renderUser}
      keyExtractor={(item) => item.id}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : null
      }
    />
  )
}

function getFetcher(type: ConnectionType) {
  switch (type) {
    case "followers":
      return followRepository.getFollowers
    case "following":
      return followRepository.getFollowing
    case "mutuals":
      return followRepository.getMutuals
  }
}
