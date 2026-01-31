import { Text, TouchableOpacity, View } from "react-native"
import { ChevronRight } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

type SettingsItemVariant = "default" | "danger"

interface SettingsItemProps {
  icon: React.ReactNode
  label: string
  onPress: () => void
  variant?: SettingsItemVariant
  showChevron?: boolean
}

export function SettingsItem({
  icon,
  label,
  onPress,
  variant = "default",
  showChevron = true,
}: SettingsItemProps) {
  const [textTertiary] = useCSSVariable(["--color-text-tertiary"]) as [string]

  const chevronColor = variant === "danger" ? "transparent" : textTertiary

  return (
    <TouchableOpacity
      className={`flex-row justify-between items-center py-3.5 px-4 border-b ${
        variant === "danger" ? "border-transparent" : "border-border-light"
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-7 items-center">{icon}</View>
        <Text
          className={`text-base ${variant === "danger" ? "text-error" : "text-text"}`}
        >
          {label}
        </Text>
      </View>
      {showChevron && <ChevronRight size={20} color={chevronColor} />}
    </TouchableOpacity>
  )
}
