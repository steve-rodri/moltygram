import { useLayoutEffect } from "react"
import { Text, TouchableOpacity } from "react-native"
import { useNavigation, useRouter } from "expo-router"

import { useCreatePost } from "@features/create-post/create-post-provider"
import { useTextEditing } from "@features/create-post/use-text-editing"
import { TextOverlayData } from "@lib/components/text-overlay"
import { TextStylePanel } from "@lib/components/text-style-panel"
import { useTheme } from "@lib/contexts/theme-context"

import { AestheticEditor } from "../../features/create-post/aesthetic-editor"

export default function CreateAestheticEditScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const {
    aestheticImage,
    aestheticFilter,
    setAestheticFilter,
    aestheticCrop,
    setAestheticCrop,
    aestheticCropY,
    setAestheticCropY,
    aestheticOverlays,
    setAestheticOverlays,
  } = useCreatePost()

  const setAestheticOverlaysUpdater = (
    updater: (prev: TextOverlayData[]) => TextOverlayData[],
  ) => {
    setAestheticOverlays(updater(aestheticOverlays))
  }

  const textEditing = useTextEditing(
    aestheticOverlays,
    setAestheticOverlaysUpdater,
  )

  const handleDone = () => {
    router.navigate("/create/post?step=caption")
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Edit Aesthetic",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleDone}
          disabled={textEditing.isEditing}
          style={{ paddingHorizontal: 16 }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              opacity: textEditing.isEditing ? 0.5 : 1,
            }}
          >
            Done
          </Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, colors, textEditing.isEditing])

  if (!aestheticImage) return null

  const displayOverlays = textEditing.editingOverlay
    ? [...aestheticOverlays, textEditing.editingOverlay]
    : aestheticOverlays

  const bottomContent = textEditing.isEditing ? (
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
  ) : undefined

  return (
    <AestheticEditor
      imageUri={aestheticImage}
      filterName={aestheticFilter}
      crop={aestheticCrop}
      cropY={aestheticCropY}
      overlays={aestheticOverlays}
      displayOverlays={displayOverlays}
      onSelectFilter={setAestheticFilter}
      onCropChange={setAestheticCrop}
      onCropYChange={setAestheticCropY}
      onAddText={textEditing.handleAddText}
      onEditText={textEditing.handleEditText}
      onTextPositionChange={textEditing.handlePositionChange}
      colors={colors}
      bottomContent={bottomContent}
      hideAddButton={textEditing.isEditing}
    />
  )
}
