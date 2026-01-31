import { useState } from "react"
import { Dimensions, LayoutChangeEvent, View, ViewStyle } from "react-native"
import { Image } from "expo-image"
import { User } from "lucide-react-native"

import { IMAGE_CACHE_POLICY, IMAGE_TRANSITION_MS } from "@lib/constants/image"

import { ImageTransform } from "./mock-data"

interface TransformedImageProps {
  uri: string
  transform?: ImageTransform
  containerStyle: ViewStyle
  placeholderColor?: string
  placeholderIconColor?: string
}

const SCREEN_WIDTH = Dimensions.get("window").width
const EDIT_FRAME_WIDTH = SCREEN_WIDTH - 48

export function TransformedImage({
  uri,
  transform,
  containerStyle,
  placeholderColor,
  placeholderIconColor,
}: TransformedImageProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 })
  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const handleLayout = (e: LayoutChangeEvent) => {
    setLayout(e.nativeEvent.layout)
  }

  if (!uri) {
    return (
      <View
        style={[
          containerStyle,
          placeholderColor && { backgroundColor: placeholderColor },
        ]}
        onLayout={handleLayout}
      >
        {placeholderIconColor && layout.width > 0 && (
          <View className="flex-1 items-center justify-center">
            <User size={layout.width * 0.5} color={placeholderIconColor} />
          </View>
        )}
      </View>
    )
  }

  // If no transform, use simple cover image
  if (!transform) {
    return (
      <View style={containerStyle} onLayout={handleLayout}>
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy={IMAGE_CACHE_POLICY}
          transition={IMAGE_TRANSITION_MS}
        />
      </View>
    )
  }

  const handleImageLoad = (e: {
    source: { width: number; height: number }
  }) => {
    setImageDimensions({ width: e.source.width, height: e.source.height })
  }

  const { scale, offsetX, offsetY, rotation } = transform

  // Determine if this is a profile (square) or cover (wide) container
  const containerAspectRatio = layout.width / layout.height
  const isProfile = Math.abs(containerAspectRatio - 1) < 0.1

  // Calculate how the image was displayed in the editor (must match edit-photo.tsx logic)
  const getEditorDisplaySize = () => {
    if (!imageDimensions)
      return { width: EDIT_FRAME_WIDTH, height: EDIT_FRAME_WIDTH }
    const imgAspect = imageDimensions.width / imageDimensions.height
    const frameHeight = isProfile
      ? EDIT_FRAME_WIDTH
      : EDIT_FRAME_WIDTH / (16 / 9)
    const frameRatio = EDIT_FRAME_WIDTH / frameHeight

    if (isProfile) {
      if (imgAspect > frameRatio) {
        return { width: EDIT_FRAME_WIDTH, height: EDIT_FRAME_WIDTH / imgAspect }
      } else {
        return { width: frameHeight * imgAspect, height: frameHeight }
      }
    } else {
      // Backdrop: always fill frame width
      return { width: EDIT_FRAME_WIDTH, height: EDIT_FRAME_WIDTH / imgAspect }
    }
  }

  const editorSize = getEditorDisplaySize()

  // Convert from zoomed scroll offset to original coordinates
  const originalOffsetX = offsetX / scale
  const originalOffsetY = offsetY / scale

  // Visible region in editor coordinates
  const visibleWidth = EDIT_FRAME_WIDTH / scale

  // Scale to fit the container
  const displayScale = layout.width / visibleWidth

  // Final image size for display
  const displayWidth = editorSize.width * displayScale
  const displayHeight = editorSize.height * displayScale

  const rawTranslateX = -originalOffsetX * displayScale
  const rawTranslateY = -originalOffsetY * displayScale

  // For backdrop images, don't allow positive translateX (would create left gap)
  const translateX = isProfile ? rawTranslateX : Math.min(0, rawTranslateX)
  const translateY = rawTranslateY

  // Show loading placeholder while getting image dimensions
  if (!imageDimensions) {
    return (
      <View
        style={[containerStyle, { overflow: "hidden" }]}
        onLayout={handleLayout}
      >
        <Image
          source={{ uri }}
          style={{ width: 1, height: 1, opacity: 0 }}
          onLoad={handleImageLoad}
        />
      </View>
    )
  }

  return (
    <View
      style={[containerStyle, { overflow: "hidden" }]}
      onLayout={handleLayout}
    >
      {layout.width > 0 && (
        <Image
          source={{ uri }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: displayWidth,
            height: displayHeight,
            transform: [
              { translateX },
              { translateY },
              { rotate: `${rotation}deg` },
            ],
          }}
          contentFit="contain"
          cachePolicy={IMAGE_CACHE_POLICY}
          onLoad={handleImageLoad}
        />
      )}
    </View>
  )
}
