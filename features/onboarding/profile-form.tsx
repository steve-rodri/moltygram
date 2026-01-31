import { useEffect, useState } from "react"
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCSSVariable } from "uniwind"

export function ProfileForm() {
  const router = useRouter()
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const insets = useSafeAreaInsets()
  const [textTertiary] = useCSSVariable(["--color-text-tertiary"]) as [string]

  const [name, setName] = useState("")
  const [pronouns, setPronouns] = useState("")
  const [bio, setBio] = useState("")
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () =>
      setIsKeyboardVisible(true),
    )
    const hideSub = Keyboard.addListener("keyboardWillHide", () =>
      setIsKeyboardVisible(false),
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/your-data",
      params: { handle, name, pronouns, bio },
    })
  }

  const isValid = name.trim().length >= 1

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingBottom: 24,
          paddingTop: insets.top + 48,
        }}
        decelerationRate="fast"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-sm mb-2 text-text-tertiary">Step 2 of 4</Text>
          <Text className="text-[28px] font-bold mb-2 text-text">
            About you
          </Text>
          <Text className="text-base leading-[22px] text-text-secondary">
            Tell people a little about yourself
          </Text>
        </View>

        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-sm font-medium text-text-secondary">
              Name *
            </Text>
            <TextInput
              className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text"
              placeholder="Your name"
              placeholderTextColor={textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-text-secondary">
              Pronouns
            </Text>
            <TextInput
              className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text"
              placeholder="e.g., they/them, she/her, he/him"
              placeholderTextColor={textTertiary}
              value={pronouns}
              onChangeText={setPronouns}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-text-secondary">Bio</Text>
            <TextInput
              className="px-4 py-3.5 rounded-xl text-base border border-border bg-surface text-text h-[100px]"
              style={{ textAlignVertical: "top" }}
              placeholder="A few words about yourself"
              placeholderTextColor={textTertiary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={150}
            />
            <Text className="text-xs text-right text-text-tertiary">
              {bio.length}/150
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="px-8 pt-4"
        style={{ paddingBottom: isKeyboardVisible ? 16 : insets.bottom + 16 }}
      >
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${isValid ? "bg-primary" : "bg-border"}`}
          onPress={handleContinue}
          disabled={!isValid}
        >
          <Text
            className={`text-base font-semibold ${isValid ? "text-white" : "text-text-tertiary"}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
