import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Image } from "expo-image"
import { Stack } from "expo-router"
import { RotateCcw, Trash2 } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import {
  usePermanentDeletePost,
  useRecentlyDeletedPosts,
  useRestorePost,
} from "@features/feed/use-posts"
import { IMAGE_CACHE_POLICY } from "@lib/constants/image"
import { DeletedPost } from "@services/repositories/types"

const GRID_SIZE = Dimensions.get("window").width / 3

export default function RecentlyDeletedScreen() {
  const [textSecondary, textTertiary, error] = useCSSVariable([
    "--color-text-secondary",
    "--color-text-tertiary",
    "--color-error",
  ]) as [string, string, string]

  const {
    data: posts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecentlyDeletedPosts()
  const restoreMutation = useRestorePost()
  const permanentDeleteMutation = usePermanentDeletePost()
  const [selectedPost, setSelectedPost] = useState<DeletedPost | null>(null)

  const handleRestore = (post: DeletedPost) => {
    Alert.alert("Restore Post", "This post will be restored to your profile.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        onPress: () => {
          restoreMutation.mutate(post.id)
          setSelectedPost(null)
        },
      },
    ])
  }

  const handlePermanentDelete = (post: DeletedPost) => {
    Alert.alert(
      "Delete Permanently",
      "This cannot be undone. The post will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            permanentDeleteMutation.mutate(post.id)
            setSelectedPost(null)
          },
        },
      ],
    )
  }

  const renderPost = ({ item }: { item: DeletedPost }) => {
    const isSelected = selectedPost?.id === item.id
    const isPending =
      restoreMutation.isPending || permanentDeleteMutation.isPending

    return (
      <TouchableOpacity
        className="relative"
        onPress={() => setSelectedPost(isSelected ? null : item)}
        disabled={isPending}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={{ width: GRID_SIZE, height: GRID_SIZE }}
          cachePolicy={IMAGE_CACHE_POLICY}
        />
        <View
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded"
          style={{ backgroundColor: error }}
        >
          <Text className="text-[10px] font-semibold text-white">
            {item.daysRemaining}d
          </Text>
        </View>
        {isSelected && (
          <View className="absolute inset-0 bg-black/60 justify-center items-center">
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="w-11 h-11 rounded-full justify-center items-center"
                onPress={() => handleRestore(item)}
              >
                <RotateCcw size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-11 h-11 rounded-full justify-center items-center"
                onPress={() => handlePermanentDelete(item)}
              >
                <Trash2 size={24} color={error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: "Recently Deleted" }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={textSecondary} />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Recently Deleted" }} />
      {!posts || posts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8 gap-3">
          <Trash2 size={48} color={textTertiary} />
          <Text className="text-lg font-semibold text-text">
            No deleted posts
          </Text>
          <Text className="text-sm text-center leading-5 text-text-secondary">
            Posts you delete will appear here for 30 days before being
            permanently removed.
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerClassName="flex-grow"
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="p-4 items-center">
                <ActivityIndicator size="small" color={textSecondary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}
