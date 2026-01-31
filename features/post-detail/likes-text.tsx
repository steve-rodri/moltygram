import { Text } from "react-native"
import { useRouter } from "expo-router"

import { Post } from "../../services/repositories/types"

interface LikesTextProps {
  post: Post
  color: string
  onOpenLikes: () => void
}

function CurrentUserLikedContent({
  post,
  onOpenLikes,
}: {
  post: Post
  onOpenLikes: () => void
}) {
  return (
    <>
      <Text className="font-semibold">you</Text>
      {post.likeCount > 1 && (
        <Text className="font-semibold" onPress={onOpenLikes}>
          {" and others"}
        </Text>
      )}
    </>
  )
}

function OtherUserLikedContent({
  post,
  onOpenLikes,
}: {
  post: Post
  onOpenLikes: () => void
}) {
  const router = useRouter()

  const handleLikerPress = () => {
    if (post.lastLiker) {
      router.push(`/profile/${post.lastLiker.id}`)
    }
  }

  return (
    <>
      <Text className="font-semibold" onPress={handleLikerPress}>
        {post.lastLiker?.handle || "someone"}
      </Text>
      {post.likeCount > 1 && (
        <Text className="font-semibold" onPress={onOpenLikes}>
          {" and others"}
        </Text>
      )}
    </>
  )
}

export function LikesText({ post, color, onOpenLikes }: LikesTextProps) {
  if (post.likeCount === 0) {
    return null
  }

  return (
    <Text className="text-[15px] mb-2" style={{ color }}>
      Liked by{" "}
      {post.hasLiked ? (
        <CurrentUserLikedContent post={post} onOpenLikes={onOpenLikes} />
      ) : (
        <OtherUserLikedContent post={post} onOpenLikes={onOpenLikes} />
      )}
    </Text>
  )
}
