import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Check } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { themes } from "@lib/constants/themes"
import { useTheme } from "@lib/contexts/theme-context"

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  const [primary, border] = useCSSVariable([
    "--color-primary",
    "--color-border",
  ]) as [string, string]
  const themeList = Object.values(themes)

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <Text className="text-xs font-semibold mb-2 text-text-secondary">
          CHOOSE THEME
        </Text>
        <Text className="text-sm mb-4 text-text-tertiary">
          Select a theme to customize the look of your app. Changes are saved
          automatically.
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {themeList.map((t) => {
            const isSelected = theme === t.name
            return (
              <TouchableOpacity
                key={t.name}
                className="w-[47%] rounded-xl border-2 overflow-hidden"
                style={{ borderColor: isSelected ? primary : border }}
                onPress={() => setTheme(t.name)}
              >
                <View
                  className="p-3"
                  style={{ backgroundColor: t.colors.background }}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <View
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: t.colors.primary }}
                    />
                    <View
                      className="flex-1 h-2 rounded"
                      style={{
                        backgroundColor: t.colors.primary,
                        opacity: 0.3,
                      }}
                    />
                  </View>
                  <View className="gap-1.5">
                    <View
                      className="h-2 rounded w-3/4"
                      style={{
                        backgroundColor: t.colors.text,
                        opacity: 0.7,
                      }}
                    />
                    <View
                      className="h-2 rounded w-1/2"
                      style={{
                        backgroundColor: t.colors.textSecondary,
                        opacity: 0.5,
                      }}
                    />
                  </View>
                </View>
                <View
                  className="py-2 px-3"
                  style={{ backgroundColor: t.colors.background }}
                >
                  <Text
                    className="text-sm font-medium text-center"
                    style={{ color: t.colors.text }}
                  >
                    {t.label}
                  </Text>
                </View>
                {isSelected && (
                  <View className="absolute top-2 right-2 w-5 h-5 rounded-full justify-center items-center bg-primary">
                    <Check size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}
