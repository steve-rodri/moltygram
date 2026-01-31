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

import { useAuth } from "@lib/contexts/auth-context"

export default function PhoneAuthScreen() {
  const router = useRouter()
  const { signInWithPhone } = useAuth()
  const insets = useSafeAreaInsets()
  const [text, textTertiary] = useCSSVariable([
    "--color-text",
    "--color-text-tertiary",
  ]) as [string, string]

  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatPhone = (text: string) => text.replace(/\D/g, "").slice(0, 10)

  const displayPhone = (digits: string) => {
    if (digits.length === 0) return ""
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handleSendCode = async () => {
    if (phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)
    const fullPhone = `+1${phone}`
    const { error } = await signInWithPhone(fullPhone)
    setIsLoading(false)

    if (error) {
      Alert.alert("Error", error)
    } else {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { phone: fullPhone },
      })
    }
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
          Enter your phone
        </Text>
        <Text className="text-base mb-8 text-text-secondary">
          {"We'll send you a verification code"}
        </Text>

        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="px-4 py-3.5 rounded-xl border border-border justify-center bg-surface">
              <Text className="text-base font-medium text-text">+1</Text>
            </View>
            <TextInput
              className="flex-1 px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text"
              placeholder="(555) 555-5555"
              placeholderTextColor={textTertiary}
              value={displayPhone(phone)}
              onChangeText={(text) => setPhone(formatPhone(text))}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
          <TouchableOpacity
            className="py-4 rounded-xl items-center mt-2 bg-primary"
            style={{ opacity: isLoading ? 0.7 : 1 }}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? "Sending..." : "Send Code"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-center px-8 mt-6 text-text-tertiary">
          By continuing, you may receive an SMS for verification. Message and
          data rates may apply.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}
