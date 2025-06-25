// oEmbed utility functions for fetching embedded content metadata
// Note: In production, this would need to be handled server-side due to CORS restrictions

export interface OEmbedData {
  title?: string
  description?: string
  thumbnail_url?: string
  html?: string
  provider_name?: string
  type?: string
  author_name?: string
  author_url?: string
  width?: number
  height?: number
}

export const getOEmbedUrl = (url: string): string | null => {
  const urlLower = url.toLowerCase()
  
  if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/')) {
    const videoId = urlLower.includes('youtu.be/') 
      ? urlLower.split('youtu.be/')[1]?.split('?')[0]
      : urlLower.split('v=')[1]?.split('&')[0]
    return videoId ? `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json` : null
  }
  
  if (urlLower.includes('vimeo.com/')) {
    const videoId = urlLower.split('vimeo.com/')[1]?.split('?')[0]
    return videoId ? `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}` : null
  }
  
  if (urlLower.includes('twitter.com/') || urlLower.includes('x.com/')) {
    return `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
  }
  
  if (urlLower.includes('instagram.com/')) {
    return `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`
  }
  
  return null
}

export const getFallbackOEmbedData = (url: string, title?: string, description?: string): OEmbedData => {
  const urlLower = url.toLowerCase()
  
  if (urlLower.includes('youtube.com/') || urlLower.includes('youtu.be/')) {
    return {
      title: title || 'YouTube Video',
      description: description || 'Video content from YouTube',
      provider_name: 'YouTube',
      type: 'video',
      thumbnail_url: '/placeholders/youtube.png'
    }
  }
  
  if (urlLower.includes('vimeo.com/')) {
    return {
      title: title || 'Vimeo Video',
      description: description || 'Video content from Vimeo',
      provider_name: 'Vimeo',
      type: 'video',
      thumbnail_url: '/placeholders/vimeo.png'
    }
  }
  
  if (urlLower.includes('twitter.com/') || urlLower.includes('x.com/')) {
    return {
      title: title || 'Twitter Post',
      description: description || 'Social media content from Twitter',
      provider_name: 'Twitter',
      type: 'rich',
      thumbnail_url: '/placeholders/twitter.png'
    }
  }
  
  if (urlLower.includes('linkedin.com/')) {
    return {
      title: title || 'LinkedIn Post',
      description: description || 'Professional content from LinkedIn',
      provider_name: 'LinkedIn',
      type: 'rich',
      thumbnail_url: '/placeholders/linkedin.png'
    }
  }
  
  if (urlLower.includes('reddit.com/')) {
    return {
      title: title || 'Reddit Post',
      description: description || 'Community discussion from Reddit',
      provider_name: 'Reddit',
      type: 'rich',
      thumbnail_url: '/placeholders/reddit.png'
    }
  }
  
  if (urlLower.includes('tiktok.com/')) {
    return {
      title: title || 'TikTok Video',
      description: description || 'Short-form video from TikTok',
      provider_name: 'TikTok',
      type: 'video',
      thumbnail_url: '/placeholders/tiktok.png'
    }
  }
  
  if (urlLower.includes('github.com/')) {
    return {
      title: title || 'GitHub Repository',
      description: description || 'Code repository from GitHub',
      provider_name: 'GitHub',
      type: 'rich',
      thumbnail_url: '/placeholders/github.png'
    }
  }
  
  // Default web content
  return {
    title: title || 'Web Content',
    description: description || 'Web page content',
    provider_name: 'Web',
    type: 'link',
    thumbnail_url: '/placeholders/web.png'
  }
}

export const fetchOEmbedData = async (url: string, title?: string, description?: string): Promise<OEmbedData> => {
  const oembedUrl = getOEmbedUrl(url)
  
  if (!oembedUrl) {
    return getFallbackOEmbedData(url, title, description)
  }
  
  try {
    // In production, this would be a server-side API call
    // For now, we'll use the fallback data
    console.log('Would fetch oEmbed data from:', oembedUrl)
    return getFallbackOEmbedData(url, title, description)
  } catch (error) {
    console.warn('Failed to fetch oEmbed data:', error)
    return getFallbackOEmbedData(url, title, description)
  }
} 