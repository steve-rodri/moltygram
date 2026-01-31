import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { useOtpVerification } from "@features/auth/use-otp-verification"

export default function VerifyOtpScreen() {
  const router = useRouter()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const insets = useSafeAreaInsets()
  const [text, primary, border] = useCSSVariable([
    "--color-text",
    "--color-primary",
    "--color-border",
  ]) as [string, string, string]
  const otp = useOtpVerification(phone)

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={text} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-8 pt-6">
        <Text className="text-[28px] font-bold mb-2 text-text">Enter code</Text>
        <Text className="text-base mb-8 text-text-secondary">
          We sent a code to {otp.formatPhone(phone || "")}
        </Text>

        <View className="items-center">
          <TextInput
            ref={otp.inputRef}
            className="absolute opacity-0 h-0"
            value={otp.code}
            onChangeText={otp.handleCodeChange}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
          />
          <View className="flex-row gap-2">
            {Array.from({ length: otp.codeLength }).map((_, index) => (
              <TouchableOpacity
                key={index}
                className="w-12 h-14 rounded-xl border-2 justify-center items-center bg-surface"
                style={{
                  borderColor: otp.code.length === index ? primary : border,
                }}
                onPress={() => otp.inputRef.current?.focus()}
              >
                <Text className="text-2xl font-semibold text-text">
                  {otp.code[index] || ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {otp.isLoading && (
          <Text className="text-center mt-6 text-sm text-text-secondary">
            Verifying...
          </Text>
        )}

        <TouchableOpacity
          className="mt-6 items-center"
          onPress={otp.handleResend}
          disabled={otp.resendCountdown > 0}
        >
          <Text
            className="text-sm font-medium"
            style={{
              color: otp.resendCountdown > 0 ? border : primary,
            }}
          >
            {otp.resendCountdown > 0
              ? `Resend code in ${otp.resendCountdown}s`
              : "Resend code"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
