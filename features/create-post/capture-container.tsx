import { forwardRef, useImperativeHandle, useRef } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import ViewShot from "react-native-view-shot"

import {
  ImageContentFit,
  ImageCropTransform,
  LetterboxColor,
} from "@features/create-post/create-post-provider"
import { FilterName } from "@lib/components/filtered-image"
import { TextOverlayData } from "@lib/components/text-overlay"

import { CapturableImage } from "./capturable-image"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export interface CaptureContainerRef {
  captureAll: () => Promise<string[]>
}

interface CaptureContainerProps {
  images: string[]
  imageFilters: FilterName[]
  imageIntensities: number[]
  imageCrops: ImageCropTransform[]
  imageOverlays: TextOverlayData[][]
  contentFit?: ImageContentFit
  letterboxColor?: LetterboxColor
}

const DEFAULT_CROP: ImageCropTransform = { scale: 1, offsetX: 0, offsetY: 0 }

const hasCrop = (crop: ImageCropTransform) => {
  return crop.scale !== 1 || crop.offsetX !== 0 || crop.offsetY !== 0
}

export const CaptureContainer = forwardRef<
  CaptureContainerRef,
  CaptureContainerProps
>(function CaptureContainer(
  {
    images,
    imageFilters,
    imageIntensities,
    imageCrops,
    imageOverlays,
    contentFit = "contain",
    letterboxColor = "black",
  }: CaptureContainerProps,
  ref,
) {
  const captureRefs = useRef<(ViewShot | null)[]>([])

  useImperativeHandle(ref, () => ({
    captureAll: async () => {
      const results: string[] = []

      for (let i = 0; i < images.length; i++) {
        const filter = imageFilters[i] ?? "normal"
        const intensity = imageIntensities[i] ?? 1
        const crop = imageCrops[i] ?? DEFAULT_CROP
        const overlays = imageOverlays[i] ?? []
        const hasFilter = filter !== "normal" && intensity > 0
        const needsContainCapture = contentFit === "contain"
        const needsCapture =
          hasFilter ||
          overlays.length > 0 ||
          hasCrop(crop) ||
          needsContainCapture

        if (!needsCapture) {
          // No filter, overlays, crop, or contain mode - use original image
          results.push(images[i])
          continue
        }

        const captureRef = captureRefs.current[i]
        if (captureRef?.capture) {
          try {
            const uri = await captureRef.capture()
            if (uri) results.push(uri)
            else results.push(images[i])
          } catch {
            results.push(images[i])
          }
        } else {
          results.push(images[i])
        }
      }

      return results
    },
  }))

  return (
    <View style={styles.offscreen}>
      {images.map((uri, index) => (
        <CapturableImage
          key={`capture-${index}`}
          ref={(el) => {
            captureRefs.current[index] = el
          }}
          uri={uri}
          filterName={imageFilters[index] ?? "normal"}
          filterIntensity={imageIntensities[index] ?? 1}
          crop={imageCrops[index] ?? DEFAULT_CROP}
          overlays={imageOverlays[index] ?? []}
          size={SCREEN_WIDTH}
          contentFit={contentFit}
          letterboxColor={letterboxColor}
        />
      ))}
    </View>
  )
})
CaptureContainer.displayName = "CaptureContainer"

const styles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
})
