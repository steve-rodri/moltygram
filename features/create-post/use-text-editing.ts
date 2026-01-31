import { useRef, useState } from "react"
import { Dimensions } from "react-native"

import {
  DEFAULT_TEXT_SIZE,
  FontFamily,
  TextOverlayData,
  TextStyle,
} from "@lib/components/text-overlay"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const EDITING_ID = "_editing"

export function useTextEditing(
  currentOverlays: TextOverlayData[],
  setCurrentOverlays: (
    updater: (prev: TextOverlayData[]) => TextOverlayData[],
  ) => void,
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingOriginalId, setEditingOriginalId] = useState<string | null>(
    null,
  )
  const [textInputValue, setTextInputValue] = useState("")
  const [textFont, setTextFont] = useState<FontFamily>("classic")
  const [textSize, setTextSize] = useState(DEFAULT_TEXT_SIZE)
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [textStyle, setTextStyle] = useState<TextStyle>("none")
  const [editingPosition, setEditingPosition] = useState({
    x: SCREEN_WIDTH / 2 - 50,
    y: SCREEN_WIDTH / 2 - 25,
  })
  const originalOverlayRef = useRef<TextOverlayData | null>(null)

  const handleAddText = () => {
    setEditingOriginalId(null)
    setTextInputValue("")
    setTextFont("classic")
    setTextSize(DEFAULT_TEXT_SIZE)
    setTextColor("#FFFFFF")
    setTextStyle("none")
    setEditingPosition({ x: SCREEN_WIDTH / 2 - 50, y: SCREEN_WIDTH / 2 - 25 })
    originalOverlayRef.current = null
    setIsEditing(true)
  }

  const handleEditText = (id: string) => {
    const overlay = currentOverlays.find((t) => t.id === id)
    if (overlay) {
      setEditingOriginalId(id)
      setTextInputValue(overlay.text)
      setTextFont(overlay.fontFamily)
      setTextSize(overlay.textSize)
      setTextColor(overlay.color)
      setTextStyle(overlay.style)
      setEditingPosition({ x: overlay.x, y: overlay.y })
      originalOverlayRef.current = { ...overlay }
      setCurrentOverlays((prev) => prev.filter((t) => t.id !== id))
      setIsEditing(true)
    }
  }

  const handleDone = () => {
    if (!textInputValue.trim()) {
      setIsEditing(false)
      return
    }
    const newOverlay: TextOverlayData = {
      id: editingOriginalId ?? Date.now().toString(),
      text: textInputValue,
      x: editingPosition.x,
      y: editingPosition.y,
      fontFamily: textFont,
      textSize: textSize,
      color: textColor,
      style: textStyle,
    }
    setCurrentOverlays((prev) => [...prev, newOverlay])
    setIsEditing(false)
  }

  const handleDelete = () => {
    setIsEditing(false)
  }

  const handlePositionChange = (id: string, x: number, y: number) => {
    if (id === EDITING_ID) {
      setEditingPosition({ x, y })
    } else {
      setCurrentOverlays((prev) =>
        prev.map((t) => (t.id === id ? { ...t, x, y } : t)),
      )
    }
  }

  const editingOverlay: TextOverlayData | null = isEditing
    ? {
        id: EDITING_ID,
        text: textInputValue || "Text",
        x: editingPosition.x,
        y: editingPosition.y,
        fontFamily: textFont,
        textSize: textSize,
        color: textColor,
        style: textStyle,
      }
    : null

  return {
    isEditing,
    editingOriginalId,
    editingOverlay,
    textInputValue,
    textFont,
    textSize,
    textColor,
    textStyle,
    setTextInputValue,
    setTextFont,
    setTextSize,
    setTextColor,
    setTextStyle,
    handleAddText,
    handleEditText,
    handleDone,
    handleDelete,
    handlePositionChange,
  }
}
