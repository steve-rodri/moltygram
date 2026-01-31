import { useMemo } from "react"
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useCSSVariable } from "uniwind"

import { SkeletonImage } from "@lib/components/skeleton-image"

import { Post } from "../../services/repositories/types"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const GRID_SIZE = SCREEN_WIDTH / 3

interface ExploreGridProps {
  posts: Post[]
  isLoading: boolean
  onRefresh: () => void
  onPostPress: (postId: string) => void
}

export function ExploreGrid({
  posts,
  isLoading,
  onRefresh,
  onPostPress,
}: ExploreGridProps) {
  const insets = useSafeAreaInsets()
  const [textSecondary] = useCSSVariable(["--color-text-secondary"]) as [string]

  const gridItems = useMemo(() => {
    return posts.map((post) => ({ postId: post.id, image: post.images[0] }))
  }, [posts])

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="grow pb-14"
      contentInset={{ top: insets.top }}
      contentOffset={{ x: 0, y: -insets.top }}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={isLoading && posts.length === 0}
          onRefresh={onRefresh}
          tintColor={textSecondary}
        />
      }
    >
      <View className="flex-row flex-wrap">
        {gridItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onPostPress(item.postId)}
          >
            <SkeletonImage
              source={{ uri: item.image }}
              style={{
                width: GRID_SIZE,
                height: GRID_SIZE,
                borderWidth: 0.5,
                borderColor: "transparent",
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}
