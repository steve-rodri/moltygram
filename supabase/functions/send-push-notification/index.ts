import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

interface NotificationPayload {
  record: {
    id: string
    user_id: string
    type: "like" | "comment" | "follow" | "follow_request" | "mention"
    actor_id: string
    post_id?: string
    comment_id?: string
  }
}

interface PushMessage {
  to: string
  title: string
  body: string
  data: Record<string, unknown>
  sound: "default"
  badge?: number
}

serve(async (req: Request) => {
  try {
    const payload: NotificationPayload = await req.json()
    const { record } = payload

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get push tokens for the recipient
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", record.user_id)

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No push tokens found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get actor's profile for the notification message
    const { data: actor } = await supabase
      .from("profiles")
      .select("handle, name")
      .eq("id", record.actor_id)
      .single()

    if (!actor) {
      return new Response(JSON.stringify({ message: "Actor not found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Build notification message based on type
    const { title, body } = buildNotificationMessage(
      record.type,
      actor.name || actor.handle,
    )

    // Send to all user's devices
    const messages: PushMessage[] = tokens.map(
      ({ token }: { token: string }) => ({
        to: token,
        title,
        body,
        sound: "default",
        data: {
          type: record.type,
          postId: record.post_id,
          userId: record.actor_id,
          notificationId: record.id,
        },
      }),
    )

    // Send to Expo push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

function buildNotificationMessage(
  type: string,
  actorName: string,
): { title: string; body: string } {
  switch (type) {
    case "like":
      return { title: "New Like", body: `${actorName} liked your post` }
    case "comment":
      return {
        title: "New Comment",
        body: `${actorName} commented on your post`,
      }
    case "follow":
      return {
        title: "New Follower",
        body: `${actorName} started following you`,
      }
    case "follow_request":
      return {
        title: "Follow Request",
        body: `${actorName} wants to follow you`,
      }
    case "mention":
      return { title: "New Mention", body: `${actorName} mentioned you` }
    default:
      return {
        title: "New Notification",
        body: `${actorName} interacted with you`,
      }
  }
}
