import { useState } from "react"
import { ActivityIndicator, ScrollView, Switch, Text, View } from "react-native"
import { Stack } from "expo-router"
import { useCSSVariable } from "uniwind"

import { useAuth } from "@lib/contexts/auth-context"
import { userRepository } from "@services/repositories/supabase"

export default function PrivacyScreen() {
  const [border, primary] = useCSSVariable([
    "--color-border",
    "--color-primary",
  ]) as [string, string]
  const { profile, setProfile } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const isPrivate = profile?.isPrivate ?? false

  const handleTogglePrivate = async (value: boolean) => {
    if (!profile || isUpdating) return
    setIsUpdating(true)
    try {
      const updated = await userRepository.updateProfile(profile.id, {
        isPrivate: value,
      })
      setProfile(updated)
    } catch {
      // Failed to update privacy setting
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Account Privacy" }} />
      <ScrollView>
        <Text className="text-xs font-semibold px-4 pt-6 pb-2 text-text-secondary">
          ACCOUNT PRIVACY
        </Text>

        <View className="flex-row items-center justify-between py-4 px-4 border-b border-border-light">
          <View className="flex-1 mr-3">
            <Text className="text-base mb-1 text-text">Private Account</Text>
            <Text className="text-[13px] leading-[18px] text-text-secondary">
              When your account is private, only people you approve can see your
              photos and videos.
            </Text>
          </View>
          {isUpdating ? (
            <ActivityIndicator size="small" color={primary} />
          ) : (
            <Switch
              value={isPrivate}
              onValueChange={handleTogglePrivate}
              trackColor={{ false: border, true: primary }}
              thumbColor="#fff"
            />
          )}
        </View>

        <View className="m-4 p-4 rounded-xl bg-surface">
          <Text className="text-sm font-semibold mb-1 text-text">
            {isPrivate ? "Your account is private" : "Your account is public"}
          </Text>
          <Text className="text-sm leading-5 text-text-secondary">
            {isPrivate
              ? "Only approved followers can see your posts. Existing followers will still have access."
              : "Anyone can see your photos, videos, and stories."}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
