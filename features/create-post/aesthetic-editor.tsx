import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import { CropOverlay } from "@lib/components/crop-overlay"
import {
  FilteredImage,
  FilterName,
  FILTERS,
} from "@lib/components/filtered-image"
import { DraggableText, TextOverlayData } from "@lib/components/text-overlay"

import { ImageCropTransform } from "./create-post-provider"
import { ZoomableImage } from "./zoomable-image"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const FILTER_SIZE = (SCREEN_WIDTH - 56) / 4

interface AestheticEditorProps {
  imageUri: string
  filterName: FilterName
  crop: ImageCropTransform
  cropY: number
  overlays: TextOverlayData[]
  displayOverlays: TextOverlayData[]
  onSelectFilter: (filter: FilterName) => void
  onCropChange: (crop: ImageCropTransform) => void
  onCropYChange: (y: number) => void
  onAddText: () => void
  onEditText: (id: string) => void
  onTextPositionChange: (id: string, x: number, y: number) => void
  colors: { background: string; text: string; primary: string }
  bottomContent?: React.ReactNode
  hideAddButton?: boolean
}

export function AestheticEditor({
  imageUri,
  filterName,
  crop,
  cropY,
  overlays,
  displayOverlays,
  onSelectFilter,
  onCropChange,
  onCropYChange,
  onAddText,
  onEditText,
  onTextPositionChange,
  colors,
  bottomContent,
  hideAddButton,
}: AestheticEditorProps) {
  const topRow = FILTERS.slice(0, 6)
  const bottomRow = FILTERS.slice(6)

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <ZoomableImage
          uri={imageUri}
          size={SCREEN_WIDTH}
          filterName={filterName}
          crop={crop}
          onCropChange={onCropChange}
          disabled={hideAddButton}
        />
        {displayOverlays.map((overlay) => (
          <DraggableText
            key={overlay.id}
            overlay={overlay}
            onPositionChange={onTextPositionChange}
            onTap={onEditText}
            containerSize={SCREEN_WIDTH}
          />
        ))}
        <CropOverlay
          cropY={cropY}
          onCropChange={onCropYChange}
          imageSize={SCREEN_WIDTH}
          disabled={hideAddButton}
        />
        {!hideAddButton && (
          <TouchableOpacity style={styles.addTextButton} onPress={onAddText}>
            <Text style={styles.addTextButtonText}>Aa</Text>
          </TouchableOpacity>
        )}
      </View>

      {bottomContent ?? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Filters
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterList}
            contentContainerStyle={styles.filterContent}
          >
            <View style={styles.filterRows}>
              <View style={styles.filterRow}>
                {topRow.map((filter) => (
                  <TouchableOpacity
                    key={filter.name}
                    onPress={() => onSelectFilter(filter.name)}
                    style={styles.filterItem}
                  >
                    <FilteredImage
                      uri={imageUri}
                      width={FILTER_SIZE}
                      height={FILTER_SIZE}
                      filterName={filter.name}
                      borderRadius={8}
                      borderWidth={filterName === filter.name ? 2 : 0}
                      borderColor={colors.primary}
                    />
                    <Text style={[styles.filterLabel, { color: colors.text }]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.filterRow}>
                {bottomRow.map((filter) => (
                  <TouchableOpacity
                    key={filter.name}
                    onPress={() => onSelectFilter(filter.name)}
                    style={styles.filterItem}
                  >
                    <FilteredImage
                      uri={imageUri}
                      width={FILTER_SIZE}
                      height={FILTER_SIZE}
                      filterName={filter.name}
                      borderRadius={8}
                      borderWidth={filterName === filter.name ? 2 : 0}
                      borderColor={colors.primary}
                    />
                    <Text style={[styles.filterLabel, { color: colors.text }]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  addTextButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  addTextButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterList: { paddingHorizontal: 12, paddingBottom: 12 },
  filterContent: { paddingRight: 12 },
  filterRows: { gap: 12 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterItem: { alignItems: "center" },
  filterLabel: { fontSize: 11, marginTop: 4 },
})
