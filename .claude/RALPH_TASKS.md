# Retro Insta Backend Wiring Tasks

## Current Phase: COMPLETE

## Task Status Legend

- [ ] Not started
- [~] In progress
- [x] Complete

---

## Phase 1: Profile Integration

- [x] Update `/app/(tabs)/profile.tsx` to show real user profile from AuthContext
- [x] Update `/contexts/UserContext.tsx` to sync with backend (skipped - using AuthContext directly)
- [x] Update `/app/edit-profile.tsx` to save to backend
- [x] Wire up profile photo upload in edit-profile (edit-photo.tsx)

**Phase 1 Complete:** [x]

---

## Phase 2: Posts Integration

- [x] Update `/contexts/CreatePostContext.tsx` to upload images and save posts (via caption.tsx)
- [x] Update `/contexts/PostsContext.tsx` to fetch from backend
- [x] Update feed (`/app/(tabs)/index.tsx`) with real posts
- [x] Add infinite scroll/pagination to feed
- [x] Update PostCard for new Post type

**Phase 2 Complete:** [x]

---

## Phase 3: Interactions Integration

- [x] Wire up likes (PostCard, LikesModal)
- [x] Wire up comments (CommentsModal)
- [x] Update post detail page with real data

**Phase 3 Complete:** [x]

---

## Phase 4: Social Graph Integration

- [x] Wire up follow/unfollow on profile pages
- [x] Update followers/following lists
- [x] Wire up `/app/settings/blocked.tsx` with real blocking
- [x] Update search to use backend

**Phase 4 Complete:** [x]

---

## Phase 5: Notifications Integration

- [x] Update `/app/notifications.tsx` with real notifications
- [x] Add unread badge count

**Phase 5 Complete:** [x]

---

## All Phases Complete: [x]

When ALL phases are marked complete, output: <promise>BACKEND WIRING COMPLETE</promise>
