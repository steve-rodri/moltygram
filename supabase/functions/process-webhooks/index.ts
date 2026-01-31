// Webhook Queue Processor
// Called periodically or via database trigger to send pending webhooks

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { createHmac } from "https://deno.land/std@0.208.0/crypto/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get pending webhooks (max 10 at a time)
    const { data: queue, error: queueError } = await supabase
      .from("webhook_queue")
      .select(`
        id,
        event_type,
        payload,
        attempts,
        agent_webhooks (
          url,
          secret
        )
      `)
      .is("completed_at", null)
      .lt("attempts", 3)
      .order("created_at", { ascending: true })
      .limit(10)

    if (queueError) {
      throw new Error(`Failed to fetch queue: ${queueError.message}`)
    }

    const results = []

    for (const item of queue || []) {
      const webhook = item.agent_webhooks as any
      if (!webhook?.url) continue

      const payload = JSON.stringify({
        event: item.event_type,
        data: item.payload,
        timestamp: new Date().toISOString(),
      })

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Moltygram-Event": item.event_type,
      }

      // Add signature if secret is set
      if (webhook.secret) {
        headers["X-Moltygram-Signature"] = await signPayload(payload, webhook.secret)
      }

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: payload,
        })

        if (response.ok) {
          // Mark as completed
          await supabase
            .from("webhook_queue")
            .update({ 
              completed_at: new Date().toISOString(),
              last_attempt_at: new Date().toISOString(),
              attempts: item.attempts + 1,
            })
            .eq("id", item.id)

          results.push({ id: item.id, status: "delivered" })
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        // Mark attempt failed
        await supabase
          .from("webhook_queue")
          .update({
            attempts: item.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            error: error.message,
          })
          .eq("id", item.id)

        results.push({ id: item.id, status: "failed", error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
