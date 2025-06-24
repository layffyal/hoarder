import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  from: string
  type: string
  text?: {
    body: string
  }
  timestamp: string
}

interface WhatsAppWebhook {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: {
            name: string
          }
          wa_id: string
        }>
        messages?: WhatsAppMessage[]
      }
      field: string
    }>
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify webhook (WhatsApp sends a verification request)
    const url = new URL(req.url)
    if (url.searchParams.has('hub.mode') && url.searchParams.has('hub.verify_token')) {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')
      
      // Verify token matches your WhatsApp app's verify token
      if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
        return new Response(challenge, { headers: corsHeaders })
      } else {
        return new Response('Forbidden', { status: 403, headers: corsHeaders })
      }
    }

    // Handle incoming messages
    const body: WhatsAppWebhook = await req.json()
    
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages
            if (messages) {
              for (const message of messages) {
                await processMessage(message, supabaseClient)
              }
            }
          }
        }
      }
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})

async function processMessage(message: WhatsAppMessage, supabase: any) {
  const phoneNumber = message.from
  const messageText = message.text?.body || ''

  // Extract URLs from message
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = messageText.match(urlRegex) || []

  if (urls.length === 0) {
    // No URLs found, send help message
    await sendWhatsAppMessage(phoneNumber, 
      "Hi! Send me any link and I'll save it to your Hoarder account. 📚\n\n" +
      "To get started, link your phone number in your Hoarder settings."
    )
    return
  }

  // Find user by phone number
  const { data: user, error: userError } = await supabase
    .from('user_phone_numbers')
    .select('user_id')
    .eq('phone_number', phoneNumber)
    .single()

  if (userError || !user) {
    await sendWhatsAppMessage(phoneNumber,
      "I don't recognize this phone number. Please link it to your Hoarder account first in the settings. 🔗"
    )
    return
  }

  // Process each URL
  for (const url of urls) {
    try {
      // Fetch metadata
      const metadata = await fetchUrlMetadata(url)
      
      // Generate tags
      const tags = generateTags(metadata.title, metadata.description, metadata.platform)
      
      // Save bookmark
      const { error: bookmarkError } = await supabase
        .from('bookmarks')
        .insert([{
          url: url,
          title: metadata.title || 'Unknown',
          description: metadata.description,
          image_url: metadata.image,
          platform: metadata.platform,
          tags,
          user_id: user.user_id,
          source: 'whatsapp'
        }])

      if (bookmarkError) {
        console.error('Error saving bookmark:', bookmarkError)
        await sendWhatsAppMessage(phoneNumber, 
          `❌ Failed to save: ${url}\n\nPlease try again or save it manually.`
        )
      } else {
        await sendWhatsAppMessage(phoneNumber,
          `✅ Saved: ${metadata.title}\n\nTags: ${tags.join(', ')}\n\nView it in your Hoarder dashboard! 📚`
        )
      }
    } catch (error) {
      console.error('Error processing URL:', url, error)
      await sendWhatsAppMessage(phoneNumber,
        `❌ Failed to process: ${url}\n\nPlease check the URL and try again.`
      )
    }
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  
  if (!phoneNumberId || !accessToken) {
    console.error('WhatsApp credentials not configured')
    return
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    )

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', await response.text())
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
  }
}

// Metadata fetching function (simplified version)
async function fetchUrlMetadata(url: string) {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    const html = data.contents

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
    
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
                     html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)

    return {
      title: titleMatch?.[1] || 'Unknown',
      description: descMatch?.[1],
      platform: detectPlatform(url)
    }
  } catch (error) {
    return {
      title: 'Unknown',
      platform: detectPlatform(url)
    }
  }
}

function detectPlatform(url: string): string {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('reddit.com')) return 'reddit'
  if (url.includes('tiktok.com')) return 'tiktok'
  return 'web'
}

function generateTags(title: string, description?: string, platform?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase()
  const tags: string[] = []
  
  const keywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'react', 'javascript', 'typescript', 'python', 'node',
    'startup', 'business', 'entrepreneur', 'funding',
    'design', 'ux', 'ui', 'product', 'user experience',
    'programming', 'coding', 'development', 'software',
    'technology', 'tech', 'innovation', 'future',
    'social media', 'marketing', 'growth', 'strategy'
  ]
  
  keywords.forEach(keyword => {
    if (text.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword)
    }
  })
  
  if (platform === 'twitter') tags.push('social media', 'twitter')
  if (platform === 'linkedin') tags.push('professional', 'networking')
  if (platform === 'reddit') tags.push('community', 'discussion')
  if (platform === 'tiktok') tags.push('video', 'social media')
  
  return tags.slice(0, 5)
} 