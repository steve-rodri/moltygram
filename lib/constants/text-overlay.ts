export type FontGenre =
  | "modern"
  | "classic"
  | "signature"
  | "editor"
  | "poster"
  | "bubble"
  | "deco"
  | "squeeze"
  | "typewriter"
  | "strong"
  | "meme"
  | "elegant"
  | "directional"
  | "literature"
export type FontFamily = FontGenre // Alias for backwards compatibility
export type TextStyle = "none" | "background" | "outline"

export const MIN_TEXT_SIZE = 12
export const MAX_TEXT_SIZE = 128
export const DEFAULT_TEXT_SIZE = 24

export const FONT_FAMILIES: {
  value: FontGenre
  label: string
  fontFamily: string
  fontWeight?: string
}[] = [
  { value: "modern", label: "Modern", fontFamily: "System", fontWeight: "300" },
  {
    value: "classic",
    label: "Classic",
    fontFamily: "System",
    fontWeight: "400",
  },
  { value: "signature", label: "Signature", fontFamily: "Snell Roundhand" },
  { value: "editor", label: "Editor", fontFamily: "Georgia" },
  { value: "poster", label: "Poster", fontFamily: "System", fontWeight: "900" },
  { value: "bubble", label: "Bubble", fontFamily: "Marker Felt" },
  { value: "deco", label: "Deco", fontFamily: "Copperplate" },
  { value: "squeeze", label: "Squeeze", fontFamily: "Arial Narrow" },
  { value: "typewriter", label: "Typewriter", fontFamily: "Courier" },
  { value: "strong", label: "Strong", fontFamily: "Impact" },
  { value: "meme", label: "Meme", fontFamily: "Impact" },
  { value: "elegant", label: "Elegant", fontFamily: "Didot" },
  { value: "directional", label: "Directional", fontFamily: "Futura" },
  { value: "literature", label: "Literature", fontFamily: "Baskerville" },
]

export const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#007AFF",
  "#AF52DE",
]

export interface TextOverlayData {
  id: string
  text: string
  x: number
  y: number
  fontFamily: FontFamily
  textSize: number
  color: string
  style: TextStyle
}
