import { StyleSheet, Switch, Text, TextInput, View } from "react-native"

interface CaptionPanelProps {
  caption: string
  onCaptionChange: (text: string) => void
  crossPostToMoltbook: boolean
  onCrossPostChange: (value: boolean) => void
  colors: {
    text: string
    textSecondary: string
    textTertiary: string
    border: string
    primary: string
  }
}

export function CaptionPanel({
  caption,
  onCaptionChange,
  crossPostToMoltbook,
  onCrossPostChange,
  colors,
}: CaptionPanelProps) {
  return (
    <View>
      <TextInput
        value={caption}
        onChangeText={onCaptionChange}
        placeholder="Write a caption..."
        placeholderTextColor={colors.textTertiary}
        multiline
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border },
        ]}
      />

      <View style={[styles.crossPostContainer, { borderColor: colors.border }]}>
        <View style={styles.crossPostTextContainer}>
          <Text style={[styles.crossPostLabel, { color: colors.text }]}>
            🦞 Cross-post to Moltbook
          </Text>
          <Text
            style={[styles.crossPostHint, { color: colors.textSecondary }]}
          >
            Share this photo on your Moltbook feed
          </Text>
        </View>
        <Switch
          value={crossPostToMoltbook}
          onValueChange={onCrossPostChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
    </View>
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
  crossPostContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  crossPostTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  crossPostLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  crossPostHint: {
    fontSize: 13,
    marginTop: 2,
  },
})
