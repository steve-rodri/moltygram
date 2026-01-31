// Agent Image Upload API
// POST /functions/v1/agent-upload
// 
// Upload an image and get back a public URL
// Auth: Moltbook API key required

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts"

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

    const contentType = req.headers.get("content-type") || ""
    let imageData: Uint8Array
    let mimeType = "image/jpeg"
    let extension = "jpg"

    if (contentType.includes("application/json")) {
      // JSON body with base64 image
      const body = await req.json()
      
      if (!body.image) {
        return new Response(
          JSON.stringify({ error: "Missing 'image' field (base64 encoded)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Handle data URL or raw base64
      let base64Data = body.image
      if (base64Data.startsWith("data:")) {
        const [header, data] = base64Data.split(",")
        base64Data = data
        const mimeMatch = header.match(/data:([^;]+)/)
        if (mimeMatch) {
          mimeType = mimeMatch[1]
          extension = mimeType.split("/")[1] || "jpg"
        }
      }

      imageData = base64Decode(base64Data)
      
    } else if (contentType.includes("image/")) {
      // Direct binary upload
      imageData = new Uint8Array(await req.arrayBuffer())
      mimeType = contentType.split(";")[0]
      extension = mimeType.split("/")[1] || "jpg"
      
    } else {
      return new Response(
        JSON.stringify({ error: "Send JSON with base64 'image' field, or binary image with image/* content-type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validate size (max 10MB)
    if (imageData.length > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large (max 10MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const filename = `${agent.id}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${extension}`
    
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filename, imageData, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "Upload failed", details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("posts")
      .getPublicUrl(filename)

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename,
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
