import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { fetchUrlMetadata, generateTags } from '../lib/metadata'
import { Link, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuickAddBookmarkProps {
  onBookmarkAdded: () => void
}

function QuickAddBookmark({ onBookmarkAdded }: QuickAddBookmarkProps) {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    if (!user) {
      toast.error('You must be logged in to add bookmarks')
      return
    }

    setLoading(true)
    try {
      // Fetch metadata from URL
      const metadata = await fetchUrlMetadata(url)
      
      // Generate AI tags
      const tags = generateTags(metadata.title, metadata.description, metadata.platform)
      
      // Create bookmark
      const newBookmark = {
        url: url.trim(),
        title: metadata.title || 'Unknown',
        description: metadata.description,
        image_url: metadata.image,
        platform: metadata.platform,
        tags,
        user_id: user.id
      }

      const { error } = await supabase
        .from('bookmarks')
        .insert([newBookmark])

      if (error) throw error

      toast.success('Bookmark added successfully!')
      setUrl('')
      onBookmarkAdded()
    } catch (error) {
      toast.error('Failed to add bookmark')
      console.error('Error adding bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Add Bookmark</h3>
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL here..."
            className="input pl-10"
            disabled={loading}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      <p className="mt-2 text-xs text-gray-500">
        Just paste a URL and we'll automatically fetch the title, description, and tags
      </p>
    </div>
  )
}

export default QuickAddBookmark 