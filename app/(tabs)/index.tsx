import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useHeaderHeight } from "@react-navigation/elements"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { useAuth } from "@lib/contexts/auth-context"
import { useTheme } from "@lib/contexts/theme-context"

import { useUserPosts } from "../../features/feed/use-posts"
import { ProfileContent } from "../../features/profile/profile-content"

export default function ProfileScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { profile } = useAuth()
  const { data: posts = [] } = useUserPosts(profile?.id ?? "")
  const headerHeight = useHeaderHeight()
  const tabBarHeight = useBottomTabBarHeight()
  const insets = useSafeAreaInsets()

  if (!profile) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      />
    )
  }

  const hasCover = !!profile.coverPhotoUrl
  const statusBarStyle = hasCover || isDark ? "light" : "dark"

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <ProfileContent
        profile={profile}
        posts={posts}
        isCurrentUser
        headerHeight={headerHeight}
        bottomPadding={tabBarHeight + insets.bottom}
        onEditProfile={() => router.push("/edit-profile")}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})
