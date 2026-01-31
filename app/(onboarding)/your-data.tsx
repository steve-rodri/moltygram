import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Image, ShieldCheck, Trash2 } from "lucide-react-native"

import { useTheme } from "@lib/contexts/theme-context"

interface DataPointProps {
  icon: React.ReactNode
  title: string
  description: string
  colors: { text: string; textSecondary: string; surface: string }
}

function DataPoint({ icon, title, description, colors }: DataPointProps) {
  return (
    <View style={[styles.dataPoint, { backgroundColor: colors.surface }]}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.dataPointText}>
        <Text style={[styles.dataPointTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.dataPointDescription, { color: colors.textSecondary }]}
        >
          {description}
        </Text>
      </View>
    </View>
  )
}

export default function YourDataScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    handle: string
    name: string
    pronouns: string
    bio: string
  }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/add-photo",
      params,
    })
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={[styles.step, { color: colors.textTertiary }]}>
            Step 3 of 4
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Your data, your choice
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {"Here's how we handle your information"}
          </Text>
        </View>

        <View style={styles.dataPoints}>
          <DataPoint
            icon={<Image size={22} color={colors.primary} />}
            title="Your photos stay yours"
            description="When you grant photo access, we only use photos you choose to post, everything else stays on your device."
            colors={colors}
          />
          <DataPoint
            icon={<Trash2 size={22} color={colors.primary} />}
            title="Delete means delete"
            description="When you remove a post, we permanently delete it from our servers."
            colors={colors}
          />
          <DataPoint
            icon={<ShieldCheck size={22} color={colors.primary} />}
            title="Your data stays yours"
            description="We never sell your data or share it with advertisers."
            colors={colors}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 48 },
  header: { marginBottom: 32 },
  step: { fontSize: 14, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  dataPoints: { gap: 12 },
  dataPoint: { flexDirection: "row", padding: 16, borderRadius: 12, gap: 14 },
  iconContainer: { paddingTop: 2 },
  dataPointText: { flex: 1 },
  dataPointTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  dataPointDescription: { fontSize: 14, lineHeight: 20 },
  footer: { paddingHorizontal: 32, paddingTop: 16 },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
})
