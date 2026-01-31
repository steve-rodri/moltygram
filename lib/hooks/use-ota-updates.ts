import { useEffect, useRef } from "react"
import { Alert } from "react-native"
import * as Updates from "expo-updates"

export function useOTAUpdates() {
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled || hasCheckedRef.current) return

    const checkForUpdate = async () => {
      hasCheckedRef.current = true
      try {
        const update = await Updates.checkForUpdateAsync()
        if (!update.isAvailable) return

        const result = await Updates.fetchUpdateAsync()
        if (!result.isNew) return

        Alert.alert(
          "Update Available",
          "A new version has been downloaded. Restart to apply?",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Restart",
              onPress: () => Updates.reloadAsync().catch(() => {}),
            },
          ],
        )
      } catch {
        // Update check failed - fail silently
      }
    }

    const timeout = setTimeout(checkForUpdate, 3000)
    return () => clearTimeout(timeout)
  }, [])
}
