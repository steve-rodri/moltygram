import { useCallback, useEffect, useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"

import { useAuth } from "@lib/contexts/auth-context"

import { userRepository } from "../../services/repositories/supabase"

const HANDLE_REGEX = /^[a-z0-9_]+$/

function validateHandleFormat(value: string): string | null {
  if (!value.trim()) return "Handle is required"
  if (value.length < 3) return "Handle must be at least 3 characters"
  if (value.length > 30) return "Handle must be less than 30 characters"
  if (!HANDLE_REGEX.test(value))
    return "Only lowercase letters, numbers, and underscores"
  return null
}

export function useProfileEdit() {
  const router = useRouter()
  const { profile, setProfile } = useAuth()

  const [name, setName] = useState(profile?.name || "")
  const [handle, setHandle] = useState(profile?.handle || "")
  const [pronouns, setPronouns] = useState(profile?.pronouns || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [isSaving, setIsSaving] = useState(false)

  const [handleError, setHandleError] = useState<string | null>(null)
  const [isCheckingHandle, setIsCheckingHandle] = useState(false)
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)

  const originalHandle = profile?.handle || ""
  const handleChanged = handle !== originalHandle

  const checkHandleAvailability = useCallback(
    async (value: string) => {
      if (!value || value === originalHandle) {
        setHandleAvailable(null)
        return
      }

      const formatError = validateHandleFormat(value)
      if (formatError) {
        setHandleError(formatError)
        setHandleAvailable(null)
        return
      }

      setIsCheckingHandle(true)
      setHandleError(null)
      try {
        const available = await userRepository.checkHandleAvailable(value)
        setHandleAvailable(available)
        if (!available) {
          setHandleError("This handle is already taken")
        }
      } catch {
        // Failed to check handle
      } finally {
        setIsCheckingHandle(false)
      }
    },
    [originalHandle],
  )

  useEffect(() => {
    if (!handleChanged) {
      setHandleError(null)
      setHandleAvailable(null)
      return
    }

    const formatError = validateHandleFormat(handle)
    if (formatError) {
      setHandleError(formatError)
      setHandleAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkHandleAvailability(handle)
    }, 500)

    return () => clearTimeout(timer)
  }, [handle, handleChanged, checkHandleAvailability])

  const handleHandleChange = (value: string) => {
    setHandle(value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
  }

  const canSave =
    name.trim() && handle.trim() && !handleError && !isCheckingHandle

  const save = async () => {
    if (!profile || !canSave) return

    if (handleChanged && !handleAvailable) {
      Alert.alert("Error", "Please choose an available handle")
      return
    }

    setIsSaving(true)
    try {
      const updatedProfile = await userRepository.updateProfile(profile.id, {
        name: name.trim(),
        handle: handle.trim(),
        pronouns: pronouns.trim(),
        bio: bio.trim(),
      })
      setProfile(updatedProfile)
      router.back()
    } catch (error: any) {
      if (
        error.message?.includes("duplicate") ||
        error.message?.includes("unique")
      ) {
        setHandleError("This handle is already taken")
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return {
    name,
    setName,
    handle,
    handleHandleChange,
    pronouns,
    setPronouns,
    bio,
    setBio,
    isSaving,
    handleError,
    isCheckingHandle,
    handleAvailable,
    handleChanged,
    canSave,
    save,
  }
}
