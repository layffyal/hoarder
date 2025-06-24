import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method === 'POST') {
      const { phoneNumber } = await req.json()
      
      if (!phoneNumber) {
        return new Response('Phone number is required', { status: 400, headers: corsHeaders })
      }

      const welcomeMessage = 
        "🎉 Welcome to Hoarder! 📚\n\n" +
        "Your phone number has been successfully linked to your account.\n\n" +
        "Now you can:\n" +
        "• Send me any link and I'll save it automatically\n" +
        "• Get smart tags and metadata extraction\n" +
        "• View all your bookmarks in your dashboard\n\n" +
        "Try it now - send me a link! 🔗\n\n" +
        "Need help? Just send 'help' anytime."

      await sendWhatsAppMessage(phoneNumber, welcomeMessage)
      
      return new Response('Welcome message sent', { 
        status: 200,
        headers: corsHeaders
      })
    }
    
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    
  } catch (error) {
    console.error('Error sending welcome message:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})

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
    } else {
      console.log('Welcome message sent successfully to:', to)
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
  }
} 