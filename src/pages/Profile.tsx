import { useState, useEffect } from 'react'

import { UserProfile } from '../lib/supabase'
import { FollowService } from '../lib/followService'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { User, Save, Eye, EyeOff, Users, UserCheck } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    is_private: false
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [profileData, followers, following] = await Promise.all([
        FollowService.getUserProfile(user.id),
        FollowService.getUserFollowers(),
        FollowService.getUserFollowing()
      ])

      if (profileData) {
        setProfile(profileData)
      }
      setFollowersCount(followers.length)
      setFollowingCount(following.length)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      await FollowService.updateUserProfile(profile)
      toast.success('Profile updated successfully')
      await loadProfile() // reload profile after update
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile and privacy settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h2>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  className="input"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This will be your unique identifier on the platform
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.display_name || ''}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Enter display name"
                  className="input"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This is the name that will be shown to other users
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="input resize-none"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  A short description about yourself
                </p>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="input"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  URL to your profile picture
                </p>
              </div>

              {/* Privacy Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('is_private', false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !profile.is_private
                        ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('is_private', true)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.is_private
                        ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <EyeOff className="h-4 w-4" />
                    <span>Private</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {profile.is_private 
                    ? 'Private: Users must request to follow you to see your public bookmarks'
                    : 'Public: Anyone can see your profile and public bookmarks'
                  }
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Profile Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Followers</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {followersCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Following</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {followingCount}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Privacy Tips
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Public profiles are visible to everyone</li>
                <li>• Private profiles require follow approval</li>
                <li>• You can make individual bookmarks private</li>
                <li>• Only public bookmarks appear in feeds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 