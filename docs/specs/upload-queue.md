# Upload Queue System

## Overview

Reliable upload system for posts (images and future video support). Ensures uploads complete even after network failures, app crashes, or interruptions.

## Problem

- Image uploads can fail mid-way (network issues, app backgrounded)
- Multiple sequential uploads increase failure risk
- Lost uploads mean lost user content and bad UX
- Future video support (20-30 sec) will exacerbate these issues

## Architecture

### Queue Service

- Persist pending posts to AsyncStorage before uploading
- Each pending post stores: local image paths, caption, metadata, upload state
- Remove from queue only after server confirms post creation

### Upload Flow

1. User taps "Post"
2. Save to pending queue (AsyncStorage) with local file paths
3. Upload images (with progress tracking)
4. On all uploads complete → call createPost mutation
5. On success → remove from queue, navigate home
6. On failure → keep in queue, retry later

### Retry Logic

- Automatic retry on app launch for any pending posts
- Exponential backoff: 1s, 2s, 4s, 8s... (max 30s)
- Max 5 retry attempts before marking as failed
- User can manually retry failed posts

### Future: Resumable Uploads (TUS Protocol)

For video support, consider TUS (tus.io) resumable uploads:

- Chunk large files and upload incrementally
- Resume from last successful chunk after interruption
- Requires TUS-compatible server (tusd, or custom endpoint)
- tus-js-client works with React Native

## Data Model

```typescript
interface PendingPost {
  id: string
  localImages: string[] // Local file URIs
  uploadedImages: string[] // Successfully uploaded URLs
  caption?: string
  aestheticBannerPath?: string
  uploadedBannerUrl?: string
  status: "pending" | "uploading" | "failed"
  retryCount: number
  createdAt: string
  lastAttempt?: string
  error?: string
}
```

## Integration with TanStack Query

Split concerns:

- Queue handles persistence and upload orchestration
- TanStack mutation handles the final createPost API call
- Optimistic updates only after uploads complete (or skip entirely)

```typescript
// Simplified flow
async function processPost(pending: PendingPost) {
  // Upload images (queue service)
  const urls = await uploadImages(pending.localImages)

  // Create post (TanStack mutation)
  await createPostMutation.mutateAsync({ images: urls, caption })

  // Cleanup
  await removeFromQueue(pending.id)
}
```

## UI Considerations

- Show upload progress indicator
- Display pending/failed posts in a "drafts" section
- Allow retry or discard of failed posts
- Background upload notification (optional)

## Open Questions

- Show pending posts in feed optimistically or wait for server?
- Keep failed posts indefinitely or auto-delete after N days?
- Notify user when background upload completes?
- For videos: upload while recording or after?
