import { useEffect, useLayoutEffect, useState } from "react"
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import SegmentedControl from "@react-native-segmented-control/segmented-control"
import * as MediaLibrary from "expo-media-library"
import { useNavigation, useRouter } from "expo-router"

import { useCreatePost } from "@features/create-post/create-post-provider"
import { CROP_HEIGHT } from "@lib/components/crop-overlay"
import { useTheme } from "@lib/contexts/theme-context"

import { SelectStep } from "../../features/create-post/select-step"

const STOCK_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `https://picsum.photos/seed/aesthetic${i}/600/600`,
)

type Source = "stock" | "camera"

export default function CreateAestheticSelectScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { colors, isDark } = useTheme()
  const {
    aestheticImage,
    setAestheticImage,
    setAestheticFilter,
    setAestheticCrop,
    setAestheticCropY,
    contentFit,
    setContentFit,
  } = useCreatePost()

  const toggleContentFit = () => {
    setContentFit(contentFit === "contain" ? "cover" : "contain")
  }

  const [source, setSource] = useState<Source>("stock")
  const [cameraPhotos, setCameraPhotos] = useState<string[]>([])
  const [, setHasPermission] = useState(false)
  const [endCursor, setEndCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (source === "camera" && cameraPhotos.length === 0) {
      loadCameraPhotos()
    }
  }, [source])

  async function loadCameraPhotos(cursor?: string) {
    if (isLoading) return
    setIsLoading(true)

    const { status } = await MediaLibrary.requestPermissionsAsync()
    setHasPermission(status === "granted")

    if (status === "granted") {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: 50,
        after: cursor,
      })

      const uris = result.assets.map((asset) => asset.uri)
      setCameraPhotos((prev) => (cursor ? [...prev, ...uris] : uris))
      setEndCursor(result.endCursor)
      setHasMore(result.hasNextPage)
    }
    setIsLoading(false)
  }

  function loadMore() {
    if (source === "camera" && hasMore && !isLoading) {
      loadCameraPhotos(endCursor)
    }
  }

  function reloadCameraPhotos() {
    setEndCursor(undefined)
    setHasMore(true)
    loadCameraPhotos()
  }

  const toggleAestheticSelection = (image: string) => {
    setAestheticImage(aestheticImage === image ? null : image)
  }

  const handleNext = () => {
    if (aestheticImage) {
      const screenWidth = Dimensions.get("window").width
      const centerY = (screenWidth - CROP_HEIGHT) / 2
      setAestheticFilter("normal")
      setAestheticCrop({ scale: 1, offsetX: 0, offsetY: 0 })
      setAestheticCropY(centerY)
      router.push("/create/aesthetic-edit")
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Select Photo",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleNext}
          disabled={!aestheticImage}
          style={{ paddingHorizontal: 16 }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              opacity: !aestheticImage ? 0.5 : 1,
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, colors, aestheticImage])

  const selectedAesthetic = aestheticImage ? [aestheticImage] : []
  const images = source === "stock" ? STOCK_IMAGES : cameraPhotos

  const renderSourceToggle = () => (
    <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
      <SegmentedControl
        values={["Stock Photos", "Camera Roll"]}
        selectedIndex={source === "stock" ? 0 : 1}
        onChange={(event) =>
          setSource(
            event.nativeEvent.selectedSegmentIndex === 0 ? "stock" : "camera",
          )
        }
        appearance={isDark ? "dark" : "light"}
        backgroundColor={colors.surface}
        tintColor={colors.primary}
        fontStyle={{ color: colors.textSecondary }}
        activeFontStyle={{ color: "#fff" }}
        style={styles.segmentedControl}
      />
    </View>
  )

  return (
    <View style={styles.container}>
      <SelectStep
        images={images}
        selectedImages={selectedAesthetic}
        onToggleImage={toggleAestheticSelection}
        onEndReached={loadMore}
        onPhotosChanged={source === "camera" ? reloadCameraPhotos : undefined}
        contentFit={contentFit}
        onContentFitToggle={toggleContentFit}
        colors={colors}
        renderBelowPreview={renderSourceToggle}
        title={source === "stock" ? "Stock Photos" : "Camera Roll"}
        maxSelection={1}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleContainer: { padding: 12 },
  segmentedControl: { marginHorizontal: 8 },
})
