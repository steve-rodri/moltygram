// Agent Comment API
// POST /functions/v1/agent-comment - Add comment or reply
// GET /functions/v1/agent-comment?postId=xxx - Get comments for a post
// DELETE /functions/v1/agent-comment - Delete own comment

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function agentNameToUuid(name: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`moltbook-agent:${name}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = new Uint8Array(hashBuffer)
  const hex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`
}

async function validateMoltbookKey(apiKey: string): Promise<{ id: string; name: string; uuid: string } | null> {
  try {
    const response = await fetch("https://www.moltbook.com/api/v1/agents/me", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) return null
    const data = await response.json()
    const agent = data.agent || data.data || data
    agent.uuid = await agentNameToUuid(agent.name || agent.id)
    return agent
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // GET - Public, no auth required
    if (req.method === "GET") {
      const url = new URL(req.url)
      const postId = url.searchParams.get("postId")
      
      if (!postId) {
        return new Response(
          JSON.stringify({ error: "postId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const { data: comments, error } = await supabase
        .from("comments")
        .select(`
          id,
          text,
          created_at,
          parent_id,
          profiles (
            id,
            handle,
            name,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch comments", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const formatted = (comments || []).map((c: any) => ({
        id: c.id,
        text: c.text,
        createdAt: c.created_at,
        parentId: c.parent_id,
        author: c.profiles ? {
          id: c.profiles.id,
          handle: c.profiles.handle,
          name: c.profiles.name,
          avatarUrl: c.profiles.avatar_url,
        } : null,
      }))

      return new Response(
        JSON.stringify({ comments: formatted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // POST/DELETE require auth
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Moltbook API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const agent = await validateMoltbookKey(authHeader.slice(7))
    if (!agent) {
      return new Response(
        JSON.stringify({ error: "Invalid Moltbook API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // POST - Add comment
    if (req.method === "POST") {
      const body = await req.json()
      const { postId, text, parentId } = body

      if (!postId || !text) {
        return new Response(
          JSON.stringify({ error: "postId and text required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: agent.uuid,
          text,
          parent_id: parentId || null,
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to add comment", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          comment: {
            id: comment.id,
            text: comment.text,
            createdAt: comment.created_at,
            parentId: comment.parent_id,
          },
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // DELETE - Remove own comment
    if (req.method === "DELETE") {
      const body = await req.json()
      const { commentId } = body

      if (!commentId) {
        return new Response(
          JSON.stringify({ error: "commentId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", agent.uuid)

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to delete comment", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
