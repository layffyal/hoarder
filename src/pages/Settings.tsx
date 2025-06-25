import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, UserPhoneNumber } from '../lib/supabase'
import { Bell, Shield, Trash2, MessageCircle, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'
import WhatsAppBotSetup from '../components/WhatsAppBotSetup'

function Settings() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [whatsappBot, setWhatsappBot] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false)
  const [linkedPhone, setLinkedPhone] = useState<UserPhoneNumber | null>(null)

  useEffect(() => {
    if (user) {
      fetchLinkedPhone()
    }
  }, [user])

  const fetchLinkedPhone = async () => {
    try {
      const { data, error } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching phone number:', error)
      } else if (data) {
        setLinkedPhone(data)
        setWhatsappBot(true)
      }
    } catch (error) {
      console.error('Error fetching phone number:', error)
    }
  }

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
    if (!whatsappBot) {
      setShowWhatsAppSetup(true)
    } else {
      setWhatsappBot(false)
      setLinkedPhone(null)
      toast.success('WhatsApp bot disabled')
    }
  }

  const handleWhatsAppSetupClose = () => {
    setShowWhatsAppSetup(false)
    fetchLinkedPhone() // Refresh the linked phone status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and integrations</p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get reminders about saved content</p>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Integrations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Chrome className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Browser Extension</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save bookmarks from any website</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">WhatsApp Bot</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {linkedPhone 
                      ? `Linked to ${linkedPhone.phone_number}`
                      : 'Save links by messaging the bot'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleWhatsAppBot}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whatsappBot ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data Privacy</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data is encrypted and secure</p>
              </div>
            </div>
            
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Bot Setup Modal */}
      {showWhatsAppSetup && (
        <WhatsAppBotSetup
          isOpen={showWhatsAppSetup}
          onClose={handleWhatsAppSetupClose}
        />
      )}
    </div>
  )
}

export default Settings 