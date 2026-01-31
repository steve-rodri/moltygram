import { useEffect, useLayoutEffect, useState } from "react"
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native"
import * as MediaLibrary from "expo-media-library"
import { useNavigation, useRouter } from "expo-router"
import { X } from "lucide-react-native"

import { useCreatePost } from "@features/create-post/create-post-provider"
import { useTheme } from "@lib/contexts/theme-context"

import { SelectStep } from "../../features/create-post/select-step"

export default function CreateSelectScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const {
    selectedImages,
    setSelectedImages,
    setImageFilters,
    setImageIntensities,
    setImageCrops,
    setImageOverlays,
    contentFit,
    setContentFit,
    reset,
  } = useCreatePost()

  const toggleContentFit = () => {
    setContentFit(contentFit === "contain" ? "cover" : "contain")
  }
  const [photos, setPhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [endCursor, setEndCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    requestPermissionAndLoad()
  }, [])

  async function requestPermissionAndLoad() {
    const { status } = await MediaLibrary.requestPermissionsAsync()
    setHasPermission(status === "granted")
    if (status === "granted") {
      loadPhotos()
    } else {
      setIsLoading(false)
    }
  }

  async function loadPhotos(cursor?: string) {
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: 50,
        after: cursor,
      })

      const uris = result.assets.map((asset) => asset.uri)
      setPhotos((prev) => (cursor ? [...prev, ...uris] : uris))
      setEndCursor(result.endCursor)
      setHasMore(result.hasNextPage)
    } catch {
      // Failed to load photos
    } finally {
      setIsLoading(false)
    }
  }

  function loadMore() {
    if (hasMore && !isLoading) {
      setIsLoading(true)
      loadPhotos(endCursor)
    }
  }

  const toggleImageSelection = (image: string) => {
    setSelectedImages(
      selectedImages.includes(image)
        ? selectedImages.filter((i) => i !== image)
        : selectedImages.length < 5
          ? [...selectedImages, image]
          : selectedImages,
    )
  }

  const handleClose = () => {
    reset()
    router.back()
  }

  const handleNext = () => {
    if (selectedImages.length > 0) {
      setImageFilters(selectedImages.map(() => "normal"))
      setImageIntensities(selectedImages.map(() => 1))
      setImageCrops(
        selectedImages.map(() => ({ scale: 1, offsetX: 0, offsetY: 0 })),
      )
      setImageOverlays(selectedImages.map(() => []))
      router.push("/create/post")
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "New Post",
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleClose}
          style={{ paddingHorizontal: 8 }}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedImages.length === 0}
          style={{ paddingHorizontal: 16 }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              opacity: selectedImages.length === 0 ? 0.5 : 1,
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, colors, selectedImages.length])

  if (isLoading && photos.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!hasPermission) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          padding: 32,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Photo Access Required
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Please grant photo library access in Settings to create posts.
        </Text>
      </View>
    )
  }

  function reloadPhotos() {
    setEndCursor(undefined)
    setHasMore(true)
    loadPhotos()
  }

  return (
    <SelectStep
      images={photos}
      selectedImages={selectedImages}
      onToggleImage={toggleImageSelection}
      onEndReached={loadMore}
      onPhotosChanged={reloadPhotos}
      contentFit={contentFit}
      onContentFitToggle={toggleContentFit}
      colors={colors}
    />
  )
}
