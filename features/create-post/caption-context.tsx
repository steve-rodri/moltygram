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
  resetCaption: () => void
}

const CaptionContext = createContext<CaptionContextValue | null>(null)

export function CaptionProvider({ children }: { children: ReactNode }) {
  const [caption, setCaption] = useState("")

  const resetCaption = useCallback(() => {
    setCaption("")
  }, [])

  return (
    <CaptionContext.Provider value={{ caption, setCaption, resetCaption }}>
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
