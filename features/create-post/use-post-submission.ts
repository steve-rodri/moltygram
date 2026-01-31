import { useCallback, useRef } from "react"
import { Keyboard } from "react-native"
import ViewShot from "react-native-view-shot"
import { useRouter } from "expo-router"

import { useAuth } from "@lib/contexts/auth-context"

import { useCreatePost } from "../feed/use-posts"

import { CaptureContainerRef } from "./capture-container"

interface SubmitPostParams {
  selectedImages: string[]
  caption: string
  aestheticImage: string | null
  crossPostToMoltbook: boolean
  reset: () => void
}

export function usePostSubmission({
  selectedImages,
  caption,
  aestheticImage,
  crossPostToMoltbook,
  reset,
}: SubmitPostParams) {
  const router = useRouter()
  const { session, profile } = useAuth()
  const createPost = useCreatePost()

  const captureRef = useRef<CaptureContainerRef>(null)
  const aestheticCaptureRef = useRef<ViewShot>(null)

  const handlePost = useCallback(async () => {
    if (!session || !profile || createPost.isPending) return
    Keyboard.dismiss()

    const capturedImages = captureRef.current
      ? await captureRef.current.captureAll()
      : selectedImages

    let aestheticBannerUrl: string | undefined
    if (aestheticImage && aestheticCaptureRef.current?.capture) {
      aestheticBannerUrl = await aestheticCaptureRef.current.capture()
    }

    createPost.mutate(
      {
        images: capturedImages,
        caption: caption || undefined,
        aestheticBannerUrl,
        crossPostToMoltbook,
      },
      {
        onSuccess: () => {
          reset()
          router.dismissAll()
          router.push("/")
        },
      },
    )
  }, [
    session,
    profile,
    selectedImages,
    aestheticImage,
    caption,
    createPost.isPending,
    reset,
    router,
  ])

  return {
    captureRef,
    aestheticCaptureRef,
    handlePost,
    isPending: createPost.isPending,
  }
}
