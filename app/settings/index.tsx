import { ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
import {
  Bell,
  Clock,
  Info,
  Lock,
  LogOut,
  Palette,
  ShieldBan,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { SettingsItem } from "@features/settings/settings-item"
import { useAuth } from "@lib/contexts/auth-context"

export default function SettingsScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [iconColor, errorColor] = useCSSVariable([
    "--color-text-secondary",
    "--color-error",
  ]) as [string, string]

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      bounces={false}
    >
      <View className="flex-1">
        <SettingsItem
          icon={<Palette size={22} color={iconColor} />}
          label="Appearance"
          onPress={() => router.push("/settings/appearance")}
        />
        <SettingsItem
          icon={<Smartphone size={22} color={iconColor} />}
          label="App Icon"
          onPress={() => router.push("/settings/app-icon")}
        />
        <SettingsItem
          icon={<Bell size={22} color={iconColor} />}
          label="Notifications"
          onPress={() => router.push("/settings/notifications")}
        />
        <SettingsItem
          icon={<ShieldBan size={22} color={iconColor} />}
          label="Blocked"
          onPress={() => router.push("/settings/blocked")}
        />
        <SettingsItem
          icon={<Clock size={22} color={iconColor} />}
          label="Screen Time"
          onPress={() => router.push("/settings/screen-time")}
        />
        <SettingsItem
          icon={<Lock size={22} color={iconColor} />}
          label="Account Privacy"
          onPress={() => router.push("/settings/privacy")}
        />
        <SettingsItem
          icon={<Trash2 size={22} color={iconColor} />}
          label="Recently Deleted"
          onPress={() => router.push("/settings/recently-deleted")}
        />
        <SettingsItem
          icon={<ShieldCheck size={22} color={iconColor} />}
          label="About Your Data"
          onPress={() => router.push("/settings/about-data")}
        />
        <SettingsItem
          icon={<Info size={22} color={iconColor} />}
          label="App Info"
          onPress={() => router.push("/settings/app-info")}
        />
        <SettingsItem
          icon={<LogOut size={22} color={errorColor} />}
          label="Log Out"
          onPress={signOut}
          variant="danger"
          showChevron={false}
        />
      </View>
    </ScrollView>
  )
}
