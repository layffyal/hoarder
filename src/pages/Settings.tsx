import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Shield, Trash2, MessageCircle, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

function Settings() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [whatsappBot, setWhatsappBot] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
      console.error('Sign out error:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      // In a real app, you'd call a Supabase function to delete the user and all their data
      toast.error('Account deletion not implemented in MVP')
    } catch (error) {
      toast.error('Failed to delete account')
      console.error('Delete account error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleNotifications = () => {
    setNotifications(!notifications)
    toast.success(`Notifications ${!notifications ? 'enabled' : 'disabled'}`)
  }

  const handleToggleWhatsAppBot = () => {
    setWhatsappBot(!whatsappBot)
    toast.success(`WhatsApp bot ${!whatsappBot ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Get reminders about saved content</p>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Integrations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Chrome className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Browser Extension</p>
                  <p className="text-sm text-gray-600">Save bookmarks from any website</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">WhatsApp Bot</p>
                  <p className="text-sm text-gray-600">Save links by messaging the bot</p>
                </div>
              </div>
              <button
                onClick={handleToggleWhatsAppBot}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whatsappBot ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    whatsappBot ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Data Privacy</p>
                <p className="text-sm text-gray-600">Your data is encrypted and secure</p>
              </div>
            </div>
            
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex items-center text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Bot Instructions */}
      {whatsappBot && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">WhatsApp Bot Setup</h3>
          <p className="text-blue-800 mb-4">
            To use the WhatsApp bot, send a message to our bot number with any link you want to save.
          </p>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-900 font-mono">
              +1 (555) 123-4567
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings 