import { ReactNode, useCallback } from "react"

import { AestheticProvider, useAesthetic } from "./aesthetic-context"
import { CaptionProvider, useCaption } from "./caption-context"
import { ImageEditingProvider, useImageEditing } from "./image-editing-context"
import {
  ImageSelectionProvider,
  useImageSelection,
} from "./image-selection-context"

// Re-export types
export * from "./types"

// Re-export individual hooks
export { useAesthetic } from "./aesthetic-context"
export { useCaption } from "./caption-context"
export { useImageEditing } from "./image-editing-context"
export { useImageSelection } from "./image-selection-context"

// Combined provider that wraps all contexts
export function CreatePostProvider({ children }: { children: ReactNode }) {
  return (
    <ImageSelectionProvider>
      <ImageEditingProvider>
        <AestheticProvider>
          <CaptionProvider>{children}</CaptionProvider>
        </AestheticProvider>
      </ImageEditingProvider>
    </ImageSelectionProvider>
  )
}

// Backward-compatible hook that combines all contexts
export function useCreatePost() {
  const selection = useImageSelection()
  const editing = useImageEditing()
  const aesthetic = useAesthetic()
  const captionCtx = useCaption()

  const reset = useCallback(() => {
    selection.resetSelection()
    editing.resetEditing()
    aesthetic.resetAesthetic()
    captionCtx.resetCaption()
  }, [selection, editing, aesthetic, captionCtx])

  return {
    // Selection
    selectedImages: selection.selectedImages,
    setSelectedImages: selection.setSelectedImages,
    contentFit: selection.contentFit,
    setContentFit: selection.setContentFit,
    letterboxColor: selection.letterboxColor,
    setLetterboxColor: selection.setLetterboxColor,
    // Editing
    imageFilters: editing.imageFilters,
    setImageFilters: editing.setImageFilters,
    imageIntensities: editing.imageIntensities,
    setImageIntensities: editing.setImageIntensities,
    imageCrops: editing.imageCrops,
    setImageCrops: editing.setImageCrops,
    imageOverlays: editing.imageOverlays,
    setImageOverlays: editing.setImageOverlays,
    // Aesthetic
    aestheticImage: aesthetic.aestheticImage,
    setAestheticImage: aesthetic.setAestheticImage,
    aestheticFilter: aesthetic.aestheticFilter,
    setAestheticFilter: aesthetic.setAestheticFilter,
    aestheticIntensity: aesthetic.aestheticIntensity,
    setAestheticIntensity: aesthetic.setAestheticIntensity,
    aestheticCrop: aesthetic.aestheticCrop,
    setAestheticCrop: aesthetic.setAestheticCrop,
    aestheticCropY: aesthetic.aestheticCropY,
    setAestheticCropY: aesthetic.setAestheticCropY,
    aestheticOverlays: aesthetic.aestheticOverlays,
    setAestheticOverlays: aesthetic.setAestheticOverlays,
    // Caption
    caption: captionCtx.caption,
    setCaption: captionCtx.setCaption,
    // Cross-post
    crossPostToMoltbook: captionCtx.crossPostToMoltbook,
    setCrossPostToMoltbook: captionCtx.setCrossPostToMoltbook,
    // Combined reset
    reset,
  }
}
