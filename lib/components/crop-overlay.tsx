import { useRef } from "react"
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const CROP_HEIGHT = 120

interface CropOverlayProps {
  cropY: number
  onCropChange: (y: number) => void
  imageSize: number
  disabled?: boolean
}

export function CropOverlay({
  cropY,
  onCropChange,
  imageSize,
  disabled,
}: CropOverlayProps) {
  const pan = useRef(new Animated.Value(cropY)).current
  const lastY = useRef(cropY)

  const maxY = imageSize - CROP_HEIGHT

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) =>
        evt.nativeEvent.touches.length === 1,
      onMoveShouldSetPanResponder: (evt) =>
        evt.nativeEvent.touches.length === 1,
      onPanResponderTerminationRequest: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(lastY.current)
        pan.setValue(0)
      },
      onPanResponderMove: (evt, gesture) => {
        if (evt.nativeEvent.touches.length > 1) return
        Animated.event([null, { dy: pan }], { useNativeDriver: false })(
          evt,
          gesture,
        )
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset()
        const newY = Math.max(0, Math.min(maxY, lastY.current + gesture.dy))
        lastY.current = newY
        pan.setValue(newY)
        onCropChange(newY)
      },
    }),
  ).current

  return (
    <View
      style={styles.container}
      pointerEvents={disabled ? "none" : "box-none"}
    >
      <Animated.View
        style={[styles.topOverlay, { height: pan }]}
        pointerEvents="none"
      />
      <Animated.View
        {...(disabled ? {} : panResponder.panHandlers)}
        style={[styles.cropArea, { height: CROP_HEIGHT }]}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <View style={styles.cropBorder} pointerEvents="none" />
      </Animated.View>
      <View style={[styles.bottomOverlay, { flex: 1 }]} pointerEvents="none" />
    </View>
  )
}

export { CROP_HEIGHT }

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: SCREEN_WIDTH,
  },
  cropArea: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  cropBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#fff",
  },
  bottomOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: SCREEN_WIDTH,
  },
})
