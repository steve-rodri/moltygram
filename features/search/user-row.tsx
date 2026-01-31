import { Keyboard, Text, TouchableOpacity, View } from "react-native"
import { User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { Profile } from "../../services/repositories/types"

interface UserRowProps {
  user: Profile
  onPress: (userId: string) => void
  dismissKeyboard?: boolean
}

export function UserRow({ user, onPress, dismissKeyboard }: UserRowProps) {
  const [textTertiary] = useCSSVariable(["--color-text-tertiary"]) as [string]

  const handlePress = () => {
    if (dismissKeyboard) {
      Keyboard.dismiss()
    }
    onPress(user.id)
  }

  return (
    <TouchableOpacity
      className="flex-row items-center p-3 rounded-lg mb-2 gap-3 bg-card"
      onPress={handlePress}
    >
      {user.avatarUrl ? (
        <StyledImage
          source={{ uri: user.avatarUrl }}
          className="w-11 h-11 rounded-full"
          cachePolicy={IMAGE_CACHE_POLICY}
        />
      ) : (
        <View className="w-11 h-11 rounded-full items-center justify-center bg-border-light">
          <User size={18} color={textTertiary} />
        </View>
      )}
      <View>
        <Text className="text-sm font-semibold text-text">@{user.handle}</Text>
        <Text className="text-xs text-text-secondary">{user.name}</Text>
      </View>
    </TouchableOpacity>
  )
}
