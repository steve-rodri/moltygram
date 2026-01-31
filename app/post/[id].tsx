import { Alert, TouchableOpacity } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Trash2 } from "lucide-react-native"

import { useAuth } from "@lib/contexts/auth-context"
import { useTheme } from "@lib/contexts/theme-context"

import { useDeletePost, usePost } from "../../features/feed/use-posts"
import { PostDetailContent } from "../../features/post-detail/post-detail-content"

export default function PostDetailScreen() {
  const { id, comments, commentId } = useLocalSearchParams<{
    id: string
    comments?: string
    commentId?: string
  }>()
  const router = useRouter()
  const { colors } = useTheme()
  const { profile } = useAuth()
  const { data: post, isLoading } = usePost(id)
  const deletePost = useDeletePost()

  const isOwnPost = profile && post?.userId === profile.id

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (post) {
            router.back()
            deletePost.mutate(post.id)
          }
        },
      },
    ])
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: post?.user?.handle || "Post",
          headerRight: isOwnPost
            ? () => (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{ paddingHorizontal: 8 }}
                >
                  <Trash2 size={20} color={colors.text} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />
      <PostDetailContent
        post={post}
        isLoading={isLoading}
        autoOpenComments={comments === "true"}
        scrollToCommentId={commentId}
      />
    </>
  )
}
