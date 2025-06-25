import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Bookmark,
  Grid,
  Settings, 
  LogOut,
  Plus
} from 'lucide-react'
import AddBookmarkModal from './AddBookmarkModal'
import ThemeToggle from './ThemeToggle'

function Layout() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Categories', href: '/categories', icon: Bookmark },
    { name: 'Platforms', href: '/platforms', icon: Grid },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleBookmarkAdded = () => {
    // Refresh the current page data if needed
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg dark:bg-gray-800 dark:shadow-gray-900/20">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">🧠 Hoarder</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleSignOut}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
        title="Add Bookmark"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookmarkAdded={handleBookmarkAdded}
      />
    </div>
  )
}

export default Layout 