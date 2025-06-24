import { useState } from 'react'
import { X, Link, Tag, Plus, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Bookmark } from '../lib/supabase'
import { fetchUrlMetadata, generateTags } from '../lib/metadata'
import toast from 'react-hot-toast'

interface AddBookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  onBookmarkAdded: () => void
}

function AddBookmarkModal({ isOpen, onClose, onBookmarkAdded }: AddBookmarkModalProps) {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'reddit' | 'tiktok' | 'web'>('web')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingMetadata, setFetchingMetadata] = useState(false)

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl)
    
    if (newUrl.trim()) {
      setFetchingMetadata(true)
      try {
        const metadata = await fetchUrlMetadata(newUrl)
        
        // Auto-fill the form with fetched metadata
        setTitle(metadata.title || '')
        setDescription(metadata.description || '')
        setImageUrl(metadata.image || '')
        setPlatform(metadata.platform)
        
        // Generate AI tags
        const aiTags = generateTags(metadata.title, metadata.description, metadata.platform)
        setTags(aiTags)
        
        toast.success('Metadata fetched successfully!')
      } catch (error) {
        console.error('Error fetching metadata:', error)
        toast.error('Could not fetch metadata. Please fill in manually.')
      } finally {
        setFetchingMetadata(false)
      }
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim() || !title.trim()) {
      toast.error('Please provide a URL and title')
      return
    }

    if (!user) {
      toast.error('You must be logged in to add bookmarks')
      return
    }

    setLoading(true)
    try {
      const newBookmark: Omit<Bookmark, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        platform,
        tags
      }

      const { error } = await supabase
        .from('bookmarks')
        .insert([{ ...newBookmark, user_id: user.id }])

      if (error) throw error

      toast.success('Bookmark added successfully!')
      onBookmarkAdded()
      handleClose()
    } catch (error) {
      toast.error('Failed to add bookmark')
      console.error('Error adding bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setImageUrl('')
    setPlatform('web')
    setTags([])
    setNewTag('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Add New Bookmark</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="input pl-10"
                required
              />
              {fetchingMetadata && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Paste a URL and we'll automatically fetch the metadata
            </p>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['twitter', 'linkedin', 'reddit', 'tiktok', 'web'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    platform === p
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bookmark title"
              className="input"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Image URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              Tags (AI-generated)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingMetadata}
              className="btn btn-primary flex-1 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Bookmark'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddBookmarkModal 