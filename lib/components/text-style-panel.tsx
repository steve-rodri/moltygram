import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Slider from "@react-native-community/slider"

import {
  FONT_FAMILIES,
  FontFamily,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  TEXT_COLORS,
  TextStyle,
} from "./text-overlay"

interface TextStylePanelProps {
  textValue: string
  font: FontFamily
  size: number
  color: string
  style: TextStyle
  colors: {
    background: string
    surface: string
    text: string
    textSecondary: string
    textTertiary: string
    border: string
    primary: string
  }
  onTextChange: (text: string) => void
  onFontChange: (font: FontFamily) => void
  onSizeChange: (size: number) => void
  onColorChange: (color: string) => void
  onStyleChange: (style: TextStyle) => void
  onDone: () => void
  onDelete: () => void
  showDelete: boolean
}

export function TextStylePanel({
  textValue,
  font,
  size,
  color,
  style,
  colors,
  onTextChange,
  onFontChange,
  onSizeChange,
  onColorChange,
  onStyleChange,
  onDone,
  onDelete,
  showDelete,
}: TextStylePanelProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {showDelete ? (
          <TouchableOpacity onPress={onDelete}>
            <Text style={{ color: "#FF3B30", fontSize: 16 }}>Delete</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
        <Text style={[styles.title, { color: colors.text }]}>Edit Text</Text>
        <TouchableOpacity onPress={onDone}>
          <Text
            style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TextInput
          value={textValue}
          onChangeText={onTextChange}
          placeholder="Enter text..."
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Font
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fontRow}
          style={styles.fontScroll}
        >
          {FONT_FAMILIES.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.chip,
                { borderColor: colors.border },
                font === f.value && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => onFontChange(f.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: font === f.value ? "#fff" : colors.text },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Size
        </Text>
        <View style={styles.sliderRow}>
          <Slider
            style={styles.slider}
            minimumValue={MIN_TEXT_SIZE}
            maximumValue={MAX_TEXT_SIZE}
            step={1}
            value={size}
            onValueChange={onSizeChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            tapToSeek
          />
          <Text style={[styles.sizeValue, { color: colors.text }]}>{size}</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Color
        </Text>
        <View style={styles.colorRow}>
          {TEXT_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.swatch,
                { backgroundColor: c },
                color === c && styles.swatchSelected,
              ]}
              onPress={() => onColorChange(c)}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Style
        </Text>
        <View style={styles.row}>
          {(["none", "outline", "background"] as TextStyle[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.chip,
                { borderColor: colors.border },
                style === s && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => onStyleChange(s)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: style === s ? "#fff" : colors.text },
                ]}
              >
                {s === "none"
                  ? "Plain"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: "600" },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  slider: { flex: 1, height: 40 },
  sizeValue: { fontSize: 14, fontWeight: "600", width: 28 },
  fontScroll: { marginBottom: 16, marginHorizontal: -16 },
  fontRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  colorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: { borderColor: "#007AFF", borderWidth: 3 },
})
