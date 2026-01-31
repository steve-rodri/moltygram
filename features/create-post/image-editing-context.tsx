import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

import { FilterName } from "@lib/components/filtered-image"
import { TextOverlayData } from "@lib/components/text-overlay"

import { ImageCropTransform } from "./types"

interface ImageEditingContextValue {
  imageFilters: FilterName[]
  setImageFilters: (filters: FilterName[]) => void
  imageIntensities: number[]
  setImageIntensities: (intensities: number[]) => void
  imageCrops: ImageCropTransform[]
  setImageCrops: (crops: ImageCropTransform[]) => void
  imageOverlays: TextOverlayData[][]
  setImageOverlays: (overlays: TextOverlayData[][]) => void
  resetEditing: () => void
}

const ImageEditingContext = createContext<ImageEditingContextValue | null>(null)

export function ImageEditingProvider({ children }: { children: ReactNode }) {
  const [imageFilters, setImageFilters] = useState<FilterName[]>([])
  const [imageIntensities, setImageIntensities] = useState<number[]>([])
  const [imageCrops, setImageCrops] = useState<ImageCropTransform[]>([])
  const [imageOverlays, setImageOverlays] = useState<TextOverlayData[][]>([])

  const resetEditing = useCallback(() => {
    setImageFilters([])
    setImageIntensities([])
    setImageCrops([])
    setImageOverlays([])
  }, [])

  return (
    <ImageEditingContext.Provider
      value={{
        imageFilters,
        setImageFilters,
        imageIntensities,
        setImageIntensities,
        imageCrops,
        setImageCrops,
        imageOverlays,
        setImageOverlays,
        resetEditing,
      }}
    >
      {children}
    </ImageEditingContext.Provider>
  )
}

export function useImageEditing() {
  const context = useContext(ImageEditingContext)
  if (!context) {
    throw new Error("useImageEditing must be used within ImageEditingProvider")
  }
  return context
}
