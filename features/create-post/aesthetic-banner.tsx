import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import { CROP_HEIGHT } from "@lib/components/crop-overlay"
import { FilteredImage, FilterName } from "@lib/components/filtered-image"
import { StaticText, TextOverlayData } from "@lib/components/text-overlay"

import { ImageCropTransform } from "./create-post-provider"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const BANNER_WIDTH = SCREEN_WIDTH - 32
const BANNER_SCALE = BANNER_WIDTH / SCREEN_WIDTH
const IMAGE_SCALE = 1.5

interface AestheticData {
  image: string
  filter: FilterName
  crop: ImageCropTransform
  cropY: number
  overlays: TextOverlayData[]
}

interface AestheticBannerProps {
  aesthetic?: AestheticData
  onAdd: () => void
  onEdit: () => void
  onRemove: () => void
  colors: { border: string; primary: string }
}

export function AestheticBanner({
  aesthetic,
  onAdd,
  onEdit,
  onRemove,
  colors,
}: AestheticBannerProps) {
  if (aesthetic) {
    const { scale: cropScale, offsetX, offsetY } = aesthetic.crop
    const editorImageSize = SCREEN_WIDTH * IMAGE_SCALE
    const centerOffset = (editorImageSize - SCREEN_WIDTH) / 2

    const isDefaultCrop = cropScale === 1 && offsetX === 0 && offsetY === 0
    const effectiveOffsetX = isDefaultCrop ? centerOffset : offsetX
    const effectiveOffsetY = isDefaultCrop ? centerOffset : offsetY

    const scaleShiftX = ((1 - cropScale) * editorImageSize) / 2
    const scaleShiftY = ((1 - cropScale) * editorImageSize) / 2

    const translateX = (-effectiveOffsetX + scaleShiftX) * BANNER_SCALE
    const translateY = (-effectiveOffsetY + scaleShiftY) * BANNER_SCALE

    const scaledEditorSize = editorImageSize * BANNER_SCALE

    return (
      <View style={styles.bannerContainer}>
        <TouchableOpacity style={styles.bannerPreview} onPress={onEdit}>
          <View
            style={[styles.bannerCrop, { height: CROP_HEIGHT * BANNER_SCALE }]}
          >
            <View
              style={[
                styles.bannerOffset,
                { top: -aesthetic.cropY * BANNER_SCALE },
              ]}
            >
              <View style={styles.zoomContainer}>
                <View
                  style={{
                    width: scaledEditorSize,
                    height: scaledEditorSize,
                    transform: [
                      { translateX },
                      { translateY },
                      { scale: cropScale },
                    ],
                  }}
                >
                  <FilteredImage
                    uri={aesthetic.image}
                    width={scaledEditorSize}
                    height={scaledEditorSize}
                    filterName={aesthetic.filter}
                  />
                </View>
              </View>
              {aesthetic.overlays.map((overlay) => (
                <View
                  key={overlay.id}
                  style={{
                    position: "absolute",
                    left: overlay.x * BANNER_SCALE,
                    top: overlay.y * BANNER_SCALE,
                  }}
                >
                  <StaticText overlay={{ ...overlay, x: 0, y: 0 }} />
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.aestheticButton, { borderColor: colors.border }]}
      onPress={onAdd}
    >
      <Text style={[styles.aestheticButtonText, { color: colors.primary }]}>
        Add to your Aesthetic
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  aestheticButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  aestheticButtonText: { fontSize: 16, fontWeight: "600" },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    position: "relative",
  },
  bannerPreview: { borderRadius: 12, overflow: "hidden" },
  bannerCrop: { width: BANNER_WIDTH, overflow: "hidden" },
  bannerOffset: {
    position: "absolute",
    left: 0,
    width: BANNER_WIDTH,
    height: BANNER_WIDTH,
  },
  zoomContainer: {
    width: BANNER_WIDTH,
    height: BANNER_WIDTH,
    overflow: "hidden",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
})
