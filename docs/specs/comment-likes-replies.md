# Comment Likes & Replies Spec

## Comment Likes

### Data Model Changes

**Comment interface** (types.ts)

- Add `likeCount: number`
- Add `hasLiked: boolean`

**Database**

- Create `comment_likes` table:
  - `id` (uuid, primary key)
  - `comment_id` (uuid, foreign key to comments)
  - `user_id` (uuid, foreign key to profiles)
  - `created_at` (timestamp)
  - Unique constraint on (comment_id, user_id)

### Repository Changes

Add to `CommentRepository`:

- `toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>`

### UI Changes

- Add heart icon to each comment row
- Show like count if > 0
- Tap to toggle like with optimistic update

---

## Comment Replies

### Data Model Changes

**Comment interface** (types.ts)

- Add `parentId?: string` (null for top-level comments)
- Add `replyCount: number`

**Database**

- Add `parent_id` column to `comments` table (nullable, self-referential foreign key)

### Repository Changes

Add to `CommentRepository`:

- `getReplies(commentId: string, cursor?: string): Promise<PaginatedResult<Comment>>`
- Update `addComment` to accept optional `parentId`

### UI Changes

- Show "View X replies" link under comments with replies
- Indent replies visually
- Add "Reply" button to each comment
- When replying, show "@handle" prefix in input
- Tapping reply scrolls to input and focuses it
