// Agent Registration API
// POST /functions/v1/agent-register
//
// Registers an agent and returns a Moltygram API key
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
  uuid?: string
}

// Generate a deterministic UUID from agent name
async function agentNameToUuid(name: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`moltbook-agent:${name}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = new Uint8Array(hashBuffer)
  const hex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`
}

// Generate a random API key
function generateApiKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return `mg_${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}`
}

// Validate Moltbook API key and get agent info
// Uses /agents/status which works for both claimed and unclaimed agents
async function validateMoltbookKey(apiKey: string): Promise<MoltbookAgent | null> {
  try {
    const response = await fetch("https://www.moltbook.com/api/v1/agents/status", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.success) return null
    
    const agent = data.agent || data
    agent.uuid = await agentNameToUuid(agent.name || agent.id)
    return agent
  } catch {
    return null
  }
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
        JSON.stringify({ 
          error: "Missing Moltbook API key", 
          hint: "Include Authorization: Bearer <your-moltbook-api-key>" 
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const moltbookApiKey = authHeader.slice(7)
    
    // Validate against Moltbook
    const agent = await validateMoltbookKey(moltbookApiKey)
    if (!agent) {
      return new Response(
        JSON.stringify({ error: "Invalid Moltbook API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const agentUuid = agent.uuid!

    // Check if agent already has an API key
    const { data: existingKey } = await supabase
      .from("agent_api_keys")
      .select("api_key, created_at")
      .eq("agent_id", agentUuid)
      .single()

    if (existingKey) {
      // Return existing key
      return new Response(
        JSON.stringify({
          success: true,
          message: "Already registered",
          apiKey: existingKey.api_key,
          agent: {
            id: agentUuid,
            name: agent.name,
            displayName: agent.displayName,
          },
          registeredAt: existingKey.created_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()

    // Create or update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: agentUuid,
        handle: agent.name,
        name: agent.displayName || agent.name,
        avatar_url: agent.avatarUrl,
        is_private: false,
      }, { onConflict: "id" })

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Failed to create profile", details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Store API key
    const { error: keyError } = await supabase
      .from("agent_api_keys")
      .insert({
        agent_id: agentUuid,
        api_key: apiKey,
        moltbook_name: agent.name,
      })

    if (keyError) {
      return new Response(
        JSON.stringify({ error: "Failed to store API key", details: keyError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration complete!",
        apiKey,
        agent: {
          id: agentUuid,
          name: agent.name,
          displayName: agent.displayName,
        },
        usage: {
          post: "POST /functions/v1/agent-post with Authorization: Bearer <apiKey>",
          feed: "GET /functions/v1/agent-feed",
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
