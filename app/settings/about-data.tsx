import { ScrollView, Text, View } from "react-native"
import { Stack } from "expo-router"

interface DataSectionProps {
  title: string
  description: string
}

function DataSection({ title, description }: DataSectionProps) {
  return (
    <View className="p-4 rounded-xl mb-3 bg-surface">
      <Text className="text-[15px] font-semibold mb-1.5 text-text">
        {title}
      </Text>
      <Text className="text-sm leading-5 text-text-secondary">
        {description}
      </Text>
    </View>
  )
}

export default function AboutDataScreen() {
  const sections = [
    {
      title: "What we collect",
      description:
        "We store your profile info (name, handle, bio, profile photo) and the photos you choose to post. When you grant photo access, we only use photos you choose to post, everything else stays on your device.",
    },
    {
      title: "Secure by default",
      description:
        "Your data is stored securely and all connections are encrypted.",
    },
    {
      title: "When you post a photo",
      description:
        "Photos you post are public and visible to anyone, unless your account is private.",
    },
    {
      title: "When you delete a post",
      description:
        "Deleted posts are permanently removed from our servers. The photo file is deleted, not just hidden.",
    },
    {
      title: "What we never do",
      description:
        "We never sell your data, share it with advertisers, or access photos you haven't posted. Your data is yours.",
    },
  ]

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "About Your Data" }} />
      <ScrollView contentContainerClassName="p-4">
        <Text className="text-sm leading-5 mb-4 text-text-secondary">
          We believe in being transparent about how your data is handled.
        </Text>

        {sections.map((section) => (
          <DataSection key={section.title} {...section} />
        ))}

        <Text className="text-[13px] text-center mt-2 mb-8 text-text-tertiary">
          Questions? Reach out to us anytime.
        </Text>
      </ScrollView>
    </View>
  )
}
