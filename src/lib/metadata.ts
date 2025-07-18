interface Metadata {
  title: string
  description?: string
  image?: string
  platform: 'twitter' | 'linkedin' | 'reddit' | 'tiktok' | 'youtube' | 'web'
}

// Detect platform from URL
export const detectPlatform = (url: string): 'twitter' | 'linkedin' | 'reddit' | 'tiktok' | 'youtube' | 'web' => {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('reddit.com')) return 'reddit'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'web'
}

// Extract basic metadata from URL with better Twitter handling
export const extractBasicMetadata = (url: string): Partial<Metadata> => {
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

// Fetch full metadata from URL using Microlink API
export const fetchUrlMetadata = async (url: string): Promise<Metadata> => {
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

// Special handling for Twitter/X URLs
const handleTwitterUrl = (url: string, basicMetadata: Partial<Metadata>): Metadata => {
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

// Generate AI tags based on title and description with platform-specific logic
export const generateTags = (title: string, description?: string, platform?: string): string[] => {
  const text = `${title} ${description || ''}`.toLowerCase()
  const tags: string[] = []
  
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