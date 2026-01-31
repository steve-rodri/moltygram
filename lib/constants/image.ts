// Cache policy for all images in the app
// Options: 'none' | 'disk' | 'memory' | 'memory-disk'
// - 'none': No caching at all
// - 'disk': Persistent disk cache (survives app restarts)
// - 'memory': RAM only, quickly purged when app needs memory
// - 'memory-disk': Both memory (fast) with disk fallback
export const IMAGE_CACHE_POLICY: "none" | "disk" | "memory" | "memory-disk" =
  "disk"

// Default transition duration for image loading (ms)
export const IMAGE_TRANSITION_MS = 200

// Blurhash placeholder for loading states
export const DEFAULT_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
