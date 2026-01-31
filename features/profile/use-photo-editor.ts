import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native"
import { useRouter } from "expo-router"

import { useAuth } from "@lib/contexts/auth-context"

import {
  storageRepository,
  userRepository,
} from "../../services/repositories/supabase"

import {
  getPhotoUpdates,
  getStorageBucket,
  getStoragePath,
  PhotoType,
} from "./photo-update-helpers"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface ImageDimensions {
  width: number
  height: number
}

export function usePhotoEditor(
  photoType: PhotoType,
  originalUri: string | undefined,
) {
  const router = useRouter()
  const { profile, setProfile } = useAuth()

  const isProfile = photoType === "profile"
  const existingTransform = isProfile
    ? profile?.avatarTransform
    : profile?.coverPhotoTransform

  const frameWidth = SCREEN_WIDTH - 48
  const frameHeight = isProfile ? frameWidth : frameWidth / (16 / 9)

  const scrollViewRef = useRef<ScrollView>(null)
  const [imageDimensions, setImageDimensions] =
    useState<ImageDimensions | null>(null)
  const [zoomScale, setZoomScale] = useState(existingTransform?.scale ?? 1)
  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(existingTransform?.rotation ?? 0)
  const [isReady, setIsReady] = useState(false)

  const getDisplaySize = useCallback(() => {
    if (!imageDimensions) return { width: frameWidth, height: frameHeight }

    const { width: imgW, height: imgH } = imageDimensions
    const aspectRatio = imgW / imgH
    const frameRatio = frameWidth / frameHeight

    if (isProfile) {
      if (aspectRatio > frameRatio) {
        return { width: frameWidth, height: frameWidth / aspectRatio }
      } else {
        return { width: frameHeight * aspectRatio, height: frameHeight }
      }
    } else {
      return { width: frameWidth, height: frameWidth / aspectRatio }
    }
  }, [imageDimensions, frameWidth, frameHeight, isProfile])

  const displaySize = getDisplaySize()
  const centerOffsetX = Math.max(0, (displaySize.width - frameWidth) / 2)
  const centerOffsetY = Math.max(0, (displaySize.height - frameHeight) / 2)

  useEffect(() => {
    if (!imageDimensions) return

    const initialX = existingTransform?.offsetX ?? centerOffsetX
    const initialY = existingTransform?.offsetY ?? centerOffsetY
    const initialScale = existingTransform?.scale ?? 1

    setTimeout(() => {
      scrollViewRef.current?.setNativeProps({ zoomScale: initialScale })
      scrollViewRef.current?.scrollTo({
        x: initialX,
        y: initialY,
        animated: false,
      })
      setContentOffset({ x: initialX, y: initialY })
      setIsReady(true)
    }, 50)
  }, [imageDimensions, existingTransform, centerOffsetX, centerOffsetY])

  const handleImageLoad = (e: {
    source: { width: number; height: number }
  }) => {
    setImageDimensions({ width: e.source.width, height: e.source.height })
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isReady) return
    setContentOffset(e.nativeEvent.contentOffset)
    setZoomScale(e.nativeEvent.zoomScale)
  }

  const reset = () => {
    setRotation(0)
    setZoomScale(1)
    setContentOffset({ x: centerOffsetX, y: centerOffsetY })
    scrollViewRef.current?.setNativeProps({ zoomScale: 1 })
    scrollViewRef.current?.scrollTo({
      x: centerOffsetX,
      y: centerOffsetY,
      animated: true,
    })
  }

  const save = async () => {
    if (!profile || !originalUri) return

    const transform = {
      scale: zoomScale,
      offsetX: contentOffset.x,
      offsetY: contentOffset.y,
      rotation,
    }
    const isLocalFile = !originalUri.startsWith("http")
    const optimisticUpdates = getPhotoUpdates(photoType, originalUri, transform)

    setProfile({ ...profile, ...optimisticUpdates })
    router.back()

    if (isLocalFile) {
      const bucket = getStorageBucket(photoType)
      const path = getStoragePath(photoType, profile.id)
      const uploadResult = await storageRepository.uploadImage(
        originalUri,
        bucket,
        path,
      )

      if (!uploadResult.error && uploadResult.url) {
        const finalUpdates = getPhotoUpdates(
          photoType,
          uploadResult.url,
          transform,
        )
        const updatedProfile = await userRepository.updateProfile(
          profile.id,
          finalUpdates,
        )
        setProfile(updatedProfile)
      }
    } else {
      const updates = getPhotoUpdates(photoType, originalUri, transform)
      await userRepository.updateProfile(profile.id, updates)
    }
  }

  return {
    scrollViewRef,
    imageDimensions,
    frameWidth,
    frameHeight,
    displaySize,
    zoomScale,
    setZoomScale,
    rotation,
    setRotation,
    handleImageLoad,
    handleScroll,
    reset,
    save,
    isProfile,
  }
}
