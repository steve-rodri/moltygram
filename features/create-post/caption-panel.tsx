import { StyleSheet, TextInput } from "react-native"

interface CaptionPanelProps {
  caption: string
  onCaptionChange: (text: string) => void
  colors: { text: string; textTertiary: string; border: string }
}

export function CaptionPanel({
  caption,
  onCaptionChange,
  colors,
}: CaptionPanelProps) {
  return (
    <TextInput
      value={caption}
      onChangeText={onCaptionChange}
      placeholder="Write a caption..."
      placeholderTextColor={colors.textTertiary}
      multiline
      style={[styles.input, { color: colors.text, borderColor: colors.border }]}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
})
