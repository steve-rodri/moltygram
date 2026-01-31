import { useState } from "react"
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native"

import { SkeletonImage } from "@lib/components/skeleton-image"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface PostCarouselProps {
  images: string[]
  onImageTap: () => void
}

export function PostCarousel({ images, onImageTap }: PostCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / SCREEN_WIDTH)
    setCurrentIndex(index)
  }

  return (
    <View className="relative">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={images.length > 1}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={onImageTap}
          >
            <SkeletonImage
              source={{ uri: image }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {images.map((_, index) => (
            <View
              key={index}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  index === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </View>
      )}
    </View>
  )
}
