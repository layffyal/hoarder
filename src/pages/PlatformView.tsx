import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Bookmark } from '../lib/supabase'
import { Globe, Search, Twitter, Linkedin, MessageSquare, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import BookmarkCard from '../components/BookmarkCard'

function PlatformView() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      toast.error('Failed to load bookmarks')
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />
      case 'reddit':
        return <MessageSquare className="h-4 w-4" />
      case 'tiktok':
        return <Video className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesPlatform = selectedPlatform === 'all' || bookmark.platform === selectedPlatform
    const matchesSearch = !searchQuery || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesPlatform && matchesSearch
  })

  const platforms = [
    { id: 'all', name: 'All Platforms', count: bookmarks.length },
    { id: 'twitter', name: 'Twitter', count: bookmarks.filter(b => b.platform === 'twitter').length },
    { id: 'linkedin', name: 'LinkedIn', count: bookmarks.filter(b => b.platform === 'linkedin').length },
    { id: 'reddit', name: 'Reddit', count: bookmarks.filter(b => b.platform === 'reddit').length },
    { id: 'tiktok', name: 'TikTok', count: bookmarks.filter(b => b.platform === 'tiktok').length },
    { id: 'web', name: 'Web', count: bookmarks.filter(b => b.platform === 'web').length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platforms</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse your bookmarks by source platform</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search within platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPlatform === platform.id
                ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getPlatformIcon(platform.id)}</span>
              <div className="text-left">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{platform.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{platform.count} bookmarks</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Results */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
            <Globe className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || selectedPlatform !== 'all' ? 'No bookmarks found' : 'No bookmarks yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || selectedPlatform !== 'all' 
              ? 'Try adjusting your search or selecting a different platform'
              : 'Start saving bookmarks to see them organized by platform'
            }
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {selectedPlatform === 'all' ? 'All Platforms' : `${platforms.find(p => p.id === selectedPlatform)?.name} Bookmarks`}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} onUpdate={fetchBookmarks} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlatformView 