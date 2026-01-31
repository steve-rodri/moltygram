import type { ReactNode } from "react"
import { useEffect } from "react"
import { AppState, Platform } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// Configure online manager with NetInfo
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

export { queryClient }

export function QueryProvider({ children }: { children: ReactNode }) {
  // Configure focus manager with AppState
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(status === "active")
      }
    })

    return () => subscription.remove()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
