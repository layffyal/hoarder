import { useState, useEffect } from 'react'
import { Bookmark, supabase } from '../lib/supabase'
import { ExternalLink, Trash2, Tag, Calendar, ChevronDown, ChevronUp, X, Maximize2, Minimize2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import EmbeddedContentViewer from './EmbeddedContentViewer'

interface BookmarkCardProps {
  bookmark: Bookmark
  onUpdate: () => void
}

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  twitter: '/placeholders/twitter.png',
  linkedin: '/placeholders/linkedin.png',
  medium: '/placeholders/medium.png',
  substack: '/placeholders/substack.png',
  reddit: '/placeholders/reddit.png',
  youtube: '/placeholders/youtube.png',
  tiktok: '/placeholders/tiktok.png',
  instagram: '/placeholders/instagram.png',
  vimeo: '/placeholders/vimeo.png',
  github: '/placeholders/github.png',
  stackoverflow: '/placeholders/stackoverflow.png',
  'dev.to': '/placeholders/devto.png',
  'hacker-news': '/placeholders/hackernews.png',
  nytimes: '/placeholders/nytimes.png',
  wsj: '/placeholders/wsj.png',
  'the-verge': '/placeholders/theverge.png',
  techcrunch: '/placeholders/techcrunch.png',
  pocket: '/placeholders/pocket.png',
  instapaper: '/placeholders/instapaper.png',
  notion: '/placeholders/notion.png',
  roam: '/placeholders/roam.png',
  obsidian: '/placeholders/obsidian.png',
  'google-docs': '/placeholders/googledocs.png',
  'google-sheets': '/placeholders/googlesheets.png',
  loom: '/placeholders/loom.png',
  coursera: '/placeholders/coursera.png',
  udemy: '/placeholders/udemy.png',
  'product-hunt': '/placeholders/producthunt.png',
  pinterest: '/placeholders/pinterest.png',
  dribbble: '/placeholders/dribbble.png',
  behance: '/placeholders/behance.png',
  amazon: '/placeholders/amazon.png',
  etsy: '/placeholders/etsy.png',
  web: '/placeholders/web.png',
};

function BookmarkCard({ bookmark, onUpdate }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle keyboard events for fullscreen mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when in fullscreen
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return '🐦'
      case 'linkedin':
        return '💼'
      case 'reddit':
        return '🤖'
      case 'tiktok':
        return '🎵'
      default:
        return '🌐'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      case 'linkedin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      case 'reddit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
      case 'tiktok':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id)

      if (error) throw error
      toast.success('Bookmark deleted')
      onUpdate()
    } catch (error) {
      toast.error('Failed to delete bookmark')
      console.error('Error deleting bookmark:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenLink = () => {
    window.open(bookmark.url, '_blank')
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (isFullscreen) {
      setIsFullscreen(false)
    }
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const imageToShow = bookmark.image_url || PLATFORM_PLACEHOLDERS[bookmark.platform] || PLATFORM_PLACEHOLDERS['web'];

  return (
    <>
      <div className={`card hover:shadow-md transition-all duration-300 cursor-pointer ${
        isExpanded ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
      }`} onClick={handleToggleExpand}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getPlatformIcon(bookmark.platform)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(bookmark.platform)}`}>
              {bookmark.platform}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFullscreen()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleOpenLink()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
              title="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 dark:text-gray-500 dark:hover:text-red-400"
              title="Delete bookmark"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="mb-3">
          <img
            src={imageToShow}
            alt={bookmark.title}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = PLATFORM_PLACEHOLDERS['web'];
            }}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {bookmark.title}
          </h3>
          
          {bookmark.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {bookmark.description}
            </p>
          )}

          {/* Tags */}
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{bookmark.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
            </div>
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`mt-4 bookmark-expanded ${
          isFullscreen ? 'fullscreen-overlay' : ''
        }`}>
          {isFullscreen && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{bookmark.title}</h2>
              <button
                onClick={handleToggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
          
          <div className="embedded-content">
            <EmbeddedContentViewer bookmark={bookmark} isFullscreen={isFullscreen} />
          </div>
          
          {!isFullscreen && (
            <div className="mt-3 text-center">
              <button
                onClick={handleToggleExpand}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-300"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default BookmarkCard 