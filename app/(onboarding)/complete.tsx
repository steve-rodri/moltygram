import { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { CheckCircle, User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"
import { useAuth } from "@lib/contexts/auth-context"

import {
  IMAGE_CACHE_POLICY,
  IMAGE_TRANSITION_MS,
} from "../../lib/constants/image"
import {
  storageRepository,
  userRepository,
} from "../../services/repositories/supabase"

export default function CompleteScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    handle: string
    name: string
    pronouns: string
    bio: string
    photoUri: string
  }>()
  const {
    session,
    profile,
    setProfile,
    isPreviewingOnboarding,
    stopOnboardingPreview,
  } = useAuth()
  const insets = useSafeAreaInsets()
  const [primary, textTertiary, success] = useCSSVariable([
    "--color-primary",
    "--color-text-tertiary",
    "--color-success",
  ]) as [string, string, string]

  const [isCreating, setIsCreating] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    createProfile()
  }, [])

  const createProfile = async () => {
    if (!session) return

    if (isPreviewingOnboarding && profile) {
      setIsCreating(false)
      setIsComplete(true)
      setTimeout(() => {
        stopOnboardingPreview()
      }, 1500)
      return
    }

    try {
      const newProfile = await userRepository.createProfile(session.user.id, {
        handle: params.handle || "user",
        name: params.name || "User",
        pronouns: params.pronouns || undefined,
        bio: params.bio || undefined,
        avatarUrl: params.photoUri || undefined,
      })

      setProfile(newProfile)
      setIsCreating(false)
      setIsComplete(true)

      setTimeout(() => {
        stopOnboardingPreview()
        router.replace("/(tabs)")
      }, 1500)

      if (params.photoUri) {
        const path = `${session.user.id}/avatar_${Date.now()}.jpg`
        const uploadResult = await storageRepository.uploadImage(
          params.photoUri,
          "avatars",
          path,
        )
        if (!uploadResult.error && uploadResult.url) {
          const updatedProfile = await userRepository.updateProfile(
            session.user.id,
            {
              avatarUrl: uploadResult.url,
            },
          )
          setProfile(updatedProfile)
        }
      }
    } catch {
      // Failed to create profile
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-1 justify-center items-center px-8">
        {isCreating ? (
          <>
            <ActivityIndicator size="large" color={primary} />
            <Text className="text-base mt-4 text-text">
              Setting up your profile...
            </Text>
          </>
        ) : isComplete ? (
          <>
            <View className="relative mb-6">
              {params.photoUri ? (
                <StyledImage
                  source={{ uri: params.photoUri }}
                  className="w-[120px] h-[120px] rounded-full"
                  cachePolicy={IMAGE_CACHE_POLICY}
                  transition={IMAGE_TRANSITION_MS}
                />
              ) : (
                <View className="w-[120px] h-[120px] rounded-full justify-center items-center bg-surface">
                  <User size={48} color={textTertiary} />
                </View>
              )}
              <View
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full justify-center items-center"
                style={{ backgroundColor: success }}
              >
                <CheckCircle size={24} color="#fff" />
              </View>
            </View>
            <Text className="text-2xl font-bold mb-1 text-text">
              Welcome, {params.name}!
            </Text>
            <Text className="text-base mb-4 text-text-secondary">
              @{params.handle}
            </Text>
            <Text className="text-base mt-4 text-text-secondary">
              Your profile is ready
            </Text>
          </>
        ) : null}
      </View>
    </View>
  )
}
