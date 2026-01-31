import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

interface CaptionContextValue {
  caption: string
  setCaption: (caption: string) => void
  crossPostToMoltbook: boolean
  setCrossPostToMoltbook: (value: boolean) => void
  resetCaption: () => void
}

const CaptionContext = createContext<CaptionContextValue | null>(null)

export function CaptionProvider({ children }: { children: ReactNode }) {
  const [caption, setCaption] = useState("")
  const [crossPostToMoltbook, setCrossPostToMoltbook] = useState(true) // Default to true

  const resetCaption = useCallback(() => {
    setCaption("")
    setCrossPostToMoltbook(true)
  }, [])

  return (
    <CaptionContext.Provider
      value={{
        caption,
        setCaption,
        crossPostToMoltbook,
        setCrossPostToMoltbook,
        resetCaption,
      }}
    >
      {children}
    </CaptionContext.Provider>
  )
}

export function useCaption() {
  const context = useContext(CaptionContext)
  if (!context) {
    throw new Error("useCaption must be used within CaptionProvider")
  }
  return context
}
