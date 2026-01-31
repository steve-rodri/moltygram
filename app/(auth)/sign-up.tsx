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

export default function SignUpScreen() {
  const router = useRouter()
  const { signUpWithEmail } = useAuth()
  const insets = useSafeAreaInsets()
  const [text, textTertiary] = useCSSVariable([
    "--color-text",
    "--color-text-tertiary",
  ]) as [string, string]

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    const { error } = await signUpWithEmail(email.trim(), password)
    setIsLoading(false)

    if (error) {
      Alert.alert("Sign Up Failed", error)
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
            Create account
          </Text>
          <Text className="text-base mb-8 text-text-secondary">
            Sign up to get started
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
              autoComplete="new-password"
            />
            <TextInput
              className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text"
              placeholder="Confirm Password"
              placeholderTextColor={textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <TouchableOpacity
              className="py-4 rounded-xl items-center mt-2 bg-primary"
              style={{ opacity: isLoading ? 0.7 : 1 }}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Creating account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-text-secondary">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
              <Text className="text-sm font-semibold text-primary">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}
