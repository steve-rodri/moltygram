import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { User, X } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { likeRepository } from "../../services/repositories/supabase"
import { Profile } from "../../services/repositories/types"

interface LikesModalProps {
  visible: boolean
  onClose: () => void
  postId: string
}

export function LikesModal({ visible, onClose, postId }: LikesModalProps) {
  const router = useRouter()
  const [text, textSecondary, textTertiary] = useCSSVariable([
    "--color-text",
    "--color-text-secondary",
    "--color-text-tertiary",
  ]) as [string, string, string]
  const insets = useSafeAreaInsets()
  const [likers, setLikers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadLikers = useCallback(async () => {
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
    if (visible) {
      loadLikers()
    }
  }, [visible, loadLikers])

  useEffect(() => {
    if (!visible) {
      setLikers([])
    }
  }, [visible])

  const handleUserPress = (userId: string) => {
    onClose()
    router.push(`/profile/${userId}`)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <View
        className="flex-1 bg-background"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center justify-center py-6">
          <Text className="text-base font-semibold text-text">Likes</Text>
          <TouchableOpacity onPress={onClose} className="absolute right-4 p-1">
            <X size={24} color={text} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
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
        </ScrollView>
      </View>
    </Modal>
  )
}
