import { useState } from "react"
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { useAuth } from "@lib/contexts/auth-context"

export default function SignInScreen() {
  const router = useRouter()
  const { signInWithEmail } = useAuth()
  const insets = useSafeAreaInsets()
  const [text, textTertiary] = useCSSVariable([
    "--color-text",
    "--color-text-tertiary",
  ]) as [string, string]

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter your email and password")
      return
    }

    setIsLoading(true)
    const { error } = await signInWithEmail(email.trim(), password)
    setIsLoading(false)

    if (error) {
      Alert.alert("Sign In Failed", error)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            Welcome back
          </Text>
          <Text className="text-base mb-8 text-text-secondary">
            Sign in to your account
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
            <TextInput
              className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text"
              placeholder="Password"
              placeholderTextColor={textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text className="text-sm font-medium text-right text-primary">
                Forgot password?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-4 rounded-xl items-center mt-2 bg-primary"
              style={{ opacity: isLoading ? 0.7 : 1 }}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-text-secondary">
              {"Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/sign-up")}>
              <Text className="text-sm font-semibold text-primary">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}
