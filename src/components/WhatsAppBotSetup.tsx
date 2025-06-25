import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, UserPhoneNumber } from '../lib/supabase'
import { MessageCircle, Phone, CheckCircle, AlertCircle, Copy, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

interface WhatsAppBotSetupProps {
  isOpen: boolean
  onClose: () => void
}

function WhatsAppBotSetup({ isOpen, onClose }: WhatsAppBotSetupProps) {
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [linkedPhone, setLinkedPhone] = useState<UserPhoneNumber | null>(null)
  const [step, setStep] = useState<'input' | 'instructions' | 'success'>('input')

  useEffect(() => {
    if (isOpen && user) {
      fetchLinkedPhone()
    }
  }, [isOpen, user])

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
        setStep('success')
      }
    } catch (error) {
      console.error('Error fetching phone number:', error)
    }
  }

  const handleLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number (e.g., +1234567890)')
      return
    }

    setLoading(true)
    try {
      // Format phone number (remove spaces, ensure + prefix)
      const formattedPhone = phoneNumber.replace(/\s/g, '').startsWith('+') 
        ? phoneNumber.replace(/\s/g, '') 
        : `+${phoneNumber.replace(/\s/g, '')}`

      const { error } = await supabase
        .from('user_phone_numbers')
        .insert([{
          user_id: user?.id,
          phone_number: formattedPhone,
          is_verified: false
        }])

      console.log('Insert complete, error:', error);

      if (error) {
        if (error.code === '23505') {
          toast.error('This phone number is already linked to another account')
        } else {
          throw error
        }
      } else {
        // Fetch the real row to get the correct UUID
        const { data: phoneRow, error: fetchError } = await supabase
          .from('user_phone_numbers')
          .select('*')
          .eq('user_id', user?.id)
          .single()
        console.log('Fetched phone row:', phoneRow, 'fetchError:', fetchError);
        if (fetchError || !phoneRow) {
          toast.error('Failed to fetch linked phone number')
        } else {
          setLinkedPhone(phoneRow)
          setStep('instructions')
          toast.success('Phone number linked successfully!')
          
          // Send welcome WhatsApp message
          try {
            console.log('Attempting to send welcome message to:', formattedPhone)
            console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
            console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing')
            
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-message`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ phoneNumber: formattedPhone })
              }
            )
            
            console.log('Welcome message response status:', response.status)
            console.log('Welcome message response:', await response.text())
            
            if (response.ok) {
              toast.success('Welcome message sent to your WhatsApp!')
            } else {
              console.log('Welcome message not sent (this is normal in development)')
            }
          } catch (error) {
            console.error('Could not send welcome message:', error)
          }
        }
      }
    } catch (error) {
      toast.error('Failed to link phone number')
      console.error('Error linking phone number:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkPhone = async () => {
    if (!linkedPhone) return

    if (!confirm('Are you sure you want to unlink your phone number?')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_phone_numbers')
        .delete()
        .eq('id', linkedPhone.id)

      if (error) throw error

      setLinkedPhone(null)
      setStep('input')
      toast.success('Phone number unlinked successfully')
    } catch (error) {
      toast.error('Failed to unlink phone number')
      console.error('Error unlinking phone number:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyBotNumber = () => {
    navigator.clipboard.writeText('+1 (555) 123-4567')
    toast.success('Bot number copied to clipboard!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              WhatsApp Bot Setup
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {step === 'input' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Link your phone number to enable WhatsApp bookmarking. Send any link to our bot and it will be automatically saved to your account.
              </p>
              
              <form onSubmit={handleLinkPhone}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="flex-1 input rounded-l-none"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn btn-primary"
                  >
                    {loading ? 'Linking...' : 'Link Phone Number'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'instructions' && linkedPhone && (
            <div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    Phone number linked: {linkedPhone.phone_number}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Save our bot number to your contacts</li>
                    <li>Send any link to the bot</li>
                    <li>Your bookmark will be automatically saved!</li>
                  </ol>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Bot Number</p>
                      <p className="text-lg font-mono text-gray-700 dark:text-gray-300">+1 (555) 123-4567</p>
                    </div>
                    <button
                      onClick={copyBotNumber}
                      className="btn btn-secondary btn-sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Important:</p>
                      <p>This is a demo number. In production, you'll need to set up a real WhatsApp Business API account.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('success')}
                    className="flex-1 btn btn-primary"
                  >
                    Got it!
                  </button>
                  <button
                    onClick={handleUnlinkPhone}
                    className="btn btn-secondary"
                  >
                    Unlink Phone
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && linkedPhone && (
            <div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    WhatsApp bot is ready!
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Linked Number</p>
                      <p className="text-lg font-mono text-gray-700 dark:text-gray-300">{linkedPhone.phone_number}</p>
                    </div>
                    <QrCode className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">You can now:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Send any link to our WhatsApp bot</li>
                    <li>Get automatic metadata extraction</li>
                    <li>Receive AI-generated tags</li>
                    <li>View saved bookmarks in your dashboard</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 btn btn-primary"
                  >
                    Done
                  </button>
                  <button
                    onClick={handleUnlinkPhone}
                    className="btn btn-secondary"
                  >
                    Unlink Phone
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WhatsAppBotSetup 