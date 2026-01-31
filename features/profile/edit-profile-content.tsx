import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { AlertCircle, CheckCircle } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { useProfileEdit } from "./use-profile-edit"

interface EditProfileContentProps {
  profileEdit: ReturnType<typeof useProfileEdit>
}

export function EditProfileContent({ profileEdit }: EditProfileContentProps) {
  const [textSecondary] = useCSSVariable(["--color-text-secondary"]) as [string]
  const {
    name,
    setName,
    handle,
    handleHandleChange,
    pronouns,
    setPronouns,
    bio,
    setBio,
    handleError,
    isCheckingHandle,
    handleAvailable,
    handleChanged,
  } = profileEdit

  const renderHandleStatus = () => {
    if (!handleChanged) return null
    if (isCheckingHandle) {
      return (
        <ActivityIndicator
          size="small"
          color={textSecondary}
          className="absolute right-3 top-3.5"
        />
      )
    }
    if (handleError) {
      return (
        <AlertCircle
          size={18}
          color="#ed4956"
          className="absolute right-3 top-3.5"
        />
      )
    }
    if (handleAvailable) {
      return (
        <CheckCircle
          size={18}
          color="#34c759"
          className="absolute right-3 top-3.5"
        />
      )
    }
    return null
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4"
      decelerationRate="fast"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-5">
        <Text className="text-sm mb-2 text-text-secondary">Name</Text>
        <TextInput
          className="border rounded-lg p-3 text-base border-border bg-surface text-text"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={textSecondary}
        />
      </View>

      <View className="mb-5">
        <Text className="text-sm mb-2 text-text-secondary">Handle</Text>
        <View className="relative">
          <TextInput
            className="border rounded-lg p-3 pr-10 text-base bg-surface text-text"
            style={{ borderColor: handleError ? "#ed4956" : undefined }}
            value={handle}
            onChangeText={handleHandleChange}
            placeholder="username"
            placeholderTextColor={textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {renderHandleStatus()}
        </View>
        {handleError && (
          <Text className="text-xs mt-1 text-error">{handleError}</Text>
        )}
        {handleAvailable && handleChanged && !handleError && (
          <Text className="text-xs mt-1 text-success">Handle is available</Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-sm mb-2 text-text-secondary">Pronouns</Text>
        <TextInput
          className="border rounded-lg p-3 text-base border-border bg-surface text-text"
          value={pronouns}
          onChangeText={setPronouns}
          placeholder="they/them"
          placeholderTextColor={textSecondary}
        />
      </View>

      <View className="mb-5">
        <Text className="text-sm mb-2 text-text-secondary">Bio</Text>
        <TextInput
          className="border rounded-lg p-3 text-base min-h-[100px] border-border bg-surface text-text"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          placeholderTextColor={textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </ScrollView>
  )
}
