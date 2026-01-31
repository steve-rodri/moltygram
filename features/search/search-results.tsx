import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { useCSSVariable } from "uniwind"

import { Profile } from "../../services/repositories/types"

import { UserRow } from "./user-row"

interface SearchResultsProps {
  results: Profile[]
  isSearching: boolean
  onUserPress: (userId: string) => void
}

export function SearchResults({
  results,
  isSearching,
  onUserPress,
}: SearchResultsProps) {
  const [textSecondary] = useCSSVariable(["--color-text-secondary"]) as [string]

  if (isSearching) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="small" color={textSecondary} />
      </View>
    )
  }

  if (results.length === 0) {
    return (
      <Text className="text-center py-8 text-text-secondary">
        No users found
      </Text>
    )
  }

  return (
    <ScrollView
      className="grow-0"
      contentContainerClassName="px-3 pb-2"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {[...results].reverse().map((user) => (
        <UserRow
          key={user.id}
          user={user}
          onPress={onUserPress}
          dismissKeyboard
        />
      ))}
    </ScrollView>
  )
}
