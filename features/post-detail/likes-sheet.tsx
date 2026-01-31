import { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { useRouter } from "expo-router"
import { User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { likeRepository } from "../../services/repositories/supabase"
import { Profile } from "../../services/repositories/types"

interface LikesSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>
  postId: string
  onClose: () => void
}

export function LikesSheet({ sheetRef, postId, onClose }: LikesSheetProps) {
  const router = useRouter()
  const [background, text, textSecondary, textTertiary] = useCSSVariable([
    "--color-background",
    "--color-text",
    "--color-text-secondary",
    "--color-text-tertiary",
  ]) as [string, string, string, string]
  const insets = useSafeAreaInsets()
  const [likers, setLikers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const snapPoints = useMemo(() => ["65%", "92%"], [])

  const loadLikers = useCallback(async () => {
    if (!postId) return
    setIsLoading(true)
    try {
      const result = await likeRepository.getLikers(postId)
      setLikers(result.data)
    } catch {
      // Failed to load likers
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (postId) {
      loadLikers()
    }
  }, [postId, loadLikers])

  const handleUserPress = (userId: string) => {
    onClose()
    router.push(`/profile/${userId}`)
  }

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  )

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onDismiss={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: background }}
      handleIndicatorStyle={{ backgroundColor: textTertiary }}
      backdropComponent={renderBackdrop}
    >
      <View className="items-center py-3">
        <Text className="text-base font-semibold" style={{ color: text }}>
          Likes
        </Text>
      </View>

      <BottomSheetScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : likers.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-base font-semibold text-text-secondary">
              No likes yet
            </Text>
          </View>
        ) : (
          likers.map((user) => (
            <TouchableOpacity
              key={user.id}
              className="flex-row items-center gap-3 mb-4"
              onPress={() => handleUserPress(user.id)}
            >
              {user.avatarUrl ? (
                <StyledImage
                  source={{ uri: user.avatarUrl }}
                  className="w-11 h-11 rounded-full"
                  cachePolicy={IMAGE_CACHE_POLICY}
                />
              ) : (
                <View className="w-11 h-11 rounded-full items-center justify-center bg-border-light">
                  <User size={20} color={textTertiary} />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text">
                  {user.handle}
                </Text>
                <Text className="text-sm mt-0.5 text-text-secondary">
                  {user.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
