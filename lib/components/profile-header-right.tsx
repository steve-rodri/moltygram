import { TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Settings } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { useAuth } from "../contexts/auth-context"

export function ProfileHeaderRight() {
  const router = useRouter()
  const { profile } = useAuth()
  const [text] = useCSSVariable(["--color-text"]) as [string]
  const iconColor = profile?.coverPhotoUrl ? "#fff" : text

  return (
    <TouchableOpacity className="px-4" onPress={() => router.push("/settings")}>
      <Settings size={22} color={iconColor} />
    </TouchableOpacity>
  )
}
