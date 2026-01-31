import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import * as Sentry from "@sentry/react-native"
import { Redirect, Stack, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useCSSVariable, useUniwind } from "uniwind"

import { CreatePostProvider } from "@features/create-post/create-post-provider"
import { DevMenu } from "@lib/components/dev-menu"
import { AuthProvider, useAuth } from "@lib/contexts/auth-context"
import { ThemeProvider } from "@lib/contexts/theme-context"
import { UserProvider } from "@lib/contexts/user-context"
import { useOTAUpdates } from "@lib/hooks/use-ota-updates"
import { usePushNotifications } from "@lib/hooks/use-push-notifications"
import { QueryProvider } from "@lib/providers/query-provider"

import "../global.css"

SplashScreen.preventAutoHideAsync()

Sentry.init({
  dsn: "https://76bb96f4d7d208bab2874b294064d70b@o4504124218081280.ingest.us.sentry.io/4510676119846912",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,
  integrations: [Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
})

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, profile, isLoading, isPreviewingOnboarding } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  if (isLoading) {
    return null
  }

  const inAuthGroup = segments[0] === "(auth)"
  const inOnboardingGroup = segments[0] === "(onboarding)"

  if (!session && !inAuthGroup) {
    return <Redirect href="/(auth)/welcome" />
  }

  if (session && !profile && !inOnboardingGroup) {
    return <Redirect href="/(onboarding)/create-handle" />
  }

  // Allow staying in onboarding during preview mode
  if (
    session &&
    profile &&
    (inAuthGroup || (inOnboardingGroup && !isPreviewingOnboarding))
  ) {
    return <Redirect href="/(tabs)" />
  }

  return <>{children}</>
}

function RootLayoutNav() {
  const { theme } = useUniwind()
  const isDark = theme === "dark"
  useOTAUpdates()
  usePushNotifications()

  const [primary, background, text, border, error] = useCSSVariable([
    "--color-primary",
    "--color-background",
    "--color-text",
    "--color-border",
    "--color-error",
  ]) as [string, string, string, string, string]

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary,
      background,
      card: background,
      text,
      border,
      notification: error,
    },
    fonts: {
      regular: { fontFamily: "System", fontWeight: "400" as const },
      medium: { fontFamily: "System", fontWeight: "500" as const },
      bold: { fontFamily: "System", fontWeight: "700" as const },
      heavy: { fontFamily: "System", fontWeight: "800" as const },
    },
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
          <Stack.Screen name="profile/[id]" options={{ title: "Profile" }} />
          <Stack.Screen
            name="settings/index"
            options={{
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="settings/appearance"
            options={{ title: "Appearance" }}
          />
          <Stack.Screen
            name="settings/app-icon"
            options={{ title: "App Icon" }}
          />
          <Stack.Screen
            name="settings/app-info"
            options={{ title: "App Info" }}
          />
          <Stack.Screen
            name="notifications"
            options={{ title: "Notifications" }}
          />
          <Stack.Screen name="create" options={{ headerShown: false }} />
          <Stack.Screen
            name="edit-photo"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ title: "Edit Profile" }}
          />
        </Stack>
      </AuthGate>
    </NavigationThemeProvider>
  )
}

export default Sentry.wrap(function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <CreatePostProvider>
                <BottomSheetModalProvider>
                  <RootLayoutNav />
                  <DevMenu />
                </BottomSheetModalProvider>
              </CreatePostProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  )
})
