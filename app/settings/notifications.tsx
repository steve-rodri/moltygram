import { ScrollView, Switch, Text, View } from "react-native"
import { Stack } from "expo-router"
import { useCSSVariable } from "uniwind"

import { useUser } from "@lib/contexts/user-context"

interface ToggleRowProps {
  label: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: ToggleRowProps) {
  const [border, primary] = useCSSVariable([
    "--color-border",
    "--color-primary",
  ]) as [string, string]

  return (
    <View className="flex-row items-center justify-between py-3 px-4 border-b border-border-light">
      <View className="flex-1 mr-3">
        <Text className="text-base mb-0.5 text-text">{label}</Text>
        <Text className="text-[13px] text-text-secondary">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: border, true: primary }}
        thumbColor="#fff"
      />
    </View>
  )
}

export default function NotificationsScreen() {
  const { settings, updateNotifications } = useUser()

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Notifications" }} />
      <ScrollView>
        <Text className="text-xs font-semibold px-4 pt-6 pb-2 text-text-secondary">
          PUSH NOTIFICATIONS
        </Text>
        <ToggleRow
          label="Likes"
          description="When someone likes your post"
          value={settings.notifications.likes}
          onValueChange={(v) => updateNotifications({ likes: v })}
        />
        <ToggleRow
          label="Comments"
          description="When someone comments on your post"
          value={settings.notifications.comments}
          onValueChange={(v) => updateNotifications({ comments: v })}
        />
        <ToggleRow
          label="New Followers"
          description="When someone follows you"
          value={settings.notifications.follows}
          onValueChange={(v) => updateNotifications({ follows: v })}
        />
        <ToggleRow
          label="Mentions"
          description="When someone mentions you"
          value={settings.notifications.mentions}
          onValueChange={(v) => updateNotifications({ mentions: v })}
        />
      </ScrollView>
    </View>
  )
}
