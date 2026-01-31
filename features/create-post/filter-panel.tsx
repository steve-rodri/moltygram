import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Slider from "@react-native-community/slider"

import {
  FilteredImage,
  FilterName,
  FILTERS,
} from "@lib/components/filtered-image"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const FILTER_SIZE = (SCREEN_WIDTH - 56) / 4

interface FilterPanelProps {
  currentUri: string
  currentFilter: FilterName
  currentIntensity: number
  onSelectFilter: (filter: FilterName) => void
  onIntensityChange: (intensity: number) => void
  colors: {
    text: string
    textSecondary: string
    primary: string
    background: string
    surface: string
  }
  bottomInset?: number
}

export function FilterPanel({
  currentUri,
  currentFilter,
  currentIntensity,
  onSelectFilter,
  onIntensityChange,
  colors,
}: FilterPanelProps) {
  const topRow = FILTERS.slice(0, 6)
  const bottomRow = FILTERS.slice(6)
  const showIntensity = currentFilter !== "normal"

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Filters</Text>
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
                  uri={currentUri}
                  width={FILTER_SIZE}
                  height={FILTER_SIZE}
                  filterName={filter.name}
                  borderRadius={8}
                  borderWidth={currentFilter === filter.name ? 2 : 0}
                  borderColor={colors.primary}
                  contentFit="cover"
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
                  uri={currentUri}
                  width={FILTER_SIZE}
                  height={FILTER_SIZE}
                  filterName={filter.name}
                  borderRadius={8}
                  borderWidth={currentFilter === filter.name ? 2 : 0}
                  borderColor={colors.primary}
                  contentFit="cover"
                />
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.intensityContainer]}>
        {showIntensity ? (
          <>
            <Text
              style={[styles.intensityLabel, { color: colors.textSecondary }]}
            >
              Intensity
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={currentIntensity}
              onValueChange={onIntensityChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.textSecondary}
              thumbTintColor={colors.primary}
              tapToSeek
            />
            <Text
              style={[styles.intensityValue, { color: colors.textSecondary }]}
            >
              {Math.round(currentIntensity * 100)}%
            </Text>
          </>
        ) : (
          <View style={{ height: 40 }} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
  intensityContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  intensityLabel: { fontSize: 13, width: 60 },
  slider: { flex: 1, height: 40 },
  intensityValue: { fontSize: 13, width: 40, textAlign: "right" },
})
