import { StyleSheet, View } from "react-native"

import { ImageContentFit } from "./create-post-provider"

interface FitIconProps {
  mode: ImageContentFit
}

export function FitIcon({ mode }: FitIconProps) {
  const isContain = mode === "contain"
  return (
    <View style={styles.container}>
      <View style={[styles.inner, isContain ? styles.contain : styles.cover]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  contain: {
    width: 12,
    height: 8,
  },
  cover: {
    width: 16,
    height: 16,
  },
})
