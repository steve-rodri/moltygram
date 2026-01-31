import {
  ActionSheetIOS,
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Image } from "expo-image"
import * as MediaLibrary from "expo-media-library"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"

import { ImageContentFit } from "./create-post-provider"
import { FitIcon } from "./fit-icon"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const GRID_SIZE = SCREEN_WIDTH / 4
const NUM_COLUMNS = 4

interface SelectStepProps {
  images: string[]
  selectedImages: string[]
  onToggleImage: (image: string) => void
  onEndReached?: () => void
  onPhotosChanged?: () => void
  contentFit: ImageContentFit
  onContentFitToggle: () => void
  colors: {
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    primary: string
  }
  renderBelowPreview?: () => React.ReactNode
  title?: string
  maxSelection?: number
}

export function SelectStep({
  images,
  selectedImages,
  onToggleImage,
  onEndReached,
  onPhotosChanged,
  contentFit,
  onContentFitToggle,
  colors,
  renderBelowPreview,
  title = "Recents",
  maxSelection = 5,
}: SelectStepProps) {
  function handleManagePress() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Select More Photos", "Change Settings"],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          await MediaLibrary.presentPermissionsPickerAsync()
          onPhotosChanged?.()
        } else if (buttonIndex === 2) {
          Linking.openSettings()
        }
      },
    )
  }

  function renderItem({ item }: { item: string }) {
    const selectionIndex = selectedImages.indexOf(item)
    const isSelected = selectionIndex !== -1

    return (
      <TouchableOpacity onPress={() => onToggleImage(item)}>
        <Image
          source={{ uri: item }}
          style={styles.gridImage}
          cachePolicy={IMAGE_CACHE_POLICY}
        />
        {isSelected && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{selectionIndex + 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.previewContainer}>
        {selectedImages.length > 0 ? (
          <Image
            source={{ uri: selectedImages[0] }}
            style={[styles.preview, { backgroundColor: colors.background }]}
            contentFit={contentFit}
            cachePolicy={IMAGE_CACHE_POLICY}
          />
        ) : (
          <View style={[styles.preview, { backgroundColor: colors.surface }]} />
        )}
        {selectedImages.length > 0 && (
          <TouchableOpacity
            style={styles.fitToggleButton}
            onPress={onContentFitToggle}
          >
            <FitIcon mode={contentFit} />
          </TouchableOpacity>
        )}
      </View>
      {renderBelowPreview?.()}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {onPhotosChanged && (
            <TouchableOpacity
              onPress={handleManagePress}
              style={styles.manageButton}
            >
              <Text style={[styles.manageText, { color: colors.primary }]}>
                Manage
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {maxSelection > 1 && (
          <Text style={[styles.counter, { color: colors.textSecondary }]}>
            {selectedImages.length}/{maxSelection}
          </Text>
        )}
      </View>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={NUM_COLUMNS}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  previewContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  preview: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  fitToggleButton: {
    position: "absolute",
    bottom: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 14, fontWeight: "600" },
  manageButton: { paddingVertical: 2 },
  manageText: { fontSize: 13 },
  counter: { fontSize: 14 },
  gridImage: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    borderWidth: 0.5,
    borderColor: "transparent",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
})
