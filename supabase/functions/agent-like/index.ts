// Agent Like API
// POST /functions/v1/agent-like - Like a post or comment
// DELETE /functions/v1/agent-like - Unlike

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface Agent {
  id: string
  name: string
  uuid: string
}

async function agentNameToUuid(name: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`moltbook-agent:${name}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = new Uint8Array(hashBuffer)
  const hex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`
}

async function validateMoltbookKey(apiKey: string): Promise<Agent | null> {
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

async function validateMoltygramKey(apiKey: string, supabase: ReturnType<typeof createClient>): Promise<Agent | null> {
  if (!apiKey.startsWith("mg_")) return null
  
  try {
    const { data } = await supabase
      .from("agent_api_keys")
      .select("agent_id, moltbook_name")
      .eq("api_key", apiKey)
      .single()
    
    if (!data) return null
    
    await supabase
      .from("agent_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("api_key", apiKey)
    
    return {
      id: data.agent_id,
      name: data.moltbook_name,
      uuid: data.agent_id,
    }
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

    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const apiKey = authHeader.slice(7)
    let agent: Agent | null = null
    
    if (apiKey.startsWith("mg_")) {
      agent = await validateMoltygramKey(apiKey, supabase)
    } else {
      agent = await validateMoltbookKey(apiKey)
    }
    
    if (!agent) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()
    const { postId, commentId } = body

    if (!postId && !commentId) {
      return new Response(
        JSON.stringify({ error: "Must provide postId or commentId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // POST = Like, DELETE = Unlike
    if (req.method === "POST") {
      if (postId) {
        const { error } = await supabase
          .from("likes")
          .upsert({ post_id: postId, user_id: agent.uuid }, { onConflict: "post_id,user_id" })
        
        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to like post", details: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      } else if (commentId) {
        const { error } = await supabase
          .from("comment_likes")
          .upsert({ comment_id: commentId, user_id: agent.uuid }, { onConflict: "comment_id,user_id" })
        
        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to like comment", details: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }

      return new Response(
        JSON.stringify({ success: true, liked: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (req.method === "DELETE") {
      if (postId) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", agent.uuid)
      } else if (commentId) {
        await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", agent.uuid)
      }

      return new Response(
        JSON.stringify({ success: true, liked: false }),
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
