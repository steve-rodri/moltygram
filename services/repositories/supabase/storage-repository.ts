import * as ImageManipulator from "expo-image-manipulator"

import { StorageRepository } from "../types"

import { supabase } from "./client"

const MAX_IMAGE_SIZE = 1200
const IMAGE_QUALITY = 0.8

async function optimizeImage(uri: string): Promise<string> {
  const fileUri = uri.startsWith("/") ? `file://${uri}` : uri

  const result = await ImageManipulator.manipulateAsync(
    fileUri,
    [{ resize: { width: MAX_IMAGE_SIZE } }],
    { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.WEBP },
  )

  return result.uri
}

export const storageRepository: StorageRepository = {
  async uploadImage(
    file: Blob | string,
    bucket: string,
    path: string,
  ): Promise<{ url: string; error?: string }> {
    try {
      let fileData: ArrayBuffer

      if (typeof file === "string") {
        // Optimize image before upload
        const optimizedUri = await optimizeImage(file)
        const response = await fetch(optimizedUri)
        fileData = await response.arrayBuffer()
      } else {
        fileData = await file.arrayBuffer()
      }

      if (fileData.byteLength === 0) {
        return { url: "", error: "File is empty" }
      }

      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, fileData, {
          contentType: "image/jpeg",
        })

      if (error) {
        return { url: "", error: error.message }
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      return { url: urlData.publicUrl }
    } catch (err) {
      return {
        url: "",
        error: err instanceof Error ? err.message : "Upload failed",
      }
    }
  },

  async deleteImage(bucket: string, path: string): Promise<{ error?: string }> {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      return { error: error.message }
    }

    return {}
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
}

// Helper function to generate unique file paths
export function generateImagePath(
  userId: string,
  type: "avatar" | "cover" | "post",
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${userId}/${type}_${timestamp}_${random}.jpg`
}
