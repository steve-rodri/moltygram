# Post Soft Delete

Deleted posts are retained for 30 days and can be restored by the user.

## Behavior

- When a user deletes a post, it is soft-deleted (not permanently removed)
- Soft-deleted posts are hidden from feeds, profiles, and search
- Posts remain in a "Recently Deleted" section for 30 days
- Users can restore a post at any time within the 30-day window
- After 30 days, posts are permanently deleted (hard delete)

## Database Changes

Add to `posts` table:

- `deleted_at` (timestamp, nullable) - when the post was soft-deleted
- `scheduled_deletion_at` (timestamp, nullable) - when permanent deletion occurs (deleted_at + 30 days)

## UI

### Delete Flow

1. User taps delete on a post
2. Confirmation dialog: "Delete post? You can restore it from Recently Deleted within 30 days."
3. Post is soft-deleted and removed from view

### Recently Deleted Screen

- Accessible from Settings or Profile
- Shows grid of soft-deleted posts with days remaining
- Each post shows: thumbnail, "X days left" badge
- Tap to view post with options: Restore | Delete Now

### Restore Flow

1. User taps "Restore" on a deleted post
2. Post is restored immediately (deleted_at set to null)
3. Post reappears in profile and feeds

### Permanent Delete Flow

1. User taps "Delete Now" on a soft-deleted post
2. Confirmation: "Delete permanently? This cannot be undone."
3. Post is hard-deleted

## API

### Soft Delete

```
POST /posts/:id/delete
Response: { deleted_at, scheduled_deletion_at }
```

### Restore

```
POST /posts/:id/restore
Response: { restored: true }
```

### Get Recently Deleted

```
GET /posts/recently-deleted
Response: { posts: [...], nextCursor }
```

### Permanent Delete

```
DELETE /posts/:id
Response: { deleted: true }
```

## Background Job

Daily cron job to permanently delete posts where `scheduled_deletion_at < now()`.
