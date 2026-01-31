import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronRight } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { SkeletonImage } from "@lib/components/skeleton-image"
import { FollowStatus, Post, Profile } from "@services/repositories/types"

import { TransformedImage } from "./transformed-image"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const GRID_SIZE = SCREEN_WIDTH / 3

interface ProfileContentProps {
  profile: Profile
  posts: Post[]
  isCurrentUser: boolean
  headerHeight: number
  bottomPadding?: number
  followStatus?: FollowStatus
  onFollow?: () => void
  onUnfollow?: () => void
  onEditProfile?: () => void
  refreshing?: boolean
  onRefresh?: () => void
}

function getFollowButtonText(status: FollowStatus): string {
  if (status === "following") return "Following"
  if (status === "requested") return "Requested"
  return "Follow"
}

export function ProfileContent({
  profile,
  posts,
  isCurrentUser,
  headerHeight,
  bottomPadding = 0,
  followStatus = "none",
  onFollow,
  onUnfollow,
  onEditProfile,
  refreshing,
  onRefresh,
}: ProfileContentProps) {
  const router = useRouter()
  const [background, surface, text, textSecondary, border] = useCSSVariable([
    "--color-background",
    "--color-surface",
    "--color-text",
    "--color-text-secondary",
    "--color-border",
  ]) as [string, string, string, string, string]

  const hasCover = !!profile.coverPhotoUrl
  const textColor = hasCover ? "#fff" : text
  const secondaryTextColor = hasCover ? "rgba(255,255,255,0.8)" : textSecondary

  return (
    <ScrollView
      className="flex-1 bg-background"
      bounces={!!onRefresh}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={textSecondary}
          />
        ) : undefined
      }
    >
      <View className="relative bg-background">
        <TransformedImage
          uri={profile.coverPhotoUrl ?? ""}
          transform={profile.coverPhotoTransform}
          containerStyle={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          placeholderColor={background}
        />
        <View
          className="p-4 pb-3"
          style={{
            backgroundColor: hasCover ? "rgba(0,0,0,0.4)" : "transparent",
            paddingTop: headerHeight + 12,
          }}
        >
          <View className="flex-row gap-4">
            <TransformedImage
              uri={profile.avatarUrl ?? ""}
              transform={profile.avatarTransform}
              containerStyle={{
                width: 96,
                height: 96,
                borderRadius: 8,
                overflow: "hidden",
              }}
              placeholderColor={surface}
              placeholderIconColor={textSecondary}
            />
            <View className="flex-1 justify-between">
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-base font-semibold"
                  style={{ color: textColor }}
                >
                  {profile.name}
                </Text>
                {profile.pronouns && (
                  <Text
                    className="text-sm"
                    style={{ color: secondaryTextColor }}
                  >
                    {profile.pronouns}
                  </Text>
                )}
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-row items-center gap-0.5"
                  onPress={() =>
                    router.push(
                      `/profile/${profile.id}/connections?tab=followers`,
                    )
                  }
                >
                  <Text className="text-sm" style={{ color: textColor }}>
                    Followers
                  </Text>
                  <ChevronRight size={14} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-0.5"
                  onPress={() =>
                    router.push(
                      `/profile/${profile.id}/connections?tab=following`,
                    )
                  }
                >
                  <Text className="text-sm" style={{ color: textColor }}>
                    Following
                  </Text>
                  <ChevronRight size={14} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-0.5"
                  onPress={() =>
                    router.push(
                      `/profile/${profile.id}/connections?tab=mutuals`,
                    )
                  }
                >
                  <Text className="text-sm" style={{ color: textColor }}>
                    Mutuals
                  </Text>
                  <ChevronRight size={14} color={textColor} />
                </TouchableOpacity>
              </View>
              {isCurrentUser ? (
                <TouchableOpacity
                  className="mt-1.5 border rounded-lg py-2 px-6 self-start min-w-[100px] items-center"
                  style={{
                    backgroundColor: hasCover
                      ? "rgba(255,255,255,0.2)"
                      : surface,
                    borderColor: hasCover ? "#fff" : border,
                  }}
                  onPress={onEditProfile}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: hasCover ? "#fff" : text }}
                  >
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="mt-1.5 border rounded-lg py-2 px-6 self-start min-w-[100px] items-center"
                  style={{
                    backgroundColor:
                      followStatus === "following"
                        ? "rgba(255,255,255,0.1)"
                        : hasCover
                          ? "rgba(255,255,255,0.2)"
                          : surface,
                    borderColor: hasCover ? "#fff" : border,
                  }}
                  onPress={followStatus === "none" ? onFollow : onUnfollow}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: hasCover ? "#fff" : text }}
                  >
                    {getFollowButtonText(followStatus)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {profile.bio && (
            <View
              className="mt-2 rounded-lg p-2"
              style={{
                backgroundColor: hasCover
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
                paddingHorizontal: hasCover ? 8 : 4,
              }}
            >
              <Text className="text-sm leading-5" style={{ color: textColor }}>
                {profile.bio}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        className="flex-row flex-wrap"
        style={{ paddingBottom: bottomPadding }}
      >
        {posts.length === 0 ? (
          <View
            className="flex-1 items-center justify-center py-12"
            style={{ width: SCREEN_WIDTH }}
          >
            <Text className="text-sm text-text-secondary">No posts yet</Text>
          </View>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() => router.push(`/post/${post.id}`)}
            >
              <SkeletonImage
                source={{ uri: post.images[0] }}
                style={{ width: GRID_SIZE, height: GRID_SIZE }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}
