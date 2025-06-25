import { useState, useEffect } from 'react'
import { Bookmark } from '../lib/supabase'
import { ExternalLink, Play, Image as ImageIcon, Link } from 'lucide-react'
import { fetchOEmbedData } from '../lib/oembed'

interface EmbeddedContentViewerProps {
  bookmark: Bookmark
  isFullscreen?: boolean
}

export default function EmbeddedContentViewer({ bookmark, isFullscreen = false }: EmbeddedContentViewerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOEmbedData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        await fetchOEmbedData(bookmark.url, bookmark.title, bookmark.description)
      } catch (err) {
        console.warn('oEmbed fetch failed:', err)
        setError('Could not load embedded preview')
      } finally {
        setLoading(false)
      }
    }

    loadOEmbedData()
  }, [bookmark.url, bookmark.title, bookmark.description])

  const getEmbeddedContent = () => {
    const url = bookmark.url.toLowerCase()
    
    // YouTube - Direct embed
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      
      if (videoId) {
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={bookmark.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }
    }

    // Vimeo - Direct embed
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      if (videoId) {
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?h=auto&title=0&byline=0&portrait=0`}
              title={bookmark.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }
    }

    // GitHub - Enhanced preview
    if (url.includes('github.com/')) {
      return (
        <div className="platform-preview">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">GitHub Repository</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Code and project files</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{bookmark.title}</h4>
              {bookmark.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{bookmark.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>🔗 Repository</span>
                <span>📁 Files</span>
                <span>⭐ Stars</span>
              </div>
            </div>
            
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      )
    }

    // Twitter/X - Enhanced preview
    if (url.includes('twitter.com/') || url.includes('x.com/')) {
      return (
        <div className="platform-preview">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🐦</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Twitter Post</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Social media content</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">User</span>
                  <span className="text-gray-500 dark:text-gray-400">@username</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 mb-3">
                  {bookmark.description || "This is a preview of the Twitter post content..."}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>💬 Reply</span>
                  <span>🔄 Retweet</span>
                  <span>❤️ Like</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Twitter</span>
            </a>
          </div>
        </div>
      )
    }

    // LinkedIn - Enhanced preview
    if (url.includes('linkedin.com/')) {
      return (
        <div className="platform-preview">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💼</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">LinkedIn Post</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Professional content</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Professional</span>
                  <span className="text-gray-500 dark:text-gray-400">• 1st</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 mb-3">
                  {bookmark.description || "This is a preview of the LinkedIn post content..."}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔄 Repost</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on LinkedIn</span>
            </a>
          </div>
        </div>
      )
    }

    // Reddit - Enhanced preview
    if (url.includes('reddit.com/')) {
      return (
        <div className="platform-preview">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reddit Post</h3>
              <p className="text-sm text-gray-600">Community discussion</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">r/subreddit</span>
                  <span className="text-gray-500">• Posted by u/user</span>
                </div>
                <p className="text-gray-900 mb-3">
                  {bookmark.description || "This is a preview of the Reddit post content..."}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>⬆️ Upvote</span>
                  <span>💬 Comment</span>
                  <span>🔄 Share</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Reddit</span>
            </a>
          </div>
        </div>
      )
    }

    // TikTok - Enhanced preview
    if (url.includes('tiktok.com/')) {
      return (
        <div className="platform-preview">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">��</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">TikTok Video</h3>
              <p className="text-sm text-gray-600">Short-form video</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="aspect-[9/16] bg-gray-200 rounded-lg flex items-center justify-center mb-3">
              <div className="text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Video Preview</p>
              </div>
            </div>
            <p className="text-gray-900 mb-3">
              {bookmark.description || "This is a preview of the TikTok video..."}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>❤️ Like</span>
              <span>💬 Comment</span>
              <span>🔄 Share</span>
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on TikTok</span>
            </a>
          </div>
        </div>
      )
    }

    // Default web content - Enhanced preview
    return (
      <div className="platform-preview">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🌐</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Web Content</h3>
            <p className="text-sm text-gray-600">Web page and articles</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{bookmark.title}</h4>
              {bookmark.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{bookmark.description}</p>
              )}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Link className="h-3 w-3" />
                <span>{new URL(bookmark.url).hostname}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Original</span>
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mt-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Original</span>
        </a>
      </div>
    )
  }

  return (
    <div className={`${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
      {getEmbeddedContent()}
    </div>
  )
} 