import { StyleProp } from "react-native"
import { Image, ImageStyle } from "expo-image"

import {
  DEFAULT_BLURHASH,
  IMAGE_CACHE_POLICY,
  IMAGE_TRANSITION_MS,
} from "../constants/image"

interface SkeletonImageProps {
  source: { uri: string }
  style?: StyleProp<ImageStyle>
}

export function SkeletonImage({ source, style }: SkeletonImageProps) {
  return (
    <Image
      source={source}
      style={style}
      placeholder={{ blurhash: DEFAULT_BLURHASH }}
      placeholderContentFit="cover"
      transition={IMAGE_TRANSITION_MS}
      cachePolicy={IMAGE_CACHE_POLICY}
      contentFit="cover"
    />
  )
}
