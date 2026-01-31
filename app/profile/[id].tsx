import { useCallback } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { useTheme } from "@lib/contexts/theme-context"

import { useUserPosts } from "../../features/feed/use-posts"
import { ProfileContent } from "../../features/profile/profile-content"
import { useUserProfile } from "../../features/profile/use-user-profile"

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const headerHeight = useHeaderHeight()

  const {
    data: posts = [],
    refetch: refetchPosts,
    isRefetching,
  } = useUserPosts(id ?? "")
  const {
    user,
    followStatus,
    isLoading,
    isCurrentUser,
    refreshProfile,
    handleFollow,
    handleUnfollow,
  } = useUserProfile(id)

  const handleRefresh = useCallback(async () => {
    if (isCurrentUser) return
    await Promise.all([refreshProfile(), refetchPosts()])
  }, [isCurrentUser, refreshProfile, refetchPosts])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "", headerTransparent: true }} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.textSecondary} />
        </View>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "", headerTransparent: true }} />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            User not found
          </Text>
        </View>
      </View>
    )
  }

  const hasCover = !!user.coverPhotoUrl
  const headerColor = hasCover ? "#fff" : colors.text

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={hasCover ? "light" : "auto"} />
      <Stack.Screen
        options={{
          title: `@${user.handle}`,
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          headerTintColor: headerColor,
          headerTitleStyle: { color: headerColor, fontWeight: "600" },
        }}
      />
      <ProfileContent
        profile={user}
        posts={posts}
        isCurrentUser={isCurrentUser}
        headerHeight={headerHeight}
        followStatus={followStatus}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onEditProfile={() => router.push("/edit-profile")}
        refreshing={isCurrentUser ? undefined : isRefetching}
        onRefresh={isCurrentUser ? undefined : handleRefresh}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14 },
})
