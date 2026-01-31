import { useEffect, useRef, useState } from "react"
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { Image } from "expo-image"

import {
  ImageContentFit,
  ImageCropTransform,
} from "@features/create-post/create-post-provider"
import { FilteredImage, FilterName } from "@lib/components/filtered-image"

interface ZoomableImageProps {
  uri: string
  size: number
  filterName: FilterName
  filterIntensity?: number
  crop: ImageCropTransform
  onCropChange: (crop: ImageCropTransform) => void
  disabled?: boolean
  backgroundColor?: string
  contentFit?: ImageContentFit
}

export function ZoomableImage({
  uri,
  size,
  filterName,
  filterIntensity = 1,
  crop,
  onCropChange,
  disabled,
  backgroundColor = "#000",
  contentFit = "contain",
}: ZoomableImageProps) {
  const scrollRef = useRef<ScrollView>(null)
  const [isZooming, setIsZooming] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const handleImageLoad = (e: {
    source: { width: number; height: number }
  }) => {
    setImageDimensions({ width: e.source.width, height: e.source.height })
  }

  // Reset zoom when uri or contentFit changes
  useEffect(() => {
    if (!imageDimensions) return

    setTimeout(() => {
      ;(scrollRef.current as any)?.setNativeProps?.({ zoomScale: 1 })
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false })
      onCropChange({ scale: 1, offsetX: 0, offsetY: 0 })
    }, 50)
  }, [uri, imageDimensions, contentFit])

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, zoomScale } = e.nativeEvent
    onCropChange({
      scale: zoomScale,
      offsetX: contentOffset.x,
      offsetY: contentOffset.y,
    })
  }

  if (!imageDimensions) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, backgroundColor },
        ]}
      >
        <Image
          source={{ uri }}
          style={styles.hidden}
          onLoad={handleImageLoad}
        />
      </View>
    )
  }

  // Use size x size and let expo-image handle contentFit natively (like SelectStep)
  const imageWidth = size
  const imageHeight = size

  return (
    <View
      style={[styles.container, { width: size, height: size, backgroundColor }]}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={() => setIsZooming(true)}
        onScrollEndDrag={() => setIsZooming(false)}
        onMomentumScrollEnd={() => setIsZooming(false)}
        scrollEventThrottle={16}
        bounces={false}
        bouncesZoom={false}
        decelerationRate="fast"
        scrollEnabled={!disabled}
        pinchGestureEnabled={!disabled}
        centerContent
      >
        <FilteredImage
          uri={uri}
          width={imageWidth}
          height={imageHeight}
          filterName={filterName}
          intensity={filterIntensity}
          contentFit={contentFit}
        />
      </ScrollView>

      {isZooming && <GridOverlay size={size} />}
    </View>
  )
}

function GridOverlay({ size }: { size: number }) {
  const thirdSize = size / 3

  return (
    <View
      style={[styles.gridOverlay, { width: size, height: size }]}
      pointerEvents="none"
    >
      <View style={[styles.gridLine, styles.vertical, { left: thirdSize }]} />
      <View
        style={[styles.gridLine, styles.vertical, { left: thirdSize * 2 }]}
      />
      <View style={[styles.gridLine, styles.horizontal, { top: thirdSize }]} />
      <View
        style={[styles.gridLine, styles.horizontal, { top: thirdSize * 2 }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  hidden: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  vertical: {
    width: 1,
    top: 0,
    bottom: 0,
  },
  horizontal: {
    height: 1,
    left: 0,
    right: 0,
  },
})
