import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Stack } from "expo-router"
import { Check } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { useUser } from "@lib/contexts/user-context"

const TIME_OPTIONS = [
  { label: "No limit", value: 0 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
]

export default function ScreenTimeScreen() {
  const [primary] = useCSSVariable(["--color-primary"]) as [string]
  const { settings, setScreenTimeLimit } = useUser()

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Screen Time" }} />
      <ScrollView>
        <Text className="text-xs font-semibold px-4 pt-6 pb-2 text-text-secondary">
          DAILY TIME LIMIT
        </Text>
        <Text className="text-sm px-4 pb-4 leading-5 text-text-tertiary">
          {
            "Set a daily reminder when you've reached your time limit. You can always dismiss and continue."
          }
        </Text>

        {TIME_OPTIONS.map((option) => {
          const isSelected = settings.screenTimeLimit === option.value
          return (
            <TouchableOpacity
              key={option.value}
              className="flex-row items-center justify-between py-3.5 px-4 border-b border-border-light"
              onPress={() => setScreenTimeLimit(option.value)}
            >
              <Text className="text-base text-text">{option.label}</Text>
              {isSelected && <Check size={20} color={primary} />}
            </TouchableOpacity>
          )
        })}

        <View className="m-4 p-4 rounded-xl bg-surface">
          <Text className="text-sm leading-5 text-text-secondary">
            {
              "When you reach your daily limit, you'll see a reminder. This is a gentle nudge to help you manage your time, not a hard block."
            }
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
