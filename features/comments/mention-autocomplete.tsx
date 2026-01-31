import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Image } from "expo-image"
import { User } from "lucide-react-native"

import { useTheme } from "@lib/contexts/theme-context"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { Profile } from "../../services/repositories/types"

interface MentionAutocompleteProps {
  users: Profile[]
  isLoading: boolean
  onSelect: (user: Profile) => void
}

export function MentionAutocomplete({
  users,
  isLoading,
  onSelect,
}: MentionAutocompleteProps) {
  const { colors } = useTheme()

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      </View>
    )
  }

  if (users.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.noResults, { color: colors.textSecondary }]}>
          No users found
        </Text>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {users.slice(0, 5).map((user) => (
        <TouchableOpacity
          key={user.id}
          style={styles.userRow}
          onPress={() => onSelect(user)}
        >
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
              cachePolicy={IMAGE_CACHE_POLICY}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.borderLight },
              ]}
            >
              <User size={12} color={colors.textTertiary} />
            </View>
          )}
          <View>
            <Text style={[styles.handle, { color: colors.text }]}>
              @{user.handle}
            </Text>
            <Text style={[styles.name, { color: colors.textSecondary }]}>
              {user.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  loading: {
    padding: 16,
    alignItems: "center",
  },
  noResults: {
    padding: 12,
    textAlign: "center",
    fontSize: 14,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    fontSize: 14,
    fontWeight: "600",
  },
  name: {
    fontSize: 12,
  },
})
