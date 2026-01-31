import { forwardRef } from "react"
import { Dimensions, StyleSheet, Text, View } from "react-native"
import ViewShot from "react-native-view-shot"

import { ImageCropTransform } from "@features/create-post/create-post-provider"
import { CROP_HEIGHT } from "@lib/components/crop-overlay"
import { FilteredImage, FilterName } from "@lib/components/filtered-image"
import { FONT_FAMILIES, TextOverlayData } from "@lib/components/text-overlay"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const IMAGE_SCALE = 1.5

interface AestheticCaptureProps {
  imageUri: string
  filterName: FilterName
  crop: ImageCropTransform
  cropY: number
  overlays: TextOverlayData[]
}

function getOverlayTextStyle(overlay: TextOverlayData) {
  const fontConfig =
    FONT_FAMILIES.find((f) => f.value === overlay.fontFamily) ??
    FONT_FAMILIES[0]

  const textStyle: any = {
    color: overlay.color,
    fontSize: overlay.textSize,
    fontFamily: fontConfig.fontFamily,
    fontWeight: "700" as const,
  }

  if (overlay.style === "outline") {
    textStyle.textShadowColor =
      overlay.color === "#000000" ? "#FFFFFF" : "#000000"
    textStyle.textShadowOffset = { width: 0, height: 0 }
    textStyle.textShadowRadius = 2
  } else if (overlay.style === "none") {
    textStyle.textShadowColor = "rgba(0, 0, 0, 0.75)"
    textStyle.textShadowOffset = { width: 1, height: 1 }
    textStyle.textShadowRadius = 3
  }

  return textStyle
}

function getBackgroundColor(overlay: TextOverlayData): string {
  if (overlay.style !== "background") return "transparent"
  return overlay.color === "#000000"
    ? "rgba(255,255,255,0.8)"
    : "rgba(0,0,0,0.6)"
}

export const AestheticCapture = forwardRef<ViewShot, AestheticCaptureProps>(
  function AestheticCapture(
    { imageUri, filterName, crop, cropY, overlays },
    ref,
  ) {
    const { scale: cropScale, offsetX, offsetY } = crop
    const editorImageSize = SCREEN_WIDTH * IMAGE_SCALE
    const centerOffset = (editorImageSize - SCREEN_WIDTH) / 2

    const isDefaultCrop = cropScale === 1 && offsetX === 0 && offsetY === 0
    const effectiveOffsetX = isDefaultCrop ? centerOffset : offsetX
    const effectiveOffsetY = isDefaultCrop ? centerOffset : offsetY

    const scaleShiftX = ((1 - cropScale) * editorImageSize) / 2
    const scaleShiftY = ((1 - cropScale) * editorImageSize) / 2

    const translateX = -effectiveOffsetX + scaleShiftX
    const translateY = -effectiveOffsetY + scaleShiftY

    return (
      <View style={styles.offscreen}>
        <ViewShot ref={ref} options={{ format: "png", quality: 1.0 }}>
          <View style={styles.cropContainer}>
            <View style={[styles.imageOffset, { top: -cropY }]}>
              <View style={styles.zoomContainer}>
                <View
                  style={{
                    width: editorImageSize,
                    height: editorImageSize,
                    transform: [
                      { translateX },
                      { translateY },
                      { scale: cropScale },
                    ],
                  }}
                >
                  <FilteredImage
                    uri={imageUri}
                    width={editorImageSize}
                    height={editorImageSize}
                    filterName={filterName}
                  />
                </View>
              </View>
              {overlays.map((overlay) => (
                <View
                  key={overlay.id}
                  style={[
                    styles.overlay,
                    {
                      left: overlay.x,
                      top: overlay.y,
                      backgroundColor: getBackgroundColor(overlay),
                      borderRadius: overlay.style === "background" ? 4 : 0,
                    },
                  ]}
                >
                  <Text style={getOverlayTextStyle(overlay)}>
                    {overlay.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ViewShot>
      </View>
    )
  },
)
AestheticCapture.displayName = "AestheticCapture"

const styles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
  cropContainer: {
    width: SCREEN_WIDTH,
    height: CROP_HEIGHT,
    overflow: "hidden",
  },
  imageOffset: {
    position: "absolute",
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  zoomContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    padding: 8,
  },
})
