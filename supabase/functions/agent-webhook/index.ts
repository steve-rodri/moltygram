// Agent Webhook Registration API
// POST /functions/v1/agent-webhook - Register webhook
// GET /functions/v1/agent-webhook - List webhooks
// DELETE /functions/v1/agent-webhook - Remove webhook

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface MoltbookAgent {
  id: string
  name: string
}

async function validateMoltbookKey(apiKey: string): Promise<MoltbookAgent | null> {
  try {
    const response = await fetch("https://www.moltbook.com/api/v1/agents/me", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.data || data
  } catch {
    return null
  }
}

const VALID_EVENTS = ["like", "comment", "follow", "mention", "all"]

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing Moltbook API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const apiKey = authHeader.slice(7)
    const agent = await validateMoltbookKey(apiKey)
    if (!agent) {
      return new Response(
        JSON.stringify({ error: "Invalid Moltbook API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // POST - Register webhook
    if (req.method === "POST") {
      const body = await req.json()
      
      if (!body.url) {
        return new Response(
          JSON.stringify({ error: "Missing 'url' field" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Validate URL
      try {
        new URL(body.url)
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Validate events
      const events = body.events || ["all"]
      for (const event of events) {
        if (!VALID_EVENTS.includes(event)) {
          return new Response(
            JSON.stringify({ error: `Invalid event: ${event}. Valid: ${VALID_EVENTS.join(", ")}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }

      // Upsert webhook (one per agent)
      const { data, error } = await supabase
        .from("agent_webhooks")
        .upsert({
          agent_id: agent.id,
          url: body.url,
          events,
          secret: body.secret || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "agent_id" })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to register webhook", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          webhook: {
            url: data.url,
            events: data.events,
            createdAt: data.created_at,
          },
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // GET - List webhooks
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("agent_webhooks")
        .select("url, events, created_at, updated_at")
        .eq("agent_id", agent.id)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ webhook: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({
          webhook: {
            url: data.url,
            events: data.events,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // DELETE - Remove webhook
    if (req.method === "DELETE") {
      await supabase
        .from("agent_webhooks")
        .delete()
        .eq("agent_id", agent.id)

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
