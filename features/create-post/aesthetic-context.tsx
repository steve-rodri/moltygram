import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

import { FilterName } from "@lib/components/filtered-image"
import { TextOverlayData } from "@lib/components/text-overlay"

import { DEFAULT_CROP, ImageCropTransform } from "./types"

interface AestheticContextValue {
  aestheticImage: string | null
  setAestheticImage: (image: string | null) => void
  aestheticFilter: FilterName
  setAestheticFilter: (filter: FilterName) => void
  aestheticIntensity: number
  setAestheticIntensity: (intensity: number) => void
  aestheticCrop: ImageCropTransform
  setAestheticCrop: (crop: ImageCropTransform) => void
  aestheticCropY: number
  setAestheticCropY: (y: number) => void
  aestheticOverlays: TextOverlayData[]
  setAestheticOverlays: (overlays: TextOverlayData[]) => void
  resetAesthetic: () => void
}

const AestheticContext = createContext<AestheticContextValue | null>(null)

export function AestheticProvider({ children }: { children: ReactNode }) {
  const [aestheticImage, setAestheticImage] = useState<string | null>(null)
  const [aestheticFilter, setAestheticFilter] = useState<FilterName>("normal")
  const [aestheticIntensity, setAestheticIntensity] = useState(1)
  const [aestheticCrop, setAestheticCrop] =
    useState<ImageCropTransform>(DEFAULT_CROP)
  const [aestheticCropY, setAestheticCropY] = useState(0)
  const [aestheticOverlays, setAestheticOverlays] = useState<TextOverlayData[]>(
    [],
  )

  const resetAesthetic = useCallback(() => {
    setAestheticImage(null)
    setAestheticFilter("normal")
    setAestheticIntensity(1)
    setAestheticCrop(DEFAULT_CROP)
    setAestheticCropY(0)
    setAestheticOverlays([])
  }, [])

  return (
    <AestheticContext.Provider
      value={{
        aestheticImage,
        setAestheticImage,
        aestheticFilter,
        setAestheticFilter,
        aestheticIntensity,
        setAestheticIntensity,
        aestheticCrop,
        setAestheticCrop,
        aestheticCropY,
        setAestheticCropY,
        aestheticOverlays,
        setAestheticOverlays,
        resetAesthetic,
      }}
    >
      {children}
    </AestheticContext.Provider>
  )
}

export function useAesthetic() {
  const context = useContext(AestheticContext)
  if (!context) {
    throw new Error("useAesthetic must be used within AestheticProvider")
  }
  return context
}
