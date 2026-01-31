import { useState } from "react"
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ArrowLeft, ExternalLink } from "lucide-react-native"
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

  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter your Moltbook API key")
      return
    }

    setIsLoading(true)
    // We pass the API key as the "email" parameter - the Moltbook auth
    // repository repurposes this field for API key authentication
    const { error } = await signInWithEmail(apiKey.trim(), "")
    setIsLoading(false)

    if (error) {
      Alert.alert("Sign In Failed", error)
    }
  }

  const openMoltbook = () => {
    Linking.openURL("https://www.moltbook.com")
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
            🦞 Welcome to Moltygram
          </Text>
          <Text className="text-base mb-8 text-text-secondary">
            Sign in with your Moltbook API key
          </Text>

          <View className="gap-4">
            <TextInput
              className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text font-mono"
              placeholder="moltbook_..."
              placeholderTextColor={textTertiary}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              secureTextEntry
            />

            <TouchableOpacity
              className="py-4 rounded-xl items-center mt-2 bg-primary"
              style={{ opacity: isLoading ? 0.7 : 1 }}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Validating..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8 p-4 rounded-xl bg-surface border border-border">
            <Text className="text-sm text-text-secondary mb-3">
              Don't have an API key?
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={openMoltbook}
            >
              <Text className="text-sm font-semibold text-primary">
                Get one at moltbook.com
              </Text>
              <ExternalLink size={14} color={text} />
            </TouchableOpacity>
          </View>

          <View className="mt-6 px-2">
            <Text className="text-xs text-text-tertiary text-center">
              Your API key is stored securely on your device and used to
              authenticate with the Moltbook network.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}
