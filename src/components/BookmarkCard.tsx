import { useState } from 'react'
import { Bookmark, supabase } from '../lib/supabase'
import { ExternalLink, Trash2, Tag, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface BookmarkCardProps {
  bookmark: Bookmark
  onUpdate: () => void
}

function BookmarkCard({ bookmark, onUpdate }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

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
        return 'bg-blue-100 text-blue-800'
      case 'linkedin':
        return 'bg-blue-100 text-blue-800'
      case 'reddit':
        return 'bg-orange-100 text-orange-800'
      case 'tiktok':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="card hover:shadow-md transition-shadow">
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
            onClick={handleOpenLink}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete bookmark"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      {bookmark.image_url && (
        <div className="mb-3">
          <img
            src={bookmark.image_url}
            alt={bookmark.title}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">
          {bookmark.title}
        </h3>
        
        {bookmark.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{bookmark.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}

export default BookmarkCard 