import { Tabs } from "expo-router"
import { Home, Search, User } from "lucide-react-native"

import { NotificationBell } from "@lib/components/notification-bell"
import { ProfileHeaderLeft } from "@lib/components/profile-header-left"
import { ProfileHeaderRight } from "@lib/components/profile-header-right"
import { ProfileHeaderTitle } from "@lib/components/profile-header-title"
import { useTheme } from "@lib/contexts/theme-context"

export default function TabLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarShowLabel: false,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <ProfileHeaderTitle />,
          headerLeft: () => <ProfileHeaderLeft />,
          headerRight: () => <ProfileHeaderRight />,
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Moltygram",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
