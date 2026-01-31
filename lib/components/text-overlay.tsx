import { useRef } from "react"
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native"

import {
  DEFAULT_TEXT_SIZE,
  FONT_FAMILIES,
  FontFamily,
  FontGenre,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  TEXT_COLORS,
  TextOverlayData,
  TextStyle,
} from "@lib/constants/text-overlay"

export {
  DEFAULT_TEXT_SIZE,
  FONT_FAMILIES,
  FontFamily,
  FontGenre,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  TEXT_COLORS,
  TextOverlayData,
  TextStyle,
}

function getTextStyleProps(overlay: TextOverlayData) {
  const fontConfig =
    FONT_FAMILIES.find((f) => f.value === overlay.fontFamily) ??
    FONT_FAMILIES[0]

  const textStyle: any = {
    color: overlay.color,
    fontSize: overlay.textSize,
    fontFamily: fontConfig.fontFamily,
    fontWeight: fontConfig.fontWeight ?? "700",
  }

  if (overlay.style === "outline") {
    textStyle.textShadowColor =
      overlay.color === "#000000" ? "#FFFFFF" : "#000000"
    textStyle.textShadowOffset = { width: 0, height: 0 }
    textStyle.textShadowRadius = 2
  } else if (overlay.style === "none") {
    textStyle.textShadowColor = "rgba(0, 0, 0, 0.75)"
    textStyle.textShadowOffset = { width: 1, height: 1 }
    textStyle.textShadowRadius = 3
  }

  return { textStyle, hasBackground: overlay.style === "background" }
}

function getBackgroundColor(hasBackground: boolean, color: string) {
  if (!hasBackground) return "transparent"
  return color === "#000000" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"
}

interface DraggableTextProps {
  overlay: TextOverlayData
  onPositionChange: (id: string, x: number, y: number) => void
  onTap: (id: string) => void
  containerSize: number
}

export function DraggableText({
  overlay,
  onPositionChange,
  onTap,
  containerSize,
}: DraggableTextProps) {
  const pan = useRef(
    new Animated.ValueXY({ x: overlay.x, y: overlay.y }),
  ).current
  const lastPosition = useRef({ x: overlay.x, y: overlay.y })
  const { textStyle, hasBackground } = getTextStyleProps(overlay)

  // Store callbacks and values in refs to avoid stale closures in PanResponder
  const onPositionChangeRef = useRef(onPositionChange)
  const onTapRef = useRef(onTap)
  const containerSizeRef = useRef(containerSize)
  const overlayIdRef = useRef(overlay.id)

  onPositionChangeRef.current = onPositionChange
  onTapRef.current = onTap
  containerSizeRef.current = containerSize
  overlayIdRef.current = overlay.id

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: lastPosition.current.x, y: lastPosition.current.y })
        pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset()
        const size = containerSizeRef.current
        const newX = Math.max(
          0,
          Math.min(size - 100, lastPosition.current.x + gesture.dx),
        )
        const newY = Math.max(
          0,
          Math.min(size - 50, lastPosition.current.y + gesture.dy),
        )
        lastPosition.current = { x: newX, y: newY }
        onPositionChangeRef.current(overlayIdRef.current, newX, newY)
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          onTapRef.current(overlayIdRef.current)
        }
      },
    }),
  ).current

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggableText,
        {
          transform: pan.getTranslateTransform(),
          backgroundColor: getBackgroundColor(hasBackground, overlay.color),
          borderRadius: hasBackground ? 4 : 0,
        },
      ]}
    >
      <Text style={textStyle}>{overlay.text}</Text>
    </Animated.View>
  )
}

export function StaticText({ overlay }: { overlay: TextOverlayData }) {
  const { textStyle, hasBackground } = getTextStyleProps(overlay)

  return (
    <View
      style={[
        styles.draggableText,
        {
          left: overlay.x,
          top: overlay.y,
          backgroundColor: getBackgroundColor(hasBackground, overlay.color),
          borderRadius: hasBackground ? 4 : 0,
        },
      ]}
    >
      <Text style={textStyle}>{overlay.text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  draggableText: {
    position: "absolute",
    padding: 8,
  },
})
