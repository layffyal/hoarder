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
    const url = new URL(req.url)
    
    // Handle webhook verification
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')
      
      // You should set this verify token in your Meta Developer Console
      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'hoarder_webhook_token'
      
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully')
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      } else {
        console.log('Webhook verification failed')
        return new Response('Forbidden', { status: 403 })
      }
    }
    
    // Handle incoming webhook messages
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Received webhook:', JSON.stringify(body, null, 2))
      
      // Verify this is a WhatsApp webhook
      if (body.object !== 'whatsapp_business_account') {
        return new Response('Not a WhatsApp webhook', { status: 400 })
      }
      
      // Process each entry
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value
            
            // Process each message
            if (value.messages && value.messages.length > 0) {
              const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? ''
              )
              
              for (const message of value.messages) {
                await processMessage(message, supabase)
              }
            }
          }
        }
      }
      
      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    return new Response('Method not allowed', { status: 405 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

async function processMessage(message: WhatsAppMessage, supabase: any) {
  const phoneNumber = message.from
  const messageText = message.text?.body || ''

  // Normalize phone number - WhatsApp sends with + prefix
  const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`

  // Handle help command
  if (messageText.toLowerCase().trim() === 'help') {
    await sendWhatsAppMessage(phoneNumber,
      "🤖 Hoarder WhatsApp Bot Help\n\n" +
      "📚 How to use:\n" +
      "• Send me any link and I'll save it automatically\n" +
      "• I'll extract metadata and generate smart tags\n" +
      "• View all your bookmarks in your Hoarder dashboard\n\n" +
      "🔗 Supported platforms:\n" +
      "• Social: Twitter/X, LinkedIn, Reddit, TikTok, Instagram, Pinterest\n" +
      "• Content: Medium, Substack, YouTube, Vimeo, Dev.to, Hacker News\n" +
      "• Tech: GitHub, Stack Overflow, Product Hunt, Dribbble, Behance\n" +
      "• News: NYTimes, WSJ, The Verge, TechCrunch, and more\n" +
      "• Tools: Notion, Roam, Obsidian, Google Docs, Loom\n" +
      "• Learning: Coursera, Udemy\n" +
      "• Shopping: Amazon, Etsy\n" +
      "• Reading: Pocket, Instapaper\n" +
      "• Any website with links\n\n" +
      "💡 Tips:\n" +
      "• Send multiple links in one message\n" +
      "• I'll tag content automatically\n" +
      "• Check your dashboard for saved bookmarks\n\n" +
      "Need to unlink your number? Go to Hoarder settings."
    )
    return
  }

  // Extract URLs from message
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = messageText.match(urlRegex) || []

  if (urls.length === 0) {
    // No URLs found, send help message
    await sendWhatsAppMessage(phoneNumber, 
      "Hi! Send me any link and I'll save it to your Hoarder account. 📚\n\n" +
      "Type 'help' for more information or send a link to get started!"
    )
    return
  }

  // Find user by phone number (try both formats)
  let { data: user, error: userError } = await supabase
    .from('user_phone_numbers')
    .select('user_id')
    .eq('phone_number', normalizedPhone)
    .single()

  // If not found with + prefix, try without
  if (userError || !user) {
    const phoneWithoutPlus = normalizedPhone.replace('+', '')
    const { data: user2, error: userError2 } = await supabase
      .from('user_phone_numbers')
      .select('user_id')
      .eq('phone_number', phoneWithoutPlus)
      .single()
    
    if (userError2 || !user2) {
      await sendWhatsAppMessage(phoneNumber,
        "I don't recognize this phone number. Please link it to your Hoarder account first in the settings. 🔗\n\n" +
        "Type 'help' for more information."
      )
      return
    }
    user = user2
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
          `❌ Failed to save: ${url}\n\nPlease try again or save it manually.\n\nType 'help' for assistance.`
        )
      } else {
        await sendWhatsAppMessage(phoneNumber,
          `✅ Saved: ${metadata.title}\n\nTags: ${tags.join(', ')}\n\nView it in your Hoarder dashboard! 📚\n\nSend more links or type 'help' for assistance.`
        )
      }
    } catch (error) {
      console.error('Error processing URL:', url, error)
      await sendWhatsAppMessage(phoneNumber,
        `❌ Failed to process: ${url}\n\nPlease check the URL and try again.\n\nType 'help' for assistance.`
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

// Metadata fetching function using Microlink API
async function fetchUrlMetadata(url: string) {
  try {
    const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const { data } = await response.json()

    return {
      title: data.title || 'Unknown',
      description: data.description,
      image: data.image?.url,
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
  // Social Media Platforms
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('reddit.com')) return 'reddit'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('pinterest.com')) return 'pinterest'
  
  // Content Platforms
  if (url.includes('medium.com')) return 'medium'
  if (url.includes('substack.com')) return 'substack'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  if (url.includes('dev.to')) return 'dev.to'
  if (url.includes('news.ycombinator.com') || url.includes('hackernews.com')) return 'hacker-news'
  
  // Tech Platforms
  if (url.includes('github.com')) return 'github'
  if (url.includes('stackoverflow.com') || url.includes('stackexchange.com')) return 'stack-overflow'
  if (url.includes('producthunt.com')) return 'product-hunt'
  if (url.includes('dribbble.com')) return 'dribbble'
  if (url.includes('behance.net')) return 'behance'
  
  // News Platforms
  if (url.includes('nytimes.com') || url.includes('nytimes.com')) return 'nytimes'
  if (url.includes('wsj.com') || url.includes('wallstreetjournal.com')) return 'wsj'
  if (url.includes('theverge.com')) return 'the-verge'
  if (url.includes('techcrunch.com')) return 'techcrunch'
  if (url.includes('cnn.com')) return 'cnn'
  if (url.includes('bbc.com') || url.includes('bbc.co.uk')) return 'bbc'
  if (url.includes('reuters.com')) return 'reuters'
  if (url.includes('bloomberg.com')) return 'bloomberg'
  if (url.includes('forbes.com')) return 'forbes'
  if (url.includes('wired.com')) return 'wired'
  if (url.includes('arstechnica.com')) return 'ars-technica'
  if (url.includes('engadget.com')) return 'engadget'
  if (url.includes('mashable.com')) return 'mashable'
  if (url.includes('venturebeat.com')) return 'venturebeat'
  if (url.includes('theguardian.com')) return 'the-guardian'
  if (url.includes('washingtonpost.com')) return 'washington-post'
  if (url.includes('latimes.com')) return 'la-times'
  if (url.includes('usatoday.com')) return 'usa-today'
  if (url.includes('npr.org')) return 'npr'
  if (url.includes('abcnews.go.com')) return 'abc-news'
  if (url.includes('cbsnews.com')) return 'cbs-news'
  if (url.includes('nbcnews.com')) return 'nbc-news'
  if (url.includes('foxnews.com')) return 'fox-news'
  if (url.includes('msnbc.com')) return 'msnbc'
  if (url.includes('politico.com')) return 'politico'
  if (url.includes('axios.com')) return 'axios'
  if (url.includes('thehill.com')) return 'the-hill'
  if (url.includes('rollcall.com')) return 'roll-call'
  
  // Productivity & Note-taking Tools
  if (url.includes('notion.so')) return 'notion'
  if (url.includes('roamresearch.com')) return 'roam'
  if (url.includes('obsidian.md')) return 'obsidian'
  if (url.includes('docs.google.com')) return 'google-docs'
  if (url.includes('sheets.google.com')) return 'google-sheets'
  if (url.includes('slides.google.com')) return 'google-slides'
  if (url.includes('drive.google.com')) return 'google-drive'
  if (url.includes('loom.com')) return 'loom'
  
  // Learning Platforms
  if (url.includes('coursera.org')) return 'coursera'
  if (url.includes('udemy.com')) return 'udemy'
  if (url.includes('edx.org')) return 'edx'
  if (url.includes('khanacademy.org')) return 'khan-academy'
  if (url.includes('skillshare.com')) return 'skillshare'
  if (url.includes('pluralsight.com')) return 'pluralsight'
  if (url.includes('udacity.com')) return 'udacity'
  if (url.includes('freecodecamp.org')) return 'freecodecamp'
  if (url.includes('theodinproject.com')) return 'the-odin-project'
  
  // Shopping Platforms
  if (url.includes('amazon.com') || url.includes('amazon.co.uk') || url.includes('amazon.ca') || url.includes('amazon.de') || url.includes('amazon.fr') || url.includes('amazon.it') || url.includes('amazon.es') || url.includes('amazon.com.au') || url.includes('amazon.co.jp')) return 'amazon'
  if (url.includes('etsy.com')) return 'etsy'
  if (url.includes('ebay.com')) return 'ebay'
  if (url.includes('shopify.com')) return 'shopify'
  
  // Reading & Bookmarking
  if (url.includes('getpocket.com') || url.includes('pocket.co')) return 'pocket'
  if (url.includes('instapaper.com')) return 'instapaper'
  if (url.includes('raindrop.io')) return 'raindrop'
  if (url.includes('pinboard.in')) return 'pinboard'
  if (url.includes('diigo.com')) return 'diigo'
  
  // Video Platforms
  if (url.includes('netflix.com')) return 'netflix'
  if (url.includes('hulu.com')) return 'hulu'
  if (url.includes('disneyplus.com')) return 'disney-plus'
  if (url.includes('hbomax.com')) return 'hbo-max'
  if (url.includes('primevideo.com')) return 'amazon-prime-video'
  if (url.includes('peacocktv.com')) return 'peacock'
  if (url.includes('paramountplus.com')) return 'paramount-plus'
  if (url.includes('appletv.com')) return 'apple-tv'
  
  // Music Platforms
  if (url.includes('spotify.com')) return 'spotify'
  if (url.includes('apple.com/music') || url.includes('music.apple.com')) return 'apple-music'
  if (url.includes('youtube.com/music')) return 'youtube-music'
  if (url.includes('tidal.com')) return 'tidal'
  if (url.includes('soundcloud.com')) return 'soundcloud'
  if (url.includes('bandcamp.com')) return 'bandcamp'
  if (url.includes('pandora.com')) return 'pandora'
  if (url.includes('deezer.com')) return 'deezer'
  
  // Podcast Platforms
  if (url.includes('podcasts.apple.com')) return 'apple-podcasts'
  if (url.includes('open.spotify.com/show')) return 'spotify-podcasts'
  if (url.includes('podcast.google.com')) return 'google-podcasts'
  if (url.includes('anchor.fm')) return 'anchor'
  if (url.includes('overcast.fm')) return 'overcast'
  if (url.includes('castbox.fm')) return 'castbox'
  if (url.includes('pocketcasts.com')) return 'pocket-casts'
  
  // Gaming Platforms
  if (url.includes('steam.com') || url.includes('steampowered.com')) return 'steam'
  if (url.includes('epicgames.com')) return 'epic-games'
  if (url.includes('gog.com')) return 'gog'
  if (url.includes('itch.io')) return 'itch'
  if (url.includes('twitch.tv')) return 'twitch'
  if (url.includes('discord.com') || url.includes('discord.gg')) return 'discord'
  if (url.includes('reddit.com/r/gaming')) return 'reddit-gaming'
  
  // Development & Design
  if (url.includes('figma.com')) return 'figma'
  if (url.includes('sketch.com')) return 'sketch'
  if (url.includes('invisionapp.com')) return 'invision'
  if (url.includes('framer.com')) return 'framer'
  if (url.includes('webflow.com')) return 'webflow'
  if (url.includes('squarespace.com')) return 'squarespace'
  if (url.includes('wix.com')) return 'wix'
  if (url.includes('wordpress.com')) return 'wordpress'
  if (url.includes('shopify.com')) return 'shopify'
  if (url.includes('stripe.com')) return 'stripe'
  if (url.includes('paypal.com')) return 'paypal'
  if (url.includes('mailchimp.com')) return 'mailchimp'
  if (url.includes('sendgrid.com')) return 'sendgrid'
  if (url.includes('twilio.com')) return 'twilio'
  if (url.includes('aws.amazon.com')) return 'aws'
  if (url.includes('cloud.google.com')) return 'google-cloud'
  if (url.includes('azure.microsoft.com')) return 'azure'
  if (url.includes('heroku.com')) return 'heroku'
  if (url.includes('vercel.com')) return 'vercel'
  if (url.includes('netlify.com')) return 'netlify'
  if (url.includes('digitalocean.com')) return 'digitalocean'
  if (url.includes('linode.com')) return 'linode'
  if (url.includes('vultr.com')) return 'vultr'
  
  return 'web'
}

function generateTags(title: string, description?: string, platform?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase()
  const tags: string[] = []
  
  const keywords = [
    // Technology & Programming
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural networks',
    'react', 'javascript', 'typescript', 'python', 'node', 'vue', 'angular', 'svelte',
    'startup', 'business', 'entrepreneur', 'funding', 'venture capital', 'investor',
    'design', 'ux', 'ui', 'product', 'user experience', 'user interface', 'wireframe',
    'programming', 'coding', 'development', 'software', 'web development', 'mobile development',
    'technology', 'tech', 'innovation', 'future', 'digital transformation',
    'social media', 'marketing', 'growth', 'strategy', 'content marketing', 'seo',
    
    // Business & Finance
    'finance', 'investment', 'stock market', 'cryptocurrency', 'blockchain', 'bitcoin',
    'economy', 'economics', 'market analysis', 'trading', 'portfolio',
    'leadership', 'management', 'strategy', 'operations', 'productivity',
    
    // Education & Learning
    'education', 'learning', 'course', 'tutorial', 'workshop', 'training',
    'academic', 'research', 'study', 'knowledge', 'skills', 'certification',
    
    // Creative & Design
    'art', 'design', 'creative', 'illustration', 'graphic design', 'branding',
    'photography', 'video', 'animation', '3d', 'visual effects', 'motion graphics',
    
    // News & Media
    'news', 'politics', 'current events', 'breaking news', 'analysis', 'opinion',
    'journalism', 'media', 'press', 'reporting', 'investigation',
    
    // Entertainment
    'entertainment', 'movies', 'tv shows', 'music', 'gaming', 'streaming',
    'podcast', 'comedy', 'drama', 'action', 'documentary', 'reality tv',
    
    // Lifestyle & Health
    'health', 'fitness', 'wellness', 'nutrition', 'mental health', 'lifestyle',
    'travel', 'food', 'cooking', 'recipes', 'restaurants', 'culture',
    
    // Science & Research
    'science', 'research', 'study', 'experiment', 'discovery', 'innovation',
    'medicine', 'healthcare', 'biology', 'chemistry', 'physics', 'mathematics',
    
    // Environment & Sustainability
    'environment', 'climate change', 'sustainability', 'green', 'renewable energy',
    'conservation', 'ecology', 'carbon footprint', 'recycling',
    
    // Social Issues
    'social justice', 'equality', 'diversity', 'inclusion', 'human rights',
    'activism', 'protest', 'movement', 'change', 'advocacy'
  ]
  
  keywords.forEach(keyword => {
    if (text.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword)
    }
  })
  
  // Platform-specific tags
  if (platform === 'twitter') tags.push('social media', 'twitter', 'microblogging')
  if (platform === 'linkedin') tags.push('professional', 'networking', 'business')
  if (platform === 'reddit') tags.push('community', 'discussion', 'forum')
  if (platform === 'tiktok') tags.push('video', 'social media', 'short-form')
  if (platform === 'instagram') tags.push('social media', 'visual', 'photos')
  if (platform === 'pinterest') tags.push('social media', 'inspiration', 'visual')
  if (platform === 'medium') tags.push('blogging', 'writing', 'content')
  if (platform === 'substack') tags.push('newsletter', 'writing', 'subscription')
  if (platform === 'youtube') tags.push('video', 'content', 'streaming')
  if (platform === 'vimeo') tags.push('video', 'creative', 'artistic')
  if (platform === 'dev.to') tags.push('programming', 'development', 'tech')
  if (platform === 'hacker-news') tags.push('tech news', 'programming', 'startup')
  if (platform === 'github') tags.push('programming', 'open source', 'code')
  if (platform === 'stack-overflow') tags.push('programming', 'qa', 'development')
  if (platform === 'product-hunt') tags.push('startup', 'product', 'launch')
  if (platform === 'dribbble') tags.push('design', 'inspiration', 'creative')
  if (platform === 'behance') tags.push('design', 'portfolio', 'creative')
  if (platform === 'notion') tags.push('productivity', 'notes', 'organization')
  if (platform === 'roam') tags.push('productivity', 'notes', 'knowledge management')
  if (platform === 'obsidian') tags.push('productivity', 'notes', 'markdown')
  if (platform === 'google-docs') tags.push('productivity', 'documentation', 'collaboration')
  if (platform === 'google-sheets') tags.push('productivity', 'spreadsheets', 'data')
  if (platform === 'loom') tags.push('video', 'screencast', 'communication')
  if (platform === 'coursera') tags.push('education', 'online learning', 'courses')
  if (platform === 'udemy') tags.push('education', 'online learning', 'courses')
  if (platform === 'amazon') tags.push('shopping', 'e-commerce', 'retail')
  if (platform === 'etsy') tags.push('shopping', 'handmade', 'artisan')
  if (platform === 'pocket') tags.push('reading', 'bookmarking', 'save for later')
  if (platform === 'instapaper') tags.push('reading', 'bookmarking', 'save for later')
  
  // News platform tags
  if (platform === 'nytimes' || platform === 'wsj' || platform === 'the-verge' || 
      platform === 'techcrunch' || platform === 'cnn' || platform === 'bbc' || 
      platform === 'reuters' || platform === 'bloomberg' || platform === 'forbes' || 
      platform === 'wired' || platform === 'ars-technica' || platform === 'engadget' || 
      platform === 'mashable' || platform === 'venturebeat' || platform === 'the-guardian' || 
      platform === 'washington-post' || platform === 'la-times' || platform === 'usa-today' || 
      platform === 'npr' || platform === 'abc-news' || platform === 'cbs-news' || 
      platform === 'nbc-news' || platform === 'fox-news' || platform === 'msnbc' || 
      platform === 'politico' || platform === 'axios' || platform === 'the-hill' || 
      platform === 'roll-call') {
    tags.push('news', 'current events', 'journalism')
  }
  
  // Video platform tags
  if (platform === 'netflix' || platform === 'hulu' || platform === 'disney-plus' || 
      platform === 'hbo-max' || platform === 'amazon-prime-video' || platform === 'peacock' || 
      platform === 'paramount-plus' || platform === 'apple-tv') {
    tags.push('streaming', 'entertainment', 'video')
  }
  
  // Music platform tags
  if (platform === 'spotify' || platform === 'apple-music' || platform === 'youtube-music' || 
      platform === 'tidal' || platform === 'soundcloud' || platform === 'bandcamp' || 
      platform === 'pandora' || platform === 'deezer') {
    tags.push('music', 'audio', 'streaming')
  }
  
  // Gaming platform tags
  if (platform === 'steam' || platform === 'epic-games' || platform === 'gog' || 
      platform === 'itch' || platform === 'twitch' || platform === 'discord' || 
      platform === 'reddit-gaming') {
    tags.push('gaming', 'entertainment', 'esports')
  }
  
  // Development & design platform tags
  if (platform === 'figma' || platform === 'sketch' || platform === 'invision' || 
      platform === 'framer' || platform === 'webflow' || platform === 'squarespace' || 
      platform === 'wix' || platform === 'wordpress') {
    tags.push('design', 'web design', 'development')
  }
  
  return tags.slice(0, 8) // Increased limit to accommodate more relevant tags
} 