import { View } from "react-native"
import { Image } from "expo-image"

import { IMAGE_CACHE_POLICY } from "../constants/image"

export type FilterName =
  | "normal"
  | "clarendon"
  | "gingham"
  | "moon"
  | "lark"
  | "reyes"
  | "juno"
  | "slumber"
  | "crema"
  | "aden"
  | "perpetua"
  | "ludwig"
  | "2016"

interface FilterOverlay {
  color: string
  opacity: number
}

interface FilterConfig {
  name: FilterName
  label: string
  overlays: FilterOverlay[]
  imageStyle?: { opacity?: number }
}

export const FILTERS: FilterConfig[] = [
  { name: "normal", label: "Normal", overlays: [] },
  {
    name: "clarendon",
    label: "Clarendon",
    overlays: [{ color: "#4a90d9", opacity: 0.25 }],
  },
  {
    name: "gingham",
    label: "Gingham",
    overlays: [{ color: "#f0f0ff", opacity: 0.35 }],
    imageStyle: { opacity: 0.85 },
  },
  {
    name: "moon",
    label: "Moon",
    overlays: [{ color: "#808080", opacity: 0.5 }],
    imageStyle: { opacity: 0.9 },
  },
  {
    name: "lark",
    label: "Lark",
    overlays: [{ color: "#c8e6c9", opacity: 0.3 }],
  },
  {
    name: "reyes",
    label: "Reyes",
    overlays: [{ color: "#e8c39e", opacity: 0.4 }],
  },
  {
    name: "juno",
    label: "Juno",
    overlays: [{ color: "#ff9500", opacity: 0.25 }],
  },
  {
    name: "slumber",
    label: "Slumber",
    overlays: [{ color: "#3d3d6b", opacity: 0.35 }],
  },
  {
    name: "crema",
    label: "Crema",
    overlays: [{ color: "#f5deb3", opacity: 0.35 }],
  },
  {
    name: "aden",
    label: "Aden",
    overlays: [{ color: "#ff69b4", opacity: 0.2 }],
  },
  {
    name: "perpetua",
    label: "Perpetua",
    overlays: [{ color: "#20b2aa", opacity: 0.25 }],
  },
  {
    name: "ludwig",
    label: "Ludwig",
    overlays: [{ color: "#8b4513", opacity: 0.3 }],
  },
  {
    name: "2016",
    label: "2016",
    overlays: [{ color: "#9B4DCA", opacity: 0.22 }],
    imageStyle: { opacity: 0.92 },
  },
]

function getFilterConfig(filterName: FilterName): FilterConfig {
  return FILTERS.find((f) => f.name === filterName) ?? FILTERS[0]
}

interface FilteredImageProps {
  uri: string
  width: number
  height: number
  filterName: FilterName
  intensity?: number
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  contentFit?: "contain" | "cover"
}

export function FilteredImage({
  uri,
  width,
  height,
  filterName,
  intensity = 1,
  borderRadius,
  borderWidth,
  borderColor,
  contentFit = "contain",
}: FilteredImageProps) {
  const config = getFilterConfig(filterName)
  const baseImageOpacity = config.imageStyle?.opacity
  const imageOpacity =
    baseImageOpacity !== undefined
      ? 1 - (1 - baseImageOpacity) * intensity
      : undefined

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        overflow: "hidden",
        borderWidth,
        borderColor,
      }}
    >
      <Image
        source={{ uri }}
        style={{ width, height, opacity: imageOpacity }}
        contentFit={contentFit}
        cachePolicy={IMAGE_CACHE_POLICY}
      />
      {config.overlays.map((overlay, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlay.color,
            opacity: overlay.opacity * intensity,
          }}
        />
      ))}
    </View>
  )
}
