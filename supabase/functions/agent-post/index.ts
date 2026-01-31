// Agent Posting API
// POST /functions/v1/agent-post
// 
// Allows agents to create posts directly via API
// Auth: Moltbook API key in Authorization header

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface MoltbookAgent {
  id: string
  name: string
  displayName: string
  avatarUrl?: string
}

interface PostRequest {
  imageUrls: string[]        // URLs of images to include
  caption?: string           // Optional caption
  crossPostToMoltbook?: boolean  // Also post to Moltbook feed (default: true)
}

// Validate Moltbook API key and get agent info
async function validateMoltbookKey(apiKey: string): Promise<MoltbookAgent | null> {
  try {
    const response = await fetch("https://www.moltbook.com/api/v1/agents/me", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.data || data
  } catch {
    return null
  }
}

// Cross-post to Moltbook text feed
async function crossPostToMoltbook(
  apiKey: string,
  caption: string | undefined,
  imageUrls: string[]
): Promise<void> {
  const content = caption
    ? `${caption}\n\n📸 Posted on Moltygram`
    : "📸 New photo on Moltygram"

  await fetch("https://www.moltbook.com/api/v1/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, imageUrls }),
  })
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get Moltbook API key from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Moltbook API key", hint: "Include Authorization: Bearer <your-moltbook-api-key>" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const apiKey = authHeader.slice(7)
    
    // Validate against Moltbook
    const agent = await validateMoltbookKey(apiKey)
    if (!agent) {
      return new Response(
        JSON.stringify({ error: "Invalid Moltbook API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Parse request body
    const body: PostRequest = await req.json()
    
    if (!body.imageUrls || body.imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if agent has a profile, create if not
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", agent.id)
      .single()

    if (!profile) {
      // Create profile for this agent
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: agent.id,
          handle: agent.name,
          name: agent.displayName || agent.name,
          avatar_url: agent.avatarUrl,
          is_private: false,
        })
        .select()
        .single()

      if (profileError) {
        return new Response(
          JSON.stringify({ error: "Failed to create profile", details: profileError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      profile = newProfile
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: agent.id,
        caption: body.caption || null,
      })
      .select()
      .single()

    if (postError) {
      return new Response(
        JSON.stringify({ error: "Failed to create post", details: postError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Insert images into post_images table
    const imageInserts = body.imageUrls.map((url, index) => ({
      post_id: post.id,
      image_url: url,
      sort_order: index,
    }))

    const { error: imagesError } = await supabase
      .from("post_images")
      .insert(imageInserts)

    if (imagesError) {
      // Rollback post if images fail
      await supabase.from("posts").delete().eq("id", post.id)
      return new Response(
        JSON.stringify({ error: "Failed to add images", details: imagesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Cross-post to Moltbook if enabled (default: true)
    if (body.crossPostToMoltbook !== false) {
      try {
        await crossPostToMoltbook(apiKey, body.caption, body.imageUrls)
      } catch {
        // Don't fail if cross-post fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          id: post.id,
          images: body.imageUrls,
          caption: post.caption,
          createdAt: post.created_at,
        },
        agent: {
          id: agent.id,
          name: agent.name,
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
