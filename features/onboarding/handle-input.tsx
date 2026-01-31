import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { AlertCircle, CheckCircle } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { useHandleValidation } from "@features/onboarding/use-handle-validation"

export function HandleInput() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { handle, isChecking, error, isAvailable, handleChange, canContinue } =
    useHandleValidation()
  const [textTertiary, textSecondary, text] = useCSSVariable([
    "--color-text-tertiary",
    "--color-text-secondary",
    "--color-text",
  ]) as [string, string, string]

  const handleContinue = () => {
    if (!canContinue) return
    router.push({
      pathname: "/(onboarding)/create-profile",
      params: { handle },
    })
  }

  const renderStatus = () => {
    if (!handle || handle.length < 3) return null
    if (isChecking)
      return <ActivityIndicator size="small" color={textSecondary} />
    if (error) return <AlertCircle size={20} color="#ed4956" />
    if (isAvailable) return <CheckCircle size={20} color="#34c759" />
    return null
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-1 px-8 pt-12">
          <View className="mb-8">
            <Text className="text-sm mb-2 text-text-tertiary">Step 1 of 4</Text>
            <Text className="text-[28px] font-bold mb-2 text-text">
              Choose your handle
            </Text>
            <Text className="text-base leading-[22px] text-text-secondary">
              This is how people will find and tag you
            </Text>
          </View>

          <View className="gap-2">
            <View
              className={`flex-row items-center px-4 py-3.5 rounded-xl border bg-surface ${error ? "border-error" : "border-border"}`}
            >
              <Text className="text-lg mr-1 text-text-secondary">@</Text>
              <TextInput
                className="flex-1 text-lg text-text"
                placeholder="username"
                placeholderTextColor={textTertiary}
                value={handle}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              <View className="w-6 items-center">{renderStatus()}</View>
            </View>
            {error && <Text className="text-sm text-error">{error}</Text>}
            {isAvailable && !error && (
              <Text className="text-sm text-success">Handle is available</Text>
            )}
            <Text className="text-[13px] text-text-tertiary">
              3-30 characters. Letters, numbers, and underscores only.
            </Text>
          </View>
        </View>

        <View
          className="px-8 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            className={`py-4 rounded-xl items-center ${canContinue ? "bg-primary" : "bg-border"}`}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: canContinue ? "#fff" : text }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
