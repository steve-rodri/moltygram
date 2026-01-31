import { useEffect, useState } from "react"
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"

// InputAccessoryView is iOS-only, stub it for web
const InputAccessoryView =
  Platform.OS === "ios"
    ? require("react-native").InputAccessoryView
    : ({ children }: { children: React.ReactNode }) => null
import { useIsFocused } from "@react-navigation/native"
import { useRouter } from "expo-router"

import { useFeed } from "../feed/use-posts"

import { ExploreGrid } from "./explore-grid"
import { SearchBar } from "./search-bar"
import { SearchResults } from "./search-results"
import { useUserSearch } from "./use-user-search"

const INPUT_ACCESSORY_ID = "search-input"

export function SearchContent() {
  const router = useRouter()
  const isFocused = useIsFocused()
  const { data: posts = [], refetch, isLoading } = useFeed()
  const { query, setQuery, results, isSearching, clearQuery, hasQuery } =
    useUserSearch()

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () =>
      setIsKeyboardVisible(true),
    )
    const hideSub = Keyboard.addListener("keyboardWillHide", () =>
      setIsKeyboardVisible(false),
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  return (
    <View className="flex-1 bg-background">
      {isKeyboardVisible && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={() => Keyboard.dismiss()}
        />
      )}

      {!isKeyboardVisible && (
        <ExploreGrid
          posts={posts}
          isLoading={isLoading}
          onRefresh={refetch}
          onPostPress={handlePostPress}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={clearQuery}
          inputAccessoryViewID={
            Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
          }
        />
      </View>

      {Platform.OS === "ios" && isFocused && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          {hasQuery && (
            <SearchResults
              results={results}
              isSearching={isSearching}
              onUserPress={handleUserPress}
            />
          )}
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            inputAccessoryViewID={INPUT_ACCESSORY_ID}
            autoFocus
          />
        </InputAccessoryView>
      )}
    </View>
  )
}
