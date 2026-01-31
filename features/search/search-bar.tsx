import { TextInput, TouchableOpacity, View } from "react-native"
import { Search, X } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onClear: () => void
  inputAccessoryViewID?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  inputAccessoryViewID,
  autoFocus,
}: SearchBarProps) {
  const [textSecondary, textTertiary] = useCSSVariable([
    "--color-text-secondary",
    "--color-text-tertiary",
  ]) as [string, string]

  return (
    <View className="px-4 py-2 bg-surface">
      <View className="flex-row items-center px-3 py-2.5 rounded-lg gap-2 bg-surface">
        <Search size={18} color={textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search users..."
          placeholderTextColor={textTertiary}
          className="flex-1 text-base p-0 text-text"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          inputAccessoryViewID={inputAccessoryViewID}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <X size={18} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
