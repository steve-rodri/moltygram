import { Text, View } from "react-native"
import Constants from "expo-constants"
import * as Updates from "expo-updates"

function getEnvironment(): string {
  const channel = Updates.channel ?? "dev"
  switch (channel) {
    case "prd":
      return "Production"
    case "stg":
      return "Staging"
    default:
      return "Development"
  }
}

interface InfoRowProps {
  label: string
  value: string
  showBorder?: boolean
}

function InfoRow({ label, value, showBorder = true }: InfoRowProps) {
  return (
    <View
      className={`flex-row justify-between items-center py-3.5 px-4 ${
        showBorder ? "border-b border-border-light" : ""
      }`}
    >
      <Text className="text-[15px] text-text-secondary">{label}</Text>
      <Text className="text-[15px] font-mono text-text">{value}</Text>
    </View>
  )
}

export default function AppInfoScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0"
  const channel = Updates.channel ?? "dev"
  const environment = getEnvironment()
  const updateId = Updates.updateId?.slice(0, 8) ?? "embedded"
  const runtimeVersion =
    typeof Updates.runtimeVersion === "string"
      ? Updates.runtimeVersion.slice(0, 8)
      : "N/A"

  return (
    <View className="flex-1 p-4 bg-background">
      <View className="rounded-xl overflow-hidden bg-card">
        <InfoRow label="Version" value={version} />
        <InfoRow label="Channel" value={channel} />
        <InfoRow label="Environment" value={environment} />
        <InfoRow label="Runtime" value={runtimeVersion} />
        <InfoRow label="Update ID" value={updateId} showBorder={false} />
      </View>
    </View>
  )
}
