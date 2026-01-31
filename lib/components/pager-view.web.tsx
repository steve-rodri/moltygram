// Web stub for PagerView - not supported on web
import { forwardRef } from "react"
import { View, ViewProps } from "react-native"

interface PagerViewProps extends ViewProps {
  initialPage?: number
  onPageSelected?: (e: { nativeEvent: { position: number } }) => void
  children?: React.ReactNode
}

const PagerView = forwardRef<View, PagerViewProps>(
  ({ children, style, initialPage = 0, ...props }, ref) => {
    // On web, just render children in a simple view
    // The parent component handles showing only the selected page
    return (
      <View ref={ref} style={style} {...props}>
        {children}
      </View>
    )
  }
)

PagerView.displayName = "PagerView"

export default PagerView
