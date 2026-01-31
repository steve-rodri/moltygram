import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import Slider from "@react-native-community/slider"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Check, RotateCcw, X } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { PhotoType } from "@features/profile/photo-update-helpers"
import { usePhotoEditor } from "@features/profile/use-photo-editor"
import { IMAGE_CACHE_POLICY } from "@lib/constants/image"
import { useAuth } from "@lib/contexts/auth-context"

export default function EditPhotoScreen() {
  const { type, uri } = useLocalSearchParams<{
    type: "profile" | "cover"
    uri?: string
  }>()
  const router = useRouter()
  const [text, primary, textSecondary, surface, border] = useCSSVariable([
    "--color-text",
    "--color-primary",
    "--color-text-secondary",
    "--color-surface",
    "--color-border",
  ]) as [string, string, string, string, string]
  const { profile } = useAuth()

  const photoType: PhotoType = type || "profile"
  const isProfilePhoto = photoType === "profile"
  const existingUri = isProfilePhoto
    ? profile?.avatarUrl
    : profile?.coverPhotoUrl
  const originalUri = uri ? decodeURIComponent(uri) : existingUri

  const editor = usePhotoEditor(photoType, originalUri)

  const renderLoadingState = () => (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pb-4 pt-6">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <X size={24} color={text} />
        </TouchableOpacity>
        <Text className="text-[17px] font-semibold text-text">
          Edit {isProfilePhoto ? "Profile" : "Backdrop"}
        </Text>
        <View className="w-10 h-10" />
      </View>
      <View className="flex-1 items-center justify-center">
        <View
          style={{
            width: editor.frameWidth,
            height: editor.frameHeight,
            backgroundColor: surface,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: originalUri }}
            style={{ width: 1, height: 1, opacity: 0 }}
            onLoad={editor.handleImageLoad}
          />
        </View>
      </View>
    </View>
  )

  if (!editor.imageDimensions) return renderLoadingState()

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pb-4 pt-6">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <X size={24} color={text} />
        </TouchableOpacity>
        <Text className="text-[17px] font-semibold text-text">
          Edit {isProfilePhoto ? "Profile" : "Backdrop"}
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={editor.save}
        >
          <Check size={24} color={primary} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center">
        <View
          style={{
            width: editor.frameWidth,
            height: editor.frameHeight,
            backgroundColor: surface,
            borderRadius: isProfilePhoto ? 16 : 0,
            overflow: "hidden",
          }}
        >
          <ScrollView
            ref={editor.scrollViewRef}
            className="flex-1"
            contentContainerClassName="items-center justify-center"
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onScroll={editor.handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            bouncesZoom={false}
            decelerationRate="fast"
            centerContent
          >
            <Image
              source={{ uri: originalUri }}
              style={[
                {
                  width: editor.displaySize.width,
                  height: editor.displaySize.height,
                },
                { transform: [{ rotate: `${editor.rotation}deg` }] },
              ]}
              contentFit="contain"
              cachePolicy={IMAGE_CACHE_POLICY}
            />
          </ScrollView>
        </View>
        <Text className="mt-4 text-[13px] text-text-secondary">
          Pinch to zoom • Drag to move
        </Text>
      </View>

      <View className="p-5 pb-10 bg-surface">
        <View className="flex-row items-center gap-3">
          <Text className="text-sm w-[50px] text-text">Zoom</Text>
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={1}
            maximumValue={4}
            value={editor.zoomScale}
            onValueChange={(value) => {
              editor.setZoomScale(value)
              editor.scrollViewRef.current?.setNativeProps({ zoomScale: value })
            }}
            minimumTrackTintColor={primary}
            maximumTrackTintColor={border}
            thumbTintColor={primary}
            tapToSeek
          />
          <Text className="text-sm w-10 text-right text-text-secondary">
            {editor.zoomScale.toFixed(1)}x
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="text-sm w-[50px] text-text">Rotate</Text>
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={-180}
            maximumValue={180}
            value={editor.rotation}
            onValueChange={editor.setRotation}
            minimumTrackTintColor={primary}
            maximumTrackTintColor={border}
            thumbTintColor={primary}
            tapToSeek
          />
          <Text className="text-sm w-10 text-right text-text-secondary">
            {Math.round(editor.rotation)}°
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center justify-center mt-4 gap-1.5"
          onPress={editor.reset}
        >
          <RotateCcw size={18} color={textSecondary} />
          <Text className="text-sm text-text-secondary">Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
