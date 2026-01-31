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

import { useBlockedUsers } from "@features/settings/use-blocked-users"
import { StyledImage } from "@lib/components/styled-image"
import { IMAGE_CACHE_POLICY } from "@lib/constants/image"
import { Profile } from "@services/repositories/types"

export function BlockedContent() {
  const [textSecondary, textTertiary, text] = useCSSVariable([
    "--color-text-secondary",
    "--color-text-tertiary",
    "--color-text",
  ]) as [string, string, string]
  const router = useRouter()
  const { blockedUsers, isLoading, handleUnblock, isUnblocking } =
    useBlockedUsers()

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
      <TouchableOpacity
        className="px-4 py-2 rounded-lg border border-border min-w-[80px] items-center"
        onPress={() => handleUnblock(item.id)}
        disabled={isUnblocking(item.id)}
      >
        {isUnblocking(item.id) ? (
          <ActivityIndicator size="small" color={text} />
        ) : (
          <Text className="text-sm font-semibold text-text">Unblock</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={textSecondary} />
        </View>
      </View>
    )
  }

  if (blockedUsers.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-lg font-semibold mb-2 text-text">
            No blocked accounts
          </Text>
          <Text className="text-sm text-center leading-5 text-text-secondary">
            {
              "When you block someone, they won't be able to see your posts or find your profile."
            }
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={blockedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerClassName="flex-grow"
      />
    </View>
  )
}
