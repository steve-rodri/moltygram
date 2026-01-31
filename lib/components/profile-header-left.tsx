import { useState } from "react"
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { ImagePlus, Plus, UserCircle, Wallpaper } from "lucide-react-native"

import {
  getPhotoUpdates,
  PhotoType,
} from "@features/profile/photo-update-helpers"
import { userRepository } from "@services/repositories/supabase"

import { useAuth } from "../contexts/auth-context"
import { useTheme } from "../contexts/theme-context"

export function ProfileHeaderLeft() {
  const router = useRouter()
  const { colors } = useTheme()
  const { profile, setProfile } = useAuth()
  const [menuVisible, setMenuVisible] = useState(false)

  const hasProfilePhoto = !!profile?.avatarUrl
  const hasCoverPhoto = !!profile?.coverPhotoUrl

  const pickNewImage = async (type: PhotoType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant photo library access")
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]) {
        router.push(
          `/edit-photo?type=${type}&uri=${encodeURIComponent(result.assets[0].uri)}`,
        )
      }
    } catch {
      Alert.alert("Error", "Failed to open image picker")
    }
  }

  const removePhoto = async (type: PhotoType) => {
    if (!profile) return
    const updates = getPhotoUpdates(type, null, null)
    const optimisticProfile = { ...profile, ...updates }
    setProfile(optimisticProfile)
    await userRepository.updateProfile(profile.id, updates)
  }

  const showPhotoMenu = (type: PhotoType) => {
    const isProfile = type === "profile"
    const hasPhoto = isProfile ? hasProfilePhoto : hasCoverPhoto
    const title = isProfile ? "Profile Photo" : "Backdrop Photo"
    const noun = isProfile ? "profile" : "backdrop"

    if (hasPhoto) {
      Alert.alert(title, "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit existing",
          onPress: () => router.push(`/edit-photo?type=${type}`),
        },
        { text: "Choose new", onPress: () => pickNewImage(type) },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removePhoto(type),
        },
      ])
    } else {
      Alert.alert(title, `Choose a photo for your ${noun}`, [
        { text: "Cancel", style: "cancel" },
        { text: "Choose Photo", onPress: () => pickNewImage(type) },
      ])
    }
  }

  const menuItems = [
    {
      label: "Add new post",
      icon: ImagePlus,
      onPress: () => router.push("/create"),
    },
    {
      label: hasProfilePhoto ? "Edit profile photo" : "Add profile photo",
      icon: UserCircle,
      onPress: () => showPhotoMenu("profile"),
    },
    {
      label: hasCoverPhoto ? "Edit backdrop photo" : "Add backdrop photo",
      icon: Wallpaper,
      onPress: () => showPhotoMenu("cover"),
    },
  ]

  const iconColor = profile?.coverPhotoUrl ? "#fff" : colors.text

  return (
    <>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setMenuVisible(true)}
      >
        <Plus size={24} color={iconColor} />
      </TouchableOpacity>
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[styles.menuContainer, { backgroundColor: colors.surface }]}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false)
                  setTimeout(() => item.onPress(), 500)
                }}
              >
                <item.icon size={20} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingTop: 100,
    paddingLeft: 16,
  },
  menuContainer: {
    borderRadius: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 28,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
  },
})
