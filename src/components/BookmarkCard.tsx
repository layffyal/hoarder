import { useState } from 'react'
import { Bookmark } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { 
  ExternalLink, 
  Trash2, 
  Calendar, 
  Tag
} from 'lucide-react'

interface BookmarkCardProps {
  bookmark: Bookmark
  onUpdate: () => void
}

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  youtube: 'https://via.placeholder.com/400x225/FF0000/FFFFFF?text=YouTube',
  vimeo: 'https://via.placeholder.com/400x225/1AB7EA/FFFFFF?text=Vimeo',
  twitter: 'https://via.placeholder.com/400x225/1DA1F2/FFFFFF?text=Twitter',
  linkedin: 'https://via.placeholder.com/400x225/0077B5/FFFFFF?text=LinkedIn',
  reddit: 'https://via.placeholder.com/400x225/FF4500/FFFFFF?text=Reddit',
  tiktok: 'https://via.placeholder.com/400x225/000000/FFFFFF?text=TikTok',
  github: 'https://via.placeholder.com/400x225/181717/FFFFFF?text=GitHub',
  web: 'https://via.placeholder.com/400x225/6B7280/FFFFFF?text=Web'
}

function BookmarkCard({ bookmark, onUpdate }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '📺'
      case 'vimeo':
        return '🎬'
      case 'twitter':
        return '🐦'
      case 'linkedin':
        return '💼'
      case 'reddit':
        return '🤖'
      case 'tiktok':
        return '🎵'
      case 'github':
        return '📦'
      default:
        return '🌐'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      case 'vimeo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
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

  const imageToShow = bookmark.image_url || PLATFORM_PLACEHOLDERS[bookmark.platform] || PLATFORM_PLACEHOLDERS['web'];

  return (
    <div className="card hover:shadow-md transition-all duration-300 cursor-pointer" onClick={handleOpenLink}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getPlatformIcon(bookmark.platform)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(bookmark.platform)}`}>
            <span className="hidden sm:inline">{bookmark.platform}</span>
            <span className="sm:hidden">{bookmark.platform.slice(0, 3)}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenLink()
            }}
            className="p-2 sm:p-1 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
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
            className="p-2 sm:p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 dark:text-gray-500 dark:hover:text-red-400"
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
          className="w-full h-24 sm:h-32 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = PLATFORM_PLACEHOLDERS['web'];
          }}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-sm sm:text-base">
          {bookmark.title}
        </h3>
        
        {bookmark.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
              >
                <Tag className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{tag}</span>
                <span className="sm:hidden">{tag.slice(0, 8)}</span>
              </span>
            ))}
            {bookmark.tags.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{bookmark.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">{formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}</span>
            <span className="sm:hidden">{formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true }).replace(' ago', '')}</span>
          </div>
          <div className="flex items-center">
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookmarkCard 