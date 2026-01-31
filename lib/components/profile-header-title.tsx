import { Text } from "react-native"
import { useCSSVariable } from "uniwind"

import { useAuth } from "../contexts/auth-context"

export function ProfileHeaderTitle() {
  const { profile } = useAuth()
  const [text] = useCSSVariable(["--color-text"]) as [string]
  const titleColor = profile?.coverPhotoUrl ? "#fff" : text

  return (
    <Text className="text-base font-semibold" style={{ color: titleColor }}>
      @{profile?.handle || ""}
    </Text>
  )
}
