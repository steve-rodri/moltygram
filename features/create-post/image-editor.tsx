import { useRef } from "react"
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import { FilterName } from "@lib/components/filtered-image"
import {
  DraggableText,
  StaticText,
  TextOverlayData,
} from "@lib/components/text-overlay"

import {
  ImageContentFit,
  ImageCropTransform,
  LetterboxColor,
} from "./create-post-provider"
import { FitIcon } from "./fit-icon"
import { ZoomableImage } from "./zoomable-image"

const LETTERBOX_COLORS = { black: "#000", white: "#fff" }

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface ImageEditorProps {
  images: string[]
  imageFilters: FilterName[]
  imageIntensities: number[]
  imageCrops: ImageCropTransform[]
  imageOverlays: TextOverlayData[][]
  currentImageIndex: number
  displayOverlays: TextOverlayData[]
  contentFit: ImageContentFit
  onContentFitToggle: () => void
  letterboxColor: LetterboxColor
  onLetterboxColorToggle: () => void
  onImageIndexChange: (index: number) => void
  onCropChange: (index: number, crop: ImageCropTransform) => void
  onTextPositionChange: (id: string, x: number, y: number) => void
  onEditText: (id: string) => void
  onAddText: () => void
  isEditable: boolean
  isEditingText: boolean
  showAddButton: boolean
  backgroundColor?: string
}

export function ImageEditor({
  images,
  imageFilters,
  imageIntensities,
  imageCrops,
  imageOverlays,
  currentImageIndex,
  displayOverlays,
  contentFit,
  onContentFitToggle,
  letterboxColor,
  onLetterboxColorToggle,
  onImageIndexChange,
  onCropChange,
  onTextPositionChange,
  onEditText,
  onAddText,
  isEditable,
  isEditingText,
  showAddButton,
  backgroundColor,
}: ImageEditorProps) {
  const scrollRef = useRef<ScrollView>(null)

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    if (index !== currentImageIndex && index >= 0 && index < images.length) {
      onImageIndexChange(index)
    }
  }

  const hasMultipleImages = images.length > 1
  const isContain = contentFit === "contain"
  const effectiveBackgroundColor = isContain
    ? LETTERBOX_COLORS[letterboxColor]
    : backgroundColor

  return (
    <View
      style={[styles.container, { backgroundColor: effectiveBackgroundColor }]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={hasMultipleImages && !isEditingText}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        pointerEvents={isEditingText ? "none" : "auto"}
      >
        {images.map((uri, index) => (
          <View key={uri} style={styles.imageWrapper}>
            <ZoomableImage
              uri={uri}
              size={SCREEN_WIDTH}
              filterName={imageFilters[index] ?? "normal"}
              filterIntensity={imageIntensities[index] ?? 1}
              crop={imageCrops[index] ?? { scale: 1, offsetX: 0, offsetY: 0 }}
              onCropChange={(crop) => onCropChange(index, crop)}
              disabled={!isEditable || isEditingText}
              backgroundColor={effectiveBackgroundColor}
              contentFit={contentFit}
            />
            {index !== currentImageIndex &&
              (imageOverlays[index] ?? []).map((overlay) => (
                <StaticText key={overlay.id} overlay={overlay} />
              ))}
          </View>
        ))}
      </ScrollView>

      {displayOverlays.map((overlay) => (
        <DraggableText
          key={overlay.id}
          overlay={overlay}
          onPositionChange={onTextPositionChange}
          onTap={onEditText}
          containerSize={SCREEN_WIDTH}
        />
      ))}

      {showAddButton && (
        <TouchableOpacity style={styles.addTextButton} onPress={onAddText}>
          <Text style={styles.addTextButtonText}>Aa</Text>
        </TouchableOpacity>
      )}

      {isEditable && (
        <TouchableOpacity
          style={styles.fitToggleButton}
          onPress={onContentFitToggle}
        >
          <FitIcon mode={contentFit} />
        </TouchableOpacity>
      )}

      {isEditable && isContain && (
        <TouchableOpacity
          style={styles.colorToggleButton}
          onPress={onLetterboxColorToggle}
        >
          <View
            style={[
              styles.colorToggleIcon,
              { backgroundColor: LETTERBOX_COLORS[letterboxColor] },
            ]}
          />
        </TouchableOpacity>
      )}

      {hasMultipleImages && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentImageIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  imageWrapper: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  addTextButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  addTextButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  fitToggleButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  colorToggleButton: {
    position: "absolute",
    bottom: 12,
    left: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  colorToggleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(128,128,128,0.8)",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: { backgroundColor: "#fff" },
})
