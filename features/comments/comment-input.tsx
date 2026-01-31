import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { Image } from "expo-image"
import { Send, User, X } from "lucide-react-native"

import { useAuth } from "@lib/contexts/auth-context"
import { useTheme } from "@lib/contexts/theme-context"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { userRepository } from "../../services/repositories/supabase"
import { Comment, Profile } from "../../services/repositories/types"

import { MentionAutocomplete } from "./mention-autocomplete"

interface CommentInputProps {
  replyingTo: Comment | null
  onCancelReply: () => void
  onSubmit: (text: string, parentId?: string) => Promise<void>
}

export function CommentInput({
  replyingTo,
  onCancelReply,
  onSubmit,
}: CommentInputProps) {
  const { colors } = useTheme()
  const { profile } = useAuth()
  const inputRef = useRef<TextInput>(null)
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionUsers, setMentionUsers] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Focus input and add mention when replying
  useEffect(() => {
    if (replyingTo?.user?.handle) {
      setText(`@${replyingTo.user.handle} `)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [replyingTo])

  // Detect @mention while typing
  useEffect(() => {
    const match = text.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1])
    } else {
      setMentionQuery(null)
      setMentionUsers([])
    }
  }, [text])

  // Search users when mention query changes
  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length === 0) {
      setMentionUsers([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await userRepository.searchUsers(mentionQuery, 5)
        setMentionUsers(results)
      } catch {
        setMentionUsers([])
      } finally {
        setIsSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [mentionQuery])

  const handleSelectMention = (user: Profile) => {
    const newText = text.replace(/@\w*$/, `@${user.handle} `)
    setText(newText)
    setMentionQuery(null)
    setMentionUsers([])
  }

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit(text.trim(), replyingTo?.id)
      setText("")
      if (replyingTo) onCancelReply()
    } finally {
      setIsSubmitting(false)
    }
  }

  const showAutocomplete =
    mentionQuery !== null && (isSearching || mentionUsers.length > 0)

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderTopColor: colors.border },
      ]}
    >
      {showAutocomplete && (
        <View style={styles.autocompleteWrapper}>
          <MentionAutocomplete
            users={mentionUsers}
            isLoading={isSearching}
            onSelect={handleSelectMention}
          />
        </View>
      )}

      {replyingTo && (
        <View style={[styles.replyBanner, { backgroundColor: colors.surface }]}>
          <Text style={[styles.replyText, { color: colors.textSecondary }]}>
            Replying to{" "}
            <Text style={{ fontWeight: "600" }}>
              @{replyingTo.user?.handle}
            </Text>
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        {profile?.avatarUrl ? (
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.avatar}
            cachePolicy={IMAGE_CACHE_POLICY}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: colors.borderLight },
            ]}
          >
            <User size={14} color={colors.textTertiary} />
          </View>
        )}

        <BottomSheetTextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.text }]}
          onSubmitEditing={handleSubmit}
          editable={!isSubmitting}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          style={styles.sendButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Send
              size={20}
              color={text.trim() ? colors.primary : colors.textTertiary}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  autocompleteWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyText: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 8,
  },
  sendButton: {
    padding: 4,
  },
})
