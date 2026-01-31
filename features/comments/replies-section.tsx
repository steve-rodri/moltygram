import { ReactNode, useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { ChevronDown, ChevronUp } from "lucide-react-native"

import { useTheme } from "@lib/contexts/theme-context"

import { commentRepository } from "../../services/repositories/supabase"
import { Comment } from "../../services/repositories/types"

interface RepliesSectionProps {
  commentId: string
  replyCount: number
  renderReply: (reply: Comment) => ReactNode
}

export function RepliesSection({
  commentId,
  replyCount,
  renderReply,
}: RepliesSectionProps) {
  const { colors } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (isExpanded) {
      setIsExpanded(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await commentRepository.getReplies(commentId)
      setReplies(data)
      setIsExpanded(true)
    } catch {
      // Failed to load replies
    } finally {
      setIsLoading(false)
    }
  }

  const replyText = replyCount === 1 ? "1 reply" : `${replyCount} replies`

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleToggle} style={styles.toggleButton}>
        <View style={[styles.line, { backgroundColor: colors.borderLight }]} />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isExpanded ? "Hide replies" : `View ${replyText}`}
            </Text>
            {isExpanded ? (
              <ChevronUp size={14} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={14} color={colors.textSecondary} />
            )}
          </>
        )}
      </TouchableOpacity>

      {isExpanded &&
        replies.map((reply) => (
          <View key={reply.id}>{renderReply(reply)}</View>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 48,
    marginBottom: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  line: {
    width: 24,
    height: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "500",
  },
})
