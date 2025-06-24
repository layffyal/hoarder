import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Bookmark } from '../lib/supabase'
import { Tag, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import BookmarkCard from '../components/BookmarkCard'

function Categories() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
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

  // Extract all unique tags from bookmarks
  const allTags = Array.from(
    new Set(bookmarks.flatMap(bookmark => bookmark.tags))
  ).sort()

  // Get bookmarks for selected category
  const getBookmarksForCategory = (category: string) => {
    if (category === 'all') return bookmarks
    return bookmarks.filter(bookmark => 
      bookmark.tags.includes(category) ||
      bookmark.title.toLowerCase().includes(category.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(category.toLowerCase())
    )
  }

  const filteredBookmarks = getBookmarksForCategory(selectedCategory).filter(bookmark => {
    if (!searchQuery) return true
    return bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const categories = [
    { id: 'all', name: 'All Categories', count: bookmarks.length },
    ...allTags.map(tag => ({
      id: tag,
      name: tag,
      count: bookmarks.filter(b => b.tags.includes(tag)).length
    }))
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600">Browse your bookmarks by topic and tags</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search within categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Tag className="h-3 w-3 mr-1" />
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Results */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Tag className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'No bookmarks found' : 'No categories yet'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or selecting a different category'
              : 'Start saving bookmarks to see them organized by categories'
            }
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedCategory === 'all' ? 'All Bookmarks' : `${selectedCategory} Bookmarks`}
            </h2>
            <p className="text-sm text-gray-600">
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

export default Categories 