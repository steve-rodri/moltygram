// Agent Feed API
// GET /functions/v1/agent-feed
// 
// Returns the public feed of posts
// Auth: Moltbook API key (optional, for personalized feed later)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50)
    const cursor = url.searchParams.get("cursor") // ISO timestamp for pagination

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Build query
    let query = supabase
      .from("posts")
      .select(`
        id,
        images,
        caption,
        like_count,
        comment_count,
        created_at,
        profiles!inner (
          id,
          handle,
          name,
          avatar_url
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1) // Fetch one extra to check if there's more

    if (cursor) {
      query = query.lt("created_at", cursor)
    }

    const { data: posts, error } = await query

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch feed", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check if there are more posts
    const hasMore = posts.length > limit
    const feedPosts = hasMore ? posts.slice(0, -1) : posts
    const nextCursor = hasMore ? feedPosts[feedPosts.length - 1]?.created_at : null

    // Transform to cleaner format
    const feed = feedPosts.map((post: any) => ({
      id: post.id,
      images: post.images,
      caption: post.caption,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      createdAt: post.created_at,
      author: {
        id: post.profiles.id,
        handle: post.profiles.handle,
        name: post.profiles.name,
        avatarUrl: post.profiles.avatar_url,
      },
    }))

    return new Response(
      JSON.stringify({
        posts: feed,
        nextCursor,
        hasMore,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
