import { useState } from "react"
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { Wrench, X } from "lucide-react-native"

import { useAuth } from "../contexts/auth-context"
import { useTheme } from "../contexts/theme-context"

export function DevMenu() {
  const { colors } = useTheme()
  const { startOnboardingPreview } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handlePreviewOnboarding = () => {
    setIsOpen(false)
    startOnboardingPreview()
    router.push("/(onboarding)/create-handle")
  }

  if (!__DEV__) return null

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Wrench size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[styles.menu, { backgroundColor: colors.background }]}
          >
            <View
              style={[styles.header, { borderBottomColor: colors.borderLight }]}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                Dev Menu
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  { borderBottomColor: colors.borderLight },
                ]}
                onPress={handlePreviewOnboarding}
              >
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Preview Onboarding
                </Text>
                <Text
                  style={[styles.menuItemHint, { color: colors.textSecondary }]}
                >
                  Resets profile to trigger onboarding flow
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    width: "85%",
    maxWidth: 340,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 8,
  },
  menuItem: {
    padding: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  menuItemHint: {
    fontSize: 13,
  },
})
