import { useState } from "react"
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as AppleAuthentication from "expo-apple-authentication"
import { useRouter } from "expo-router"
import { Camera } from "lucide-react-native"

import { useTheme } from "@lib/contexts/theme-context"
import { authRepository } from "@services/repositories/supabase"

export default function WelcomeScreen() {
  const router = useRouter()
  const { isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)

  async function handleAppleSignIn() {
    try {
      setIsLoading(true)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (!credential.identityToken) {
        Alert.alert("Error", "No identity token received")
        return
      }

      const { error } = await authRepository.signInWithApple(
        credential.identityToken,
      )
      if (error) {
        Alert.alert("Error", error)
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", "Apple Sign In failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-16">
          <View className="w-[100px] h-[100px] rounded-full justify-center items-center mb-6 bg-primary">
            <Camera size={48} color="#fff" />
          </View>
          <Text className="text-4xl font-bold mb-2 text-text">Retro Insta</Text>
          <Text className="text-base text-text-secondary">
            Share moments, your way
          </Text>
        </View>

        <View className="gap-3">
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                isDark
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={12}
              style={{ height: 50, width: "100%" }}
              onPress={handleAppleSignIn}
            />
          )}
          <TouchableOpacity
            className="py-4 rounded-xl items-center bg-primary"
            onPress={() => router.push("/(auth)/sign-up")}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              Create Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-4 rounded-xl items-center border border-border"
            onPress={() => router.push("/(auth)/sign-in")}
            disabled={isLoading}
          >
            <Text className="text-base font-semibold text-text">Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => router.push("/(auth)/phone-auth")}
            disabled={isLoading}
          >
            <Text className="text-sm font-medium text-primary">
              Continue with phone number
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text
        className="text-xs text-center px-8 text-text-tertiary"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  )
}
