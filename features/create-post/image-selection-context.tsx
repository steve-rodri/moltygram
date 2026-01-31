import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

import { ImageContentFit, LetterboxColor } from "./types"

interface ImageSelectionContextValue {
  selectedImages: string[]
  setSelectedImages: (images: string[]) => void
  contentFit: ImageContentFit
  setContentFit: (fit: ImageContentFit) => void
  letterboxColor: LetterboxColor
  setLetterboxColor: (color: LetterboxColor) => void
  resetSelection: () => void
}

const ImageSelectionContext = createContext<ImageSelectionContextValue | null>(
  null,
)

export function ImageSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [contentFit, setContentFit] = useState<ImageContentFit>("contain")
  const [letterboxColor, setLetterboxColor] = useState<LetterboxColor>("black")

  const resetSelection = useCallback(() => {
    setSelectedImages([])
    setContentFit("contain")
    setLetterboxColor("black")
  }, [])

  return (
    <ImageSelectionContext.Provider
      value={{
        selectedImages,
        setSelectedImages,
        contentFit,
        setContentFit,
        letterboxColor,
        setLetterboxColor,
        resetSelection,
      }}
    >
      {children}
    </ImageSelectionContext.Provider>
  )
}

export function useImageSelection() {
  const context = useContext(ImageSelectionContext)
  if (!context) {
    throw new Error(
      "useImageSelection must be used within ImageSelectionProvider",
    )
  }
  return context
}
