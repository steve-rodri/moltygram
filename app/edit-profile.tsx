import { useLayoutEffect } from "react"
import { ActivityIndicator, TouchableOpacity } from "react-native"
import { useNavigation } from "expo-router"
import { Check } from "lucide-react-native"

import { useTheme } from "@lib/contexts/theme-context"

import { EditProfileContent } from "../features/profile/edit-profile-content"
import { useProfileEdit } from "../features/profile/use-profile-edit"

export default function EditProfileScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const profileEdit = useProfileEdit()
  const { isSaving, canSave, save } = profileEdit

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={save}
          style={{ paddingHorizontal: 8 }}
          disabled={isSaving || !canSave}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Check
              size={24}
              color={canSave ? colors.primary : colors.textTertiary}
            />
          )}
        </TouchableOpacity>
      ),
    })
  }, [navigation, isSaving, canSave, save, colors])

  return <EditProfileContent profileEdit={profileEdit} />
}
