import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Bookmark } from '../lib/supabase'
import { Search, Grid, List, Plus, Database } from 'lucide-react'
import toast from 'react-hot-toast'
import BookmarkCard from '../components/BookmarkCard'
import AddBookmarkModal from '../components/AddBookmarkModal'
import QuickAddBookmark from '../components/QuickAddBookmark'
import { seedDatabase } from '../lib/seed'

function Home() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [seeding, setSeeding] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchBookmarks = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      // Ensure all bookmarks have the is_public field (for backward compatibility)
      const bookmarksWithDefaults = (data || []).map((bookmark: any) => ({
        ...bookmark,
        is_public: bookmark.is_public ?? true
      }))
      
      setBookmarks(bookmarksWithDefaults)
    } catch (error) {
      toast.error('Failed to load bookmarks')
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedData = async () => {
    if (!user) return
    
    setSeeding(true)
    try {
      await seedDatabase(user.id)
      toast.success('Sample data added!')
      fetchBookmarks()
    } catch (error) {
      toast.error('Failed to add sample data')
      console.error('Error seeding data:', error)
    } finally {
      setSeeding(false)
    }
  }

  const handleBookmarkAdded = () => {
    fetchBookmarks()
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesPlatform = selectedPlatform === 'all' || bookmark.platform === selectedPlatform
    
    return matchesSearch && matchesPlatform
  })

  const platforms = [
    { id: 'all', name: 'All Platforms', count: bookmarks.length },
    { id: 'youtube', name: 'YouTube', count: bookmarks.filter(b => b.platform === 'youtube').length },
    { id: 'vimeo', name: 'Vimeo', count: bookmarks.filter(b => b.platform === 'vimeo').length },
    { id: 'twitter', name: 'Twitter', count: bookmarks.filter(b => b.platform === 'twitter').length },
    { id: 'linkedin', name: 'LinkedIn', count: bookmarks.filter(b => b.platform === 'linkedin').length },
    { id: 'reddit', name: 'Reddit', count: bookmarks.filter(b => b.platform === 'reddit').length },
    { id: 'tiktok', name: 'TikTok', count: bookmarks.filter(b => b.platform === 'tiktok').length },
    { id: 'github', name: 'GitHub', count: bookmarks.filter(b => b.platform === 'github').length },
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Your Bookmarks</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage and discover your saved content</p>
        </div>
        <div className="flex items-center gap-2">
          {bookmarks.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="btn btn-secondary flex items-center text-sm"
            >
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{seeding ? 'Adding...' : 'Add Sample Data'}</span>
              <span className="sm:hidden">{seeding ? 'Adding...' : 'Sample'}</span>
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Bookmark</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bookmark */}
      <QuickAddBookmark onBookmarkAdded={handleBookmarkAdded} />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg ${
                viewMode === 'grid' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg ${
                viewMode === 'list' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Filters */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              selectedPlatform === platform.id
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <span className="hidden sm:inline">{platform.name} ({platform.count})</span>
            <span className="sm:hidden">{platform.name}</span>
          </button>
        ))}
      </div>

      {/* Bookmarks Grid/List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || selectedPlatform !== 'all' ? 'No bookmarks found' : 'No bookmarks yet'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {searchQuery || selectedPlatform !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start saving your favorite content from around the web'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}>
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} onUpdate={fetchBookmarks} />
          ))}
        </div>
      )}

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookmarkAdded={handleBookmarkAdded}
      />
    </div>
  )
}

export default Home 