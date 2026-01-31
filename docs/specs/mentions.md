# @Mentions Feature

## Overview

Allow users to mention other users in comments and captions using `@username` syntax.

## Requirements

### Parsing

- Detect `@username` patterns in text
- Handle edge cases: `@@user`, `@user.name`, punctuation after handle

### UI Components

- Tappable @mentions that navigate to user profile
- Autocomplete dropdown when typing `@` in comment/caption input
- Styled differently from regular text (e.g., bold or colored)

### Backend

- Look up user IDs from handles when saving comment/caption
- Create `mention` notifications for each mentioned user
- Store mention metadata with comment/post (optional)

### Notifications

- Type: `mention`
- Message: `{actor} mentioned you in a comment/post`
- Deep link to the comment or post

## Open Questions

- Should mentions work in post captions or just comments?
- Limit on number of mentions per comment?
- Notify if mentioned user is blocked by the post owner?
