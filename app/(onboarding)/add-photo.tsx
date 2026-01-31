import { useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Camera, User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"

import {
  IMAGE_CACHE_POLICY,
  IMAGE_TRANSITION_MS,
} from "../../lib/constants/image"

export default function AddPhotoScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    handle: string
    name: string
    pronouns: string
    bio: string
  }>()
  const insets = useSafeAreaInsets()
  const [textTertiary] = useCSSVariable(["--color-text-tertiary"]) as [string]

  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant access to your photo library",
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri)
    }
  }

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/complete",
      params: { ...params, photoUri: photoUri || "" },
    })
  }

  const handleSkip = () => {
    router.push({
      pathname: "/(onboarding)/complete",
      params: { ...params, photoUri: "" },
    })
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-8 pt-12 items-center">
        <View className="items-center mb-12">
          <Text className="text-sm mb-2 text-text-tertiary">Step 4 of 4</Text>
          <Text className="text-[28px] font-bold mb-2 text-center text-text">
            Add a profile photo
          </Text>
          <Text className="text-base leading-[22px] text-center text-text-secondary">
            Help people recognize you
          </Text>
        </View>

        <TouchableOpacity className="relative mb-4" onPress={pickImage}>
          {photoUri ? (
            <StyledImage
              source={{ uri: photoUri }}
              className="w-40 h-40 rounded-full"
              cachePolicy={IMAGE_CACHE_POLICY}
              transition={IMAGE_TRANSITION_MS}
            />
          ) : (
            <View className="w-40 h-40 rounded-full justify-center items-center bg-surface">
              <User size={64} color={textTertiary} />
            </View>
          )}
          <View className="absolute bottom-2 right-2 w-10 h-10 rounded-full justify-center items-center bg-primary">
            <Camera size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={pickImage}>
          <Text className="text-base font-semibold text-primary">
            {photoUri ? "Change photo" : "Choose a photo"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="px-8 pt-4 gap-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          className="py-4 rounded-xl items-center bg-primary"
          onPress={handleContinue}
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3 items-center" onPress={handleSkip}>
          <Text className="text-sm font-medium text-text-secondary">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
