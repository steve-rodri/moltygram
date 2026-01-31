import { useRef, useState } from "react"
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import SegmentedControl from "@react-native-segmented-control/segmented-control"
import { Stack, useLocalSearchParams } from "expo-router"

import { useTheme } from "@lib/contexts/theme-context"

import ConnectionList from "../../../features/profile/connection-list"

// PagerView is native-only
const PagerView = Platform.OS === "web" 
  ? null 
  : require("react-native-pager-view").default

type TabType = "followers" | "following" | "mutuals"

const TAB_OPTIONS: TabType[] = ["followers", "following", "mutuals"]
const TAB_LABELS = ["Followers", "Following", "Mutuals"]

export default function ConnectionsScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: TabType }>()
  const { colors, isDark } = useTheme()
  const pagerRef = useRef<any>(null)

  const initialIndex = tab ? TAB_OPTIONS.indexOf(tab) : 0
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  )

  const handleTabChange = (index: number) => {
    setSelectedIndex(index)
    pagerRef.current?.setPage(index)
  }

  const handlePageChange = (index: number) => {
    setSelectedIndex(index)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Connections" }} />

      {Platform.OS === "ios" ? (
        <View style={styles.segmentedControlContainer}>
          <SegmentedControl
            values={TAB_LABELS}
            selectedIndex={selectedIndex}
            onChange={(event) =>
              handleTabChange(event.nativeEvent.selectedSegmentIndex)
            }
            appearance={isDark ? "dark" : "light"}
            backgroundColor={colors.surface}
            tintColor={colors.primary}
            fontStyle={{ color: colors.textSecondary }}
            activeFontStyle={{ color: "#fff" }}
          />
        </View>
      ) : (
        <View
          style={[styles.tabBar, { borderBottomColor: colors.borderLight }]}
        >
          {TAB_LABELS.map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.tab,
                selectedIndex === index && {
                  borderBottomColor: colors.text,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => handleTabChange(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      selectedIndex === index
                        ? colors.text
                        : colors.textSecondary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {Platform.OS === "web" || !PagerView ? (
        <View style={styles.pager}>
          <ConnectionList userId={id!} type={TAB_OPTIONS[selectedIndex]} />
        </View>
      ) : (
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={selectedIndex}
          onPageSelected={(e: any) => handlePageChange(e.nativeEvent.position)}
        >
          {TAB_OPTIONS.map((tabType) => (
            <View key={tabType} style={styles.page}>
              <ConnectionList userId={id!} type={tabType} />
            </View>
          ))}
        </PagerView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmentedControlContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  pager: { flex: 1 },
  page: { flex: 1 },
})
