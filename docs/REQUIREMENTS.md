# App Requirements

## General

- Native mobile app (iOS and Android)
- Possibly web support later
- Don't change UI frequently like Instagram does
- MVP approach - minimum viable features first

## Profile Screen (Default Landing Screen)

| Requirement                            | Status         | Notes                                           |
| -------------------------------------- | -------------- | ----------------------------------------------- |
| Profile Photo: Square shape            | ✅ Implemented | Using rounded square (borderRadius: 16)         |
| Profile Photo Position: Left side      | ✅ Implemented | Left side with info on right                    |
| Handle displayed prominently           | ✅ Implemented | Shown in header as @handle                      |
| Name: Separate from handle             | ✅ Implemented | Displayed in profile section                    |
| Pronouns: Displayed next to name       | ✅ Implemented | Shows next to name                              |
| Bio: Small/minimal                     | ✅ Implemented | Semi-transparent container, compact             |
| Followers/Following: Two buttons       | ✅ Implemented | No counts shown, just "Followers" / "Following" |
| Settings Button: Top right corner      | ✅ Implemented | Gear icon in header                             |
| Add Post Button: Top left corner       | ✅ Implemented | Plus menu with options                          |
| Photo Grid: 3 columns, perfect squares | ✅ Implemented | SCREEN_WIDTH / 3                                |
| Infinite scroll through posts          | ✅ Implemented | ScrollView with posts                           |
| Customizable profile photo shapes      | ❌ Future      | Not implemented (future feature)                |
| Opens as default screen                | ✅ Implemented | Profile is now the default landing screen       |

## Post/Photo Screen

| Requirement                             | Status         | Notes                      |
| --------------------------------------- | -------------- | -------------------------- |
| Handle at top                           | ✅ Implemented | Author info in header      |
| Square photo, centered                  | ✅ Implemented | Full-width square images   |
| Custom Art Space (drawing, photo, text) | ✅ Implemented | "Aesthetic Banner" feature |
| Customizable background theme           | ✅ Implemented | Via aesthetic banner       |
| Like Button: Icon-based                 | ✅ Implemented | Heart icon                 |
| Comment Button: Opens modal             | ✅ Implemented | CommentsModal component    |
| Double-tap to like                      | ✅ Implemented | Via PostCard               |
| Caption displayed                       | ✅ Implemented | Below post                 |
| Date displayed (smaller text)           | ✅ Implemented | Formatted date             |
| Multi-photo support: Up to 5 photos     | ✅ Implemented | Carousel with dots         |
| Click to see who liked                  | ✅ Implemented | LikesModal component       |
| Back button for navigation              | ✅ Implemented | Stack navigation           |
| No tab bar on post view                 | ✅ Implemented | Modal presentation         |

## Feed Screen (Home)

| Requirement                             | Status         | Notes                         |
| --------------------------------------- | -------------- | ----------------------------- |
| App name at top                         | ✅ Implemented | "Retro Insta" title           |
| Posts from followed users               | ✅ Implemented | Feed filtering                |
| Post cards with header (photo + handle) | ✅ Implemented | PostCard component            |
| Square photos                           | ✅ Implemented | Aspect ratio 1:1              |
| Like/Comment buttons                    | ✅ Implemented | Icon buttons                  |
| Caption                                 | ✅ Implemented | Displayed below               |
| Full width posts                        | ✅ Implemented | No side margins               |
| Scrollable                              | ✅ Implemented | FlatList with infinite scroll |
| No stories (MVP)                        | ✅ Implemented | Not included                  |

## Search/Explore Screen

| Requirement                         | Status         | Notes                              |
| ----------------------------------- | -------------- | ---------------------------------- |
| App name at top                     | ❌ Missing     | **No app name shown on search**    |
| Search bar above tab bar (centered) | ✅ Implemented | Search bar at bottom above tab bar |
| Explore page with posts             | ✅ Implemented | Grid of posts                      |

## Tab Bar

| Requirement                       | Status         | Notes                        |
| --------------------------------- | -------------- | ---------------------------- |
| Three tabs: Feed, Search, Profile | ✅ Implemented | Home, Search, User icons     |
| Only visible on main screens      | ✅ Implemented | Hidden on post/profile views |
| Hidden on individual posts        | ✅ Implemented | Stack navigation             |

## Settings (Accessed from Profile)

| Requirement                    | Status         | Notes             |
| ------------------------------ | -------------- | ----------------- |
| Screen time/time limit feature | ✅ Implemented | screen-time.tsx   |
| Appearance/Theme               | ✅ Implemented | appearance.tsx    |
| Notifications                  | ✅ Implemented | notifications.tsx |
| Privacy                        | ✅ Implemented | privacy.tsx       |
| Blocked users                  | ✅ Implemented | blocked.tsx       |
| App icon                       | ✅ Implemented | app-icon.tsx      |

## Future Considerations

| Feature                                            | Status         |
| -------------------------------------------------- | -------------- |
| Customizable profile photo shapes                  | ❌ Not started |
| Web version                                        | ❌ Not started |
| Text overlay color dropper (pick color from image) | ❌ Not started |

---

# Summary of Changes Needed

## Pending Decisions

### Search Screen - App Name

**Current**: No header/app name shown
**Discussed**: App name displayed at top
**Location**: `app/(tabs)/search.tsx`
**Status**: Needs decision on whether to add

## Bonus Features Already Implemented

These weren't explicitly in requirements but were added:

- Aesthetic banner (custom art space) - matches "Custom Art Space" requirement
- Image filters during post creation
- Text overlays on photos
- Cover/backdrop photo for profile
- Notifications system
- Theme switching (light/dark)
- App icon customization
- Profile/cover photo editing with transformations

## What's Working Well

- Photo grid is perfect squares (3 columns) as requested
- Bio section is minimal as requested
- No stories (MVP approach)
- Tab bar visibility logic is correct
- Multi-photo posts with dot indicators (up to 5)
- Comments in modal as requested
- Pronouns displayed next to name
