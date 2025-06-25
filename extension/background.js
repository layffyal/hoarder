// Background service worker for Hoarder extension

// Supabase configuration (inline to avoid module issues)
const SUPABASE_URL = 'https://ebsegrbkrmbundqhrvfc.supabase.co/'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic2VncmJrcm1idW5kcWhydmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjI5MjMsImV4cCI6MjA2NjMzODkyM30.K9FpAtr06HCdmVFHl-SOWho6Fgi77klCUjaWJmRHv6A'

// Create Supabase client for background script
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Simple Supabase client creation (without imports)
function createClient(url, key, options) {
  return {
    auth: {
      getSession: async () => {
        try {
          const response = await fetch(`${url}/auth/v1/user`, {
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${await getStoredToken()}`
            }
          })
          if (response.ok) {
            const user = await response.json()
            return { data: { session: { user } }, error: null }
          }
          return { data: { session: null }, error: null }
        } catch (error) {
          return { data: { session: null }, error }
        }
      }
    },
    from: (table) => ({
      insert: (data) => ({
        select: () => ({
          then: async (callback) => {
            try {
              const token = await getStoredToken()
              const response = await fetch(`${url}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                  'apikey': key,
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
              })
              const result = await response.json()
              callback({ data: result, error: response.ok ? null : result })
            } catch (error) {
              callback({ data: null, error })
            }
          }
        })
      })
    })
  }
}

// Get stored auth token
async function getStoredToken() {
  const result = await chrome.storage.local.get(['hoarder_auth_token'])
  return result.hoarder_auth_token
}

// Store auth token
async function storeToken(token) {
  await chrome.storage.local.set({ hoarder_auth_token: token })
}

// Detect platform from URL
function detectPlatform(url) {
  const urlLower = url.toLowerCase()
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter'
  if (urlLower.includes('linkedin.com')) return 'linkedin'
  if (urlLower.includes('reddit.com')) return 'reddit'
  if (urlLower.includes('tiktok.com')) return 'tiktok'
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube'
  return 'web'
}

// Extract basic metadata from URL
function extractBasicMetadata(url) {
  try {
    const urlObj = new URL(url)
    const platform = detectPlatform(url)
    
    let title = ''
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    if (platform === 'twitter') {
      if (pathParts.length >= 2) {
        const username = pathParts[0]
        title = `Tweet by @${username}`
      } else {
        title = 'Twitter Post'
      }
    } else if (platform === 'linkedin') {
      title = 'LinkedIn Post'
    } else if (platform === 'reddit') {
      if (pathParts.length >= 3) {
        title = decodeURIComponent(pathParts[2]).replace(/[-_]/g, ' ')
      } else {
        title = 'Reddit Post'
      }
    } else if (platform === 'tiktok') {
      title = 'TikTok Video'
    } else if (platform === 'youtube') {
      title = 'YouTube Video'
    } else {
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        title = decodeURIComponent(lastPart).replace(/[-_]/g, ' ')
        title = title.charAt(0).toUpperCase() + title.slice(1)
      } else {
        title = urlObj.hostname.replace('www.', '')
      }
    }

    return { title, platform }
  } catch (error) {
    return { title: 'Unknown', platform: 'web' }
  }
}

// Fetch full metadata from URL using Microlink API (same as main app)
async function fetchUrlMetadata(url) {
  const basicMetadata = extractBasicMetadata(url)
  const platform = basicMetadata.platform || 'web'

  // Special handling for Twitter/X
  if (platform === 'twitter') {
    return basicMetadata
  }

  try {
    const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const { data } = await response.json()
    return {
      title: data.title || basicMetadata.title || 'Unknown',
      description: data.description || undefined,
      image: data.image?.url || undefined,
      platform
    }
  } catch (error) {
    console.error('Error fetching metadata from Microlink:', error)
  }

  // Fallback to basic metadata
  return {
    title: basicMetadata.title || 'Unknown',
    platform
  }
}

// Generate AI tags based on title and description (same as main app)
function generateTags(title, description, platform) {
  const text = `${title} ${description || ''}`.toLowerCase()
  const tags = []
  
  // Common tech tags
  const techKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'react', 'javascript', 'typescript', 'python', 'node',
    'startup', 'business', 'entrepreneur', 'funding',
    'design', 'ux', 'ui', 'product', 'user experience',
    'programming', 'coding', 'development', 'software',
    'technology', 'tech', 'innovation', 'future',
    'social media', 'marketing', 'growth', 'strategy',
    'web3', 'blockchain', 'crypto', 'defi',
    'mobile', 'app', 'ios', 'android',
    'data', 'analytics', 'big data', 'database'
  ]
  
  techKeywords.forEach(keyword => {
    if (text.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword)
    }
  })
  
  // Add platform-specific tags
  if (platform === 'twitter' || text.includes('twitter') || text.includes('tweet')) {
    tags.push('social media', 'twitter')
  }
  if (platform === 'linkedin' || text.includes('linkedin')) {
    tags.push('professional', 'networking', 'business')
  }
  if (platform === 'reddit' || text.includes('reddit')) {
    tags.push('community', 'discussion', 'reddit')
  }
  if (platform === 'tiktok' || text.includes('tiktok')) {
    tags.push('video', 'social media', 'tiktok')
  }
  if (platform === 'youtube' || text.includes('youtube')) {
    tags.push('video', 'youtube', 'streaming')
  }
  
  // Add content type tags based on keywords
  if (text.includes('thread') || text.includes('threads')) tags.push('thread')
  if (text.includes('video') || text.includes('tutorial')) tags.push('video')
  if (text.includes('article') || text.includes('blog')) tags.push('article')
  if (text.includes('news') || text.includes('update')) tags.push('news')
  if (text.includes('tutorial') || text.includes('guide')) tags.push('tutorial')
  
  return tags.slice(0, 5) // Limit to 5 tags
}

