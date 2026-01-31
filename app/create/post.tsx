import { useLayoutEffect, useRef, useState } from "react"
import { ActivityIndicator, Text, TouchableOpacity } from "react-native"
import { HeaderBackButton } from "@react-navigation/elements"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"

import { useTheme } from "@lib/contexts/theme-context"

import {
  PostEditorContent,
  PostEditorContentRef,
  Step,
} from "../../features/create-post/post-editor-content"

export default function CreatePostScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { step: initialStep } = useLocalSearchParams<{ step?: Step }>()
  const { colors } = useTheme()

  const editorRef = useRef<PostEditorContentRef>(null)
  const [step, setStep] = useState<Step>(
    initialStep === "caption" ? "caption" : "edit",
  )
  const [isPending, setIsPending] = useState(false)

  const handleBack = () =>
    step === "caption" ? setStep("edit") : router.back()
  const handleNext = () => setStep("caption")
  const handlePost = () => editorRef.current?.handlePost()

  useLayoutEffect(() => {
    const isEdit = step === "edit"
    const rightDisabled = !isEdit && isPending

    navigation.setOptions({
      title: isEdit ? "Edit Photo" : "Caption",
      headerLeft: () => (
        <HeaderBackButton onPress={handleBack} tintColor={colors.text} />
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={isEdit ? handleNext : handlePost}
          disabled={rightDisabled}
          style={{ paddingHorizontal: 16 }}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: colors.primary,
                opacity: rightDisabled ? 0.5 : 1,
              }}
            >
              {isEdit ? "Next" : "Post"}
            </Text>
          )}
        </TouchableOpacity>
      ),
    })
  }, [navigation, colors, step, isPending])

  return (
    <PostEditorContent
      ref={editorRef}
      initialStep={step}
      onStepChange={setStep}
      onPendingChange={setIsPending}
    />
  )
}
