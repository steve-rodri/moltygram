import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native"
import { useCSSVariable } from "uniwind"

import { PostCard } from "../../features/feed/post-card"
import { useFeed } from "../../features/feed/use-posts"

export default function FeedScreen() {
  const [textSecondary] = useCSSVariable(["--color-text-secondary"]) as [string]
  const {
    data: posts = [],
    isLoading,
    hasNextPage,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed()

  const renderFooter = () => {
    if (!hasNextPage && !isFetchingNextPage) return null
    return (
      <View className="py-5 items-center">
        <ActivityIndicator size="small" color={textSecondary} />
      </View>
    )
  }

  const renderEmpty = () => {
    if (isLoading) return null
    return (
      <View className="flex-1 py-16 px-8 items-center">
        <Text className="text-[15px] text-center leading-[22px] text-text-secondary">
          No posts yet. Follow some people or create your first post!
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard key={item.id} post={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && posts.length === 0}
          onRefresh={refetch}
          tintColor={textSecondary}
        />
      }
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  )
}