// Save bookmark
async function saveBookmark(bookmarkData) {
  try {
    const { data, error } = await supabase.from('bookmarks').insert([{
      url: bookmarkData.url,
      title: bookmarkData.title,
      description: bookmarkData.description,
      image_url: bookmarkData.imageUrl,
      platform: bookmarkData.platform,
      tags: bookmarkData.tags,
      source: 'extension',
      user_id: bookmarkData.userId
    }]).select();
    if (error) throw error;
    return { success: true, data: data && data[0] };
  } catch (error) {
    console.error('Failed to save bookmark:', error);
    throw error;
  }
}

// Get current page metadata (with Microlink API)
async function getCurrentPageMetadata() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab) throw new Error('No active tab found')

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_METADATA' })
    if (response && response.metadata) {
      // Enhance with Microlink if needed
      if (!response.metadata.description || !response.metadata.imageUrl) {
        const microlinkMetadata = await fetchUrlMetadata(tab.url)
        return {
          title: response.metadata.title || microlinkMetadata.title || 'Unknown',
          url: response.metadata.url,
          description: response.metadata.description || microlinkMetadata.description || '',
          imageUrl: response.metadata.imageUrl || microlinkMetadata.image || '',
          platform: response.metadata.platform || microlinkMetadata.platform
        }
      } else {
        return {
          title: response.metadata.title || 'Unknown',
          url: response.metadata.url,
          description: response.metadata.description || '',
          imageUrl: response.metadata.imageUrl || '',
          platform: response.metadata.platform || detectPlatform(response.metadata.url)
        }
      }
    }
  } catch (error) {
    // Fallback to Microlink API
    try {
      const microlinkMetadata = await fetchUrlMetadata(tab.url)
      return {
        title: microlinkMetadata.title || tab.title || 'Unknown',
        url: tab.url,
        description: microlinkMetadata.description || '',
        imageUrl: microlinkMetadata.image || '',
        platform: microlinkMetadata.platform || detectPlatform(tab.url)
      }
    } catch (err) {
      // Final fallback
      const basicMetadata = extractBasicMetadata(tab.url)
      return {
        title: tab.title || basicMetadata.title || 'Unknown',
        url: tab.url,
        description: '',
        imageUrl: '',
        platform: basicMetadata.platform
      }
    }
  }
}

// Save current page as bookmark
async function saveCurrentPage(userId) {
  try {
    const metadata = await getCurrentPageMetadata()
    const tags = generateTags(metadata.title, metadata.description, metadata.platform)
    
    const result = await saveBookmark({
      ...metadata,
      tags,
      userId
    })
    
    return result
  } catch (error) {
    console.error('Error saving current page:', error)
    throw error
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Hoarder extension installed')
  }
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command)
  
  switch (command) {
    case 'save-bookmark':
      await handleSaveBookmark()
      break
    case 'open-popup':
      await handleOpenPopup()
      break
    default:
      console.log('Unknown command:', command)
  }
})

// Handle save bookmark from keyboard shortcut
async function handleSaveBookmark() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await showNotification('Please sign in to Hoarder first', 'Click the extension icon to sign in')
      // Open popup and show banner
      await chrome.action.openPopup()
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'SHOW_BANNER', message: 'Please sign in to Hoarder first', status: 'error' })
      }, 500)
      return
    }

    // Save the bookmark
    const result = await saveCurrentPage(session.user.id)
    if (result.success) {
      await showNotification('Bookmark saved!', 'Successfully saved to Hoarder')
      // Open popup and show banner
      await chrome.action.openPopup()
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'SHOW_BANNER', message: 'Bookmark saved!', status: 'success' })
      }, 500)
    } else {
      await showNotification('Failed to save bookmark', 'Please try again')
      await chrome.action.openPopup()
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'SHOW_BANNER', message: 'Failed to save bookmark', status: 'error' })
      }, 500)
    }
  } catch (error) {
    console.error('Error saving bookmark from shortcut:', error)
    await showNotification('Error saving bookmark', error.message)
    await chrome.action.openPopup()
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'SHOW_BANNER', message: 'Error saving bookmark', status: 'error' })
    }, 500)
  }
}

// Handle open popup from keyboard shortcut
async function handleOpenPopup() {
  try {
    // This will open the popup programmatically
    await chrome.action.openPopup()
  } catch (error) {
    console.error('Error opening popup:', error)
  }
}

// Show notification to user
async function showNotification(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message
    })
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_CURRENT_TAB':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] })
      })
      return true

    case 'SAVE_BOOKMARK':
      console.log('Save bookmark request:', request.data)
      sendResponse({ success: true })
      break

    case 'CHECK_AUTH':
      supabase.auth.getSession().then(({ data: { session } }) => {
        sendResponse({ authenticated: !!session, user: session?.user })
      })
      return true

    default:
      sendResponse({ error: 'Unknown message type' })
  }
}) 