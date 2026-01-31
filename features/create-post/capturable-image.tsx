import { forwardRef } from "react"
import { StyleSheet, Text, View } from "react-native"
import ViewShot from "react-native-view-shot"

import {
  ImageContentFit,
  ImageCropTransform,
  LetterboxColor,
} from "@features/create-post/create-post-provider"
import { FilteredImage, FilterName } from "@lib/components/filtered-image"
import { FONT_FAMILIES, TextOverlayData } from "@lib/components/text-overlay"

interface CapturableImageProps {
  uri: string
  filterName: FilterName
  filterIntensity?: number
  crop: ImageCropTransform
  overlays: TextOverlayData[]
  size: number
  captureScale?: number
  contentFit?: ImageContentFit
  letterboxColor?: LetterboxColor
}

const DEFAULT_CAPTURE_SCALE = 2
const IMAGE_SCALE = 1.5 // Same as ZoomableImage

function getScaledTextStyle(overlay: TextOverlayData, scale: number) {
  const fontConfig =
    FONT_FAMILIES.find((f) => f.value === overlay.fontFamily) ??
    FONT_FAMILIES[0]

  const textStyle: any = {
    color: overlay.color,
    fontSize: overlay.textSize * scale,
    fontFamily: fontConfig.fontFamily,
    fontWeight: "700" as const,
  }

  if (overlay.style === "outline") {
    textStyle.textShadowColor =
      overlay.color === "#000000" ? "#FFFFFF" : "#000000"
    textStyle.textShadowOffset = { width: 0, height: 0 }
    textStyle.textShadowRadius = 2 * scale
  } else if (overlay.style === "none") {
    textStyle.textShadowColor = "rgba(0, 0, 0, 0.75)"
    textStyle.textShadowOffset = { width: scale, height: scale }
    textStyle.textShadowRadius = 3 * scale
  }

  return textStyle
}

function getBackgroundColor(overlay: TextOverlayData): string {
  if (overlay.style !== "background") return "transparent"
  return overlay.color === "#000000"
    ? "rgba(255,255,255,0.8)"
    : "rgba(0,0,0,0.6)"
}

const LETTERBOX_COLORS = { black: "#000", white: "#fff" }

export const CapturableImage = forwardRef<ViewShot, CapturableImageProps>(
  function CapturableImage(
    {
      uri,
      filterName,
      filterIntensity = 1,
      crop,
      overlays,
      size,
      captureScale = DEFAULT_CAPTURE_SCALE,
      contentFit = "contain",
      letterboxColor = "black",
    }: CapturableImageProps,
    ref,
  ) {
    const captureSize = size * captureScale

    // For contain mode, use simple centered layout with contentFit
    if (contentFit === "contain") {
      return (
        <ViewShot ref={ref} options={{ format: "png", quality: 1.0 }}>
          <View
            style={[
              styles.container,
              {
                width: captureSize,
                height: captureSize,
                backgroundColor: LETTERBOX_COLORS[letterboxColor],
              },
            ]}
          >
            <FilteredImage
              uri={uri}
              width={captureSize}
              height={captureSize}
              filterName={filterName}
              intensity={filterIntensity}
              contentFit="contain"
            />
            {overlays.map((overlay) => (
              <View
                key={overlay.id}
                style={[
                  styles.overlay,
                  {
                    left: overlay.x * captureScale,
                    top: overlay.y * captureScale,
                    padding: 8 * captureScale,
                    backgroundColor: getBackgroundColor(overlay),
                    borderRadius:
                      overlay.style === "background" ? 4 * captureScale : 0,
                  },
                ]}
              >
                <Text style={getScaledTextStyle(overlay, captureScale)}>
                  {overlay.text}
                </Text>
              </View>
            ))}
          </View>
        </ViewShot>
      )
    }

    // Cover mode: use crop transforms to fill the frame
    const { scale: cropScale, offsetX, offsetY } = crop
    const editorImageSize = size * IMAGE_SCALE
    const centerOffset = (editorImageSize - size) / 2

    const isDefaultCrop = cropScale === 1 && offsetX === 0 && offsetY === 0
    const effectiveOffsetX = isDefaultCrop ? centerOffset : offsetX
    const effectiveOffsetY = isDefaultCrop ? centerOffset : offsetY

    const originalOffsetX = effectiveOffsetX / cropScale
    const originalOffsetY = effectiveOffsetY / cropScale

    const visibleSize = size / cropScale
    const displayScale = captureSize / visibleSize
    const displayImageSize = editorImageSize * displayScale

    const translateX = -originalOffsetX * displayScale
    const translateY = -originalOffsetY * displayScale

    return (
      <ViewShot ref={ref} options={{ format: "png", quality: 1.0 }}>
        <View
          style={[
            styles.container,
            { width: captureSize, height: captureSize },
          ]}
        >
          <View
            style={{
              width: displayImageSize,
              height: displayImageSize,
              transform: [{ translateX }, { translateY }],
            }}
          >
            <FilteredImage
              uri={uri}
              width={displayImageSize}
              height={displayImageSize}
              filterName={filterName}
              intensity={filterIntensity}
            />
          </View>
          {overlays.map((overlay) => (
            <View
              key={overlay.id}
              style={[
                styles.overlay,
                {
                  left: overlay.x * captureScale,
                  top: overlay.y * captureScale,
                  padding: 8 * captureScale,
                  backgroundColor: getBackgroundColor(overlay),
                  borderRadius:
                    overlay.style === "background" ? 4 * captureScale : 0,
                },
              ]}
            >
              <Text style={getScaledTextStyle(overlay, captureScale)}>
                {overlay.text}
              </Text>
            </View>
          ))}
        </View>
      </ViewShot>
    )
  },
)
CapturableImage.displayName = "CapturableImage"

const styles = StyleSheet.create({
  container: { position: "relative", overflow: "hidden" },
  overlay: { position: "absolute" },
})
