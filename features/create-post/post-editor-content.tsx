import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

import { FilterName } from "@lib/components/filtered-image"
import { TextOverlayData } from "@lib/components/text-overlay"
import { TextStylePanel } from "@lib/components/text-style-panel"
import { useTheme } from "@lib/contexts/theme-context"

import { AestheticBanner } from "./aesthetic-banner"
import { AestheticCapture } from "./aesthetic-capture"
import { CaptionPanel } from "./caption-panel"
import { CaptureContainer } from "./capture-container"
import {
  ImageCropTransform,
  useCreatePost as useCreatePostContext,
} from "./create-post-provider"
import { FilterPanel } from "./filter-panel"
import { ImageEditor } from "./image-editor"
import { usePostSubmission } from "./use-post-submission"
import { useTextEditing } from "./use-text-editing"

type Step = "edit" | "caption"

export interface PostEditorContentRef {
  handlePost: () => Promise<void>
  isPending: boolean
}

interface PostEditorContentProps {
  initialStep?: Step
  onStepChange: (step: Step) => void
  onPendingChange?: (isPending: boolean) => void
}

export const PostEditorContent = forwardRef<
  PostEditorContentRef,
  PostEditorContentProps
>(function PostEditorContent(
  { initialStep, onStepChange, onPendingChange },
  ref,
) {
  const router = useRouter()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const ctx = useCreatePostContext()
  const step = initialStep === "caption" ? "caption" : "edit"
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { captureRef, aestheticCaptureRef, handlePost, isPending } =
    usePostSubmission({
      selectedImages: ctx.selectedImages,
      caption: ctx.caption,
      aestheticImage: ctx.aestheticImage,
      reset: ctx.reset,
    })

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  useImperativeHandle(ref, () => ({ handlePost, isPending }), [
    handlePost,
    isPending,
  ])

  const currentOverlays = ctx.imageOverlays[currentImageIndex] ?? []

  const setCurrentFilter = (filter: FilterName) => {
    ctx.setImageFilters(
      ctx.imageFilters.map((f, i) => (i === currentImageIndex ? filter : f)),
    )
  }

  const setCurrentIntensity = (intensity: number) => {
    ctx.setImageIntensities(
      ctx.imageIntensities.map((v, i) =>
        i === currentImageIndex ? intensity : v,
      ),
    )
  }

  const setCurrentOverlays = (
    updater: (prev: TextOverlayData[]) => TextOverlayData[],
  ) => {
    const newOverlays = ctx.selectedImages.map((_, i) => {
      const existing = ctx.imageOverlays[i] ?? []
      return i === currentImageIndex ? updater(existing) : existing
    })
    ctx.setImageOverlays(newOverlays)
  }

  const handleCropChange = (index: number, crop: ImageCropTransform) => {
    ctx.setImageCrops(ctx.imageCrops.map((c, i) => (i === index ? crop : c)))
  }

  const textEditing = useTextEditing(currentOverlays, setCurrentOverlays)

  // Auto-save text edits when navigating away from edit step
  useEffect(() => {
    if (initialStep === "caption" && textEditing.isEditing) {
      textEditing.handleDone()
    }
  }, [initialStep])

  const displayOverlays = textEditing.editingOverlay
    ? [...currentOverlays, textEditing.editingOverlay]
    : currentOverlays

  const aesthetic = ctx.aestheticImage
    ? {
        image: ctx.aestheticImage,
        filter: ctx.aestheticFilter,
        crop: ctx.aestheticCrop,
        cropY: ctx.aestheticCropY,
        overlays: ctx.aestheticOverlays,
      }
    : undefined

  const isEditing = step === "edit"

  return (
    <View className="flex-1 bg-surface">
      <CaptureContainer
        ref={captureRef}
        images={ctx.selectedImages}
        imageFilters={ctx.imageFilters}
        imageIntensities={ctx.imageIntensities}
        imageCrops={ctx.imageCrops}
        imageOverlays={ctx.imageOverlays}
        contentFit={ctx.contentFit}
        letterboxColor={ctx.letterboxColor}
      />
      {ctx.aestheticImage && (
        <AestheticCapture
          ref={aestheticCaptureRef}
          imageUri={ctx.aestheticImage}
          filterName={ctx.aestheticFilter}
          crop={ctx.aestheticCrop}
          cropY={ctx.aestheticCropY}
          overlays={ctx.aestheticOverlays}
        />
      )}

      {!isEditing && (
        <AestheticBanner
          aesthetic={aesthetic}
          onAdd={() => {
            ctx.setAestheticImage(null)
            router.push("/create/aesthetic-select")
          }}
          onEdit={() => router.push("/create/aesthetic-edit")}
          onRemove={() => {
            ctx.setAestheticImage(null)
            ctx.setAestheticFilter("normal")
            ctx.setAestheticCrop({ scale: 1, offsetX: 0, offsetY: 0 })
            ctx.setAestheticCropY(0)
            ctx.setAestheticOverlays([])
          }}
          colors={colors}
        />
      )}

      <ImageEditor
        images={ctx.selectedImages}
        imageFilters={ctx.imageFilters}
        imageIntensities={ctx.imageIntensities}
        imageCrops={ctx.imageCrops}
        imageOverlays={ctx.imageOverlays}
        currentImageIndex={currentImageIndex}
        displayOverlays={displayOverlays}
        contentFit={ctx.contentFit}
        onContentFitToggle={() =>
          ctx.setContentFit(ctx.contentFit === "contain" ? "cover" : "contain")
        }
        letterboxColor={ctx.letterboxColor}
        onLetterboxColorToggle={() =>
          ctx.setLetterboxColor(
            ctx.letterboxColor === "black" ? "white" : "black",
          )
        }
        onImageIndexChange={setCurrentImageIndex}
        onCropChange={handleCropChange}
        onTextPositionChange={textEditing.handlePositionChange}
        onEditText={textEditing.handleEditText}
        onAddText={textEditing.handleAddText}
        isEditable={isEditing && !textEditing.isEditing}
        isEditingText={textEditing.isEditing || displayOverlays.length > 0}
        showAddButton={isEditing && !textEditing.isEditing}
        backgroundColor={colors.background}
      />

      {isEditing ? (
        textEditing.isEditing ? (
          <TextStylePanel
            textValue={textEditing.textInputValue}
            font={textEditing.textFont}
            size={textEditing.textSize}
            color={textEditing.textColor}
            style={textEditing.textStyle}
            colors={colors}
            onTextChange={textEditing.setTextInputValue}
            onFontChange={textEditing.setTextFont}
            onSizeChange={textEditing.setTextSize}
            onColorChange={textEditing.setTextColor}
            onStyleChange={textEditing.setTextStyle}
            onDone={textEditing.handleDone}
            onDelete={textEditing.handleDelete}
            showDelete={!!textEditing.editingOriginalId}
          />
        ) : (
          <FilterPanel
            currentUri={ctx.selectedImages[currentImageIndex]}
            currentFilter={ctx.imageFilters[currentImageIndex] ?? "normal"}
            currentIntensity={ctx.imageIntensities[currentImageIndex] ?? 1}
            onSelectFilter={setCurrentFilter}
            onIntensityChange={setCurrentIntensity}
            colors={colors}
            bottomInset={insets.bottom}
          />
        )
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <CaptionPanel
            caption={ctx.caption}
            onCaptionChange={ctx.setCaption}
            colors={colors}
          />
        </ScrollView>
      )}
    </View>
  )
})

export { type Step }
