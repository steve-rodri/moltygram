import { FilterName } from "@lib/components/filtered-image"
import { TextOverlayData } from "@lib/components/text-overlay"

export type ImageContentFit = "contain" | "cover"
export type LetterboxColor = "black" | "white"

export interface ImageCropTransform {
  scale: number
  offsetX: number
  offsetY: number
}

export const DEFAULT_CROP: ImageCropTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

// Re-export for convenience
export type { FilterName, TextOverlayData }
