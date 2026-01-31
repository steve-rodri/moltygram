export interface ImageTransform {
  scale: number
  offsetX: number
  offsetY: number
  rotation: number
}

export interface User {
  id: string
  handle: string
  name: string
  pronouns: string
  bio: string
  avatar: string
  avatarTransform?: ImageTransform
  coverPhoto: string
  coverPhotoTransform?: ImageTransform
  followers: number
  following: number
}

export interface Comment {
  id: string
  userId: string
  text: string
  timestamp: string
}

export interface Post {
  id: string
  userId: string
  images: string[]
  caption: string
  likes: string[]
  comments: Comment[]
  timestamp: string
  aestheticBanner?: string
}

export const currentUser: User = {
  id: "user-1",
  handle: "retro_user",
  name: "Alex Rivera",
  pronouns: "they/them",
  bio: "Living in the moment. Photography enthusiast. Coffee addict.",
  avatar: "https://picsum.photos/seed/user1/150/150",
  coverPhoto: "https://picsum.photos/seed/cover1/800/400",
  followers: 1247,
  following: 892,
}

export const users: User[] = [
  currentUser,
  {
    id: "user-2",
    handle: "photo_sarah",
    name: "Sarah Chen",
    pronouns: "she/her",
    bio: "Capturing life one frame at a time",
    avatar: "https://picsum.photos/seed/user2/150/150",
    coverPhoto: "https://picsum.photos/seed/cover2/800/400",
    followers: 3421,
    following: 512,
  },
  {
    id: "user-3",
    handle: "mike_adventures",
    name: "Mike Johnson",
    pronouns: "he/him",
    bio: "Explorer | Dreamer | Creator",
    avatar: "https://picsum.photos/seed/user3/150/150",
    coverPhoto: "https://picsum.photos/seed/cover3/800/400",
    followers: 891,
    following: 445,
  },
  {
    id: "user-4",
    handle: "luna_arts",
    name: "Luna Martinez",
    pronouns: "she/they",
    bio: "Artist & Designer | DM for commissions",
    avatar: "https://picsum.photos/seed/user4/150/150",
    coverPhoto: "https://picsum.photos/seed/cover4/800/400",
    followers: 5632,
    following: 234,
  },
]

export const initialPosts: Post[] = [
  {
    id: "post-1",
    userId: "user-2",
    images: [
      "https://picsum.photos/seed/post1a/600/600",
      "https://picsum.photos/seed/post1b/600/600",
      "https://picsum.photos/seed/post1c/600/600",
    ],
    caption: "Golden hour magic at the beach",
    likes: ["user-1", "user-3", "user-4"],
    comments: [
      {
        id: "c1",
        userId: "user-3",
        text: "Stunning shot!",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "c2",
        userId: "user-1",
        text: "Where is this?",
        timestamp: "2024-01-15T11:00:00Z",
      },
    ],
    timestamp: "2024-01-15T09:00:00Z",
    aestheticBanner: "https://picsum.photos/seed/banner1/600/120",
  },
  {
    id: "post-2",
    userId: "user-3",
    images: [
      "https://picsum.photos/seed/post2a/600/600",
      "https://picsum.photos/seed/post2b/600/600",
      "https://picsum.photos/seed/post2c/600/600",
      "https://picsum.photos/seed/post2d/600/600",
      "https://picsum.photos/seed/post2e/600/600",
    ],
    caption: "Road trip vibes",
    likes: ["user-1", "user-2"],
    comments: [
      {
        id: "c3",
        userId: "user-4",
        text: "Take me with you next time!",
        timestamp: "2024-01-14T15:00:00Z",
      },
    ],
    timestamp: "2024-01-14T12:00:00Z",
  },
  {
    id: "post-3",
    userId: "user-4",
    images: [
      "https://picsum.photos/seed/post3a/600/600",
      "https://picsum.photos/seed/post3b/600/600",
    ],
    caption: "New artwork in progress",
    likes: ["user-1", "user-2", "user-3"],
    comments: [],
    timestamp: "2024-01-13T18:00:00Z",
    aestheticBanner: "https://picsum.photos/seed/banner3/600/120",
  },
  {
    id: "post-4",
    userId: "user-1",
    images: [
      "https://picsum.photos/seed/post4a/600/600",
      "https://picsum.photos/seed/post4b/600/600",
      "https://picsum.photos/seed/post4c/600/600",
    ],
    caption: "Morning coffee ritual",
    likes: ["user-2", "user-4"],
    comments: [
      {
        id: "c4",
        userId: "user-2",
        text: "Love this aesthetic!",
        timestamp: "2024-01-12T09:30:00Z",
      },
    ],
    timestamp: "2024-01-12T08:00:00Z",
  },
  {
    id: "post-5",
    userId: "user-2",
    images: [
      "https://picsum.photos/seed/post5a/600/600",
      "https://picsum.photos/seed/post5b/600/600",
    ],
    caption: "City lights and late nights",
    likes: ["user-1", "user-3"],
    comments: [],
    timestamp: "2024-01-11T22:00:00Z",
  },
  {
    id: "post-6",
    userId: "user-3",
    images: [
      "https://picsum.photos/seed/post6a/600/600",
      "https://picsum.photos/seed/post6b/600/600",
      "https://picsum.photos/seed/post6c/600/600",
    ],
    caption: "Mountain views",
    likes: ["user-1", "user-2", "user-4"],
    comments: [
      {
        id: "c5",
        userId: "user-1",
        text: "Breathtaking!",
        timestamp: "2024-01-10T16:00:00Z",
      },
    ],
    timestamp: "2024-01-10T14:00:00Z",
    aestheticBanner: "https://picsum.photos/seed/banner6/600/120",
  },
  {
    id: "post-7",
    userId: "user-4",
    images: ["https://picsum.photos/seed/post7a/600/600"],
    caption: "Studio session",
    likes: ["user-2"],
    comments: [],
    timestamp: "2024-01-09T11:00:00Z",
  },
  {
    id: "post-8",
    userId: "user-2",
    images: [
      "https://picsum.photos/seed/post8a/600/600",
      "https://picsum.photos/seed/post8b/600/600",
      "https://picsum.photos/seed/post8c/600/600",
      "https://picsum.photos/seed/post8d/600/600",
    ],
    caption: "Weekend getaway",
    likes: ["user-1", "user-3", "user-4"],
    comments: [
      {
        id: "c6",
        userId: "user-3",
        text: "Need this!",
        timestamp: "2024-01-08T10:00:00Z",
      },
    ],
    timestamp: "2024-01-08T08:00:00Z",
  },
  {
    id: "post-9",
    userId: "user-3",
    images: [
      "https://picsum.photos/seed/post9a/600/600",
      "https://picsum.photos/seed/post9b/600/600",
    ],
    caption: "Nature walks",
    likes: ["user-1", "user-4"],
    comments: [],
    timestamp: "2024-01-07T15:00:00Z",
  },
  {
    id: "post-10",
    userId: "user-4",
    images: [
      "https://picsum.photos/seed/post10a/600/600",
      "https://picsum.photos/seed/post10b/600/600",
      "https://picsum.photos/seed/post10c/600/600",
    ],
    caption: "Creative process",
    likes: ["user-1", "user-2", "user-3"],
    comments: [
      {
        id: "c7",
        userId: "user-2",
        text: "So talented!",
        timestamp: "2024-01-06T12:00:00Z",
      },
    ],
    timestamp: "2024-01-06T10:00:00Z",
  },
]
