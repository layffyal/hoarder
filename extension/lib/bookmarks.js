import { supabase } from './supabase.js'

// Function to determine platform from URL (same as main app)
function detectPlatform(url) {
  const urlLower = url.toLowerCase()
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter'
  } else if (urlLower.includes('linkedin.com')) {
    return 'linkedin'
  } else if (urlLower.includes('reddit.com')) {
    return 'reddit'
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok'
  } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube'
  }
  return 'web'
}

// Extract basic metadata from URL (same as main app)
function extractBasicMetadata(url) {
  try {
    const urlObj = new URL(url)
    const platform = detectPlatform(url)
    
    // Extract title from URL path
    let title = ''
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    if (platform === 'twitter') {
      // For Twitter/X, create a more descriptive title
      if (pathParts.length >= 2) {
        const username = pathParts[0]
        title = `Tweet by @${username}`
      } else {
        title = 'Twitter Post'
      }
    } else if (platform === 'linkedin') {
      title = 'LinkedIn Post'
    } else if (platform === 'reddit') {
      // For Reddit, try to get the post title
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
      // For web URLs, try to get a meaningful title from the path
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        title = decodeURIComponent(lastPart).replace(/[-_]/g, ' ')
        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1)
      } else {
        title = urlObj.hostname.replace('www.', '')
      }
    }

    return {
      title,
      platform
    }
  } catch (error) {
    console.error('Error extracting basic metadata:', error)
    return {
      title: 'Unknown',
      platform: 'web'
    }
  }
}

// Special handling for Twitter/X URLs (same as main app)
function handleTwitterUrl(url, basicMetadata) {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    let title = basicMetadata.title || 'Twitter Post'
    let description = undefined
    
    // Try to extract username and create a better title
    if (pathParts.length >= 2) {
      const username = pathParts[0]
      title = `Tweet by @${username}`
      
      // Try to extract tweet ID for potential future API integration
      const tweetId = pathParts[2]
      if (tweetId) {
        description = `Twitter post ID: ${tweetId}`
      }
    }
    
    return {
      title,
      description,
      platform: 'twitter'
    }
  } catch (error) {
    console.error('Error handling Twitter URL:', error)
    return {
      title: basicMetadata.title || 'Twitter Post',
      platform: 'twitter'
    }
  }
}

// Fetch full metadata from URL using Microlink API (same as main app)
async function fetchUrlMetadata(url) {
  const basicMetadata = extractBasicMetadata(url)
  const platform = basicMetadata.platform || 'web'

  // Special handling for Twitter/X
  if (platform === 'twitter') {
    return handleTwitterUrl(url, basicMetadata)
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

// Function to save a bookmark
export async function saveBookmark(bookmarkData) {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{
        url: bookmarkData.url,
        title: bookmarkData.title,
        description: bookmarkData.description,
        image_url: bookmarkData.imageUrl,
        platform: bookmarkData.platform,
        tags: bookmarkData.tags,
        source: 'extension',
        user_id: bookmarkData.userId
      }])
      .select()

    if (error) {
      console.error('Error saving bookmark:', error)
      throw error
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Failed to save bookmark:', error)
    throw error
  }
}

// Function to get current page metadata with fallback
export async function getCurrentPageMetadata() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        const tab = tabs[0]
        
        try {
          // First try to get metadata from content script
          chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_METADATA' }, async (response) => {
            if (chrome.runtime.lastError) {
              // Fallback: use Microlink API to fetch metadata
              console.log('Content script not available, using Microlink API')
              try {
                const metadata = await fetchUrlMetadata(tab.url)
                resolve({
                  title: metadata.title,
                  url: tab.url,
                  description: metadata.description || '',
                  imageUrl: metadata.image || '',
                  platform: metadata.platform
                })
              } catch (error) {
                console.error('Microlink API failed, using basic metadata:', error)
                // Final fallback: basic metadata from tab
                const basicMetadata = extractBasicMetadata(tab.url)
                resolve({
                  title: tab.title || basicMetadata.title || 'Unknown',
                  url: tab.url,
                  description: '',
                  imageUrl: '',
                  platform: basicMetadata.platform
                })
              }
            } else if (response && response.metadata) {
              // Use content script metadata but enhance with Microlink if needed
              const contentMetadata = response.metadata
              if (!contentMetadata.description || !contentMetadata.imageUrl) {
                try {
                  const microlinkMetadata = await fetchUrlMetadata(tab.url)
                  resolve({
                    title: contentMetadata.title || microlinkMetadata.title || 'Unknown',
                    url: contentMetadata.url,
                    description: contentMetadata.description || microlinkMetadata.description || '',
                    imageUrl: contentMetadata.imageUrl || microlinkMetadata.image || '',
                    platform: contentMetadata.platform || microlinkMetadata.platform
                  })
                } catch (error) {
                  // Use content script metadata as fallback
                  resolve({
                    title: contentMetadata.title || 'Unknown',
                    url: contentMetadata.url,
                    description: contentMetadata.description || '',
                    imageUrl: contentMetadata.imageUrl || '',
                    platform: contentMetadata.platform || detectPlatform(contentMetadata.url)
                  })
                }
              } else {
                resolve({
                  title: contentMetadata.title || 'Unknown',
                  url: contentMetadata.url,
                  description: contentMetadata.description || '',
                  imageUrl: contentMetadata.imageUrl || '',
                  platform: contentMetadata.platform || detectPlatform(contentMetadata.url)
                })
              }
            } else {
              reject(new Error('Failed to get page metadata'))
            }
          })
        } catch (error) {
          reject(error)
        }
      } else {
        reject(new Error('No active tab found'))
      }
    })
  })
}

// Main function to save current page as bookmark
export async function saveCurrentPage(userId) {
  try {
    // Get current page metadata
    const metadata = await getCurrentPageMetadata()
    
    // Generate tags
    const tags = generateTags(metadata.title, metadata.description, metadata.platform)
    
    // Save bookmark
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