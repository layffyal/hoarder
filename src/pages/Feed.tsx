import { useState, useEffect } from 'react'
import { FeedBookmark } from '../lib/supabase'
import { FollowService } from '../lib/followService'
import BookmarkCard from '../components/BookmarkCard'
import { toast } from 'react-hot-toast'
import { Users, RefreshCw } from 'lucide-react'

export default function Feed() {
  const [bookmarks, setBookmarks] = useState<FeedBookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadFeed = async () => {
    try {
      setLoading(true)
      const feedBookmarks = await FollowService.getUserFeed()
      setBookmarks(feedBookmarks)
    } catch (error) {
      console.error('Error loading feed:', error)
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadFeed()
      toast.success('Feed refreshed')
    } catch (error) {
      console.error('Error refreshing feed:', error)
      toast.error('Failed to refresh feed')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFeed()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Shared Feed</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bookmarks from people you follow
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feed Content */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No bookmarks in your feed yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start following people to see their shared bookmarks here
          </p>
          <button
            onClick={() => window.location.href = '/discover'}
            className="btn btn-primary"
          >
            Discover People
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="relative">
              {/* Author info overlay */}
              <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {bookmark.author_display_name || bookmark.author_username || 'Unknown'}
              </div>
              <BookmarkCard 
                bookmark={bookmark} 
                onUpdate={loadFeed}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 