import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { authRepository } from "@services/repositories/supabase"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [text, textTertiary] = useCSSVariable([
    "--color-text",
    "--color-text-tertiary",
  ]) as [string, string]

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setIsLoading(true)
    const { error } = await authRepository.resetPassword(email.trim())
    setIsLoading(false)

    if (error) {
      Alert.alert("Error", error)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color={text} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-8 pt-6">
          <Text className="text-[28px] font-bold mb-2 text-text">
            Check your email
          </Text>
          <Text className="text-base mb-8 text-text-secondary">
            {"We've sent a password reset link to "}
            {email}
          </Text>

          <TouchableOpacity
            className="py-4 rounded-xl items-center mt-2 bg-primary"
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            <Text className="text-white text-base font-semibold">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-8 pt-6">
        <Text className="text-[28px] font-bold mb-2 text-text">
          Reset password
        </Text>
        <Text className="text-base mb-8 text-text-secondary">
          {"Enter your email and we'll send you a reset link"}
        </Text>

        <View className="gap-4">
          <TextInput
            className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text"
            placeholder="Email"
            placeholderTextColor={textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TouchableOpacity
            className="py-4 rounded-xl items-center mt-2 bg-primary"
            style={{ opacity: isLoading ? 0.7 : 1 }}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
