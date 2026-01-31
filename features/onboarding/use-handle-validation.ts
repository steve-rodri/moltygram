import { useCallback, useEffect, useState } from "react"

import { userRepository } from "@services/repositories/supabase"

export function useHandleValidation() {
  const [handle, setHandle] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const formatHandle = useCallback((text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 30)
  }, [])

  const validateFormat = useCallback((h: string): string | null => {
    if (h.length < 3) return "Handle must be at least 3 characters"
    if (h.length > 30) return "Handle must be 30 characters or less"
    if (!/^[a-z0-9_]+$/.test(h))
      return "Only letters, numbers, and underscores allowed"
    return null
  }, [])

  const checkAvailability = useCallback(
    async (value: string) => {
      const formatError = validateFormat(value)
      if (formatError) {
        setError(formatError)
        setIsAvailable(null)
        return
      }

      setIsChecking(true)
      setError(null)
      try {
        const available = await userRepository.checkHandleAvailable(value)
        setIsAvailable(available)
        if (!available) {
          setError("This handle is already taken")
        }
      } catch {
        // Failed to check handle
      } finally {
        setIsChecking(false)
      }
    },
    [validateFormat],
  )

  useEffect(() => {
    if (!handle) {
      setError(null)
      setIsAvailable(null)
      return
    }

    const formatError = validateFormat(handle)
    if (formatError) {
      setError(formatError)
      setIsAvailable(null)
      return
    }

    setError(null)
    setIsAvailable(null)

    const timer = setTimeout(() => {
      checkAvailability(handle)
    }, 500)

    return () => clearTimeout(timer)
  }, [handle, checkAvailability, validateFormat])

  const handleChange = useCallback(
    (text: string) => {
      setHandle(formatHandle(text))
    },
    [formatHandle],
  )

  const canContinue = handle.length >= 3 && isAvailable && !isChecking && !error

  return {
    handle,
    isChecking,
    error,
    isAvailable,
    handleChange,
    canContinue,
  }
}
