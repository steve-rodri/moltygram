import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, TextInput } from "react-native"

import { useAuth } from "@lib/contexts/auth-context"

const CODE_LENGTH = 6

export function useOtpVerification(phone: string | undefined) {
  const { verifyOtp, signInWithPhone } = useAuth()
  const inputRef = useRef<TextInput>(null)

  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(30)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleVerify = useCallback(
    async (verifyCode: string) => {
      if (!phone) {
        Alert.alert("Error", "Phone number not found")
        return
      }

      setIsLoading(true)
      const { error } = await verifyOtp(phone, verifyCode)
      setIsLoading(false)

      if (error) {
        Alert.alert("Verification Failed", error)
        setCode("")
      }
    },
    [phone, verifyOtp],
  )

  const handleCodeChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH)
      setCode(digits)

      if (digits.length === CODE_LENGTH) {
        handleVerify(digits)
      }
    },
    [handleVerify],
  )

  const handleResend = useCallback(async () => {
    if (!phone || resendCountdown > 0) return

    const { error } = await signInWithPhone(phone)
    if (error) {
      Alert.alert("Error", error)
    } else {
      setResendCountdown(30)
      Alert.alert("Code Sent", "A new verification code has been sent")
    }
  }, [phone, resendCountdown, signInWithPhone])

  const formatPhone = useCallback((phoneNumber: string) => {
    if (!phoneNumber) return ""
    const digits = phoneNumber.replace(/\D/g, "")
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    return phoneNumber
  }, [])

  return {
    inputRef,
    code,
    isLoading,
    resendCountdown,
    codeLength: CODE_LENGTH,
    handleCodeChange,
    handleResend,
    formatPhone,
  }
}
