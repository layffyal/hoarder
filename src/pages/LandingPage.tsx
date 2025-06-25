import { Link } from 'react-router-dom'
import { FaTwitter, FaGithub } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

function LandingPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#f6faff] dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">🧠 hoarder</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <Link to="/login" className="text-primary-700 dark:text-primary-300 font-medium hover:underline">Sign In</Link>
          <Link to="/signup" className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary-700 dark:hover:bg-primary-600 transition">Create Account</Link>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Visualize your bookmarks <br />
          <span className="text-primary-600 dark:text-primary-400">beautifully</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Transform your chaotic bookmarks into an organized, visual workspace. Discover and revisit your favorite content with ease.
        </p>
        <Link to="/signup" className="bg-primary-600 dark:bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-primary-700 dark:hover:bg-primary-600 transition text-lg mb-2">
          Get Started - It's Free
        </Link>
        <div className="text-gray-400 dark:text-gray-500 text-sm mb-12">No credit card required • Free forever plan available</div>
        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-center gap-12 mt-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">50K+</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Bookmarks organized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">10K+</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Active users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">100+</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Visual collections</div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 text-center text-gray-300 dark:text-gray-400 text-sm mt-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-gray-100 dark:text-gray-100">
              <span className="inline-block align-middle">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                  <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">🧠</text>
                </svg>
              </span>
              hoarder
            </span>
          </div>
          <div className="flex items-center gap-4 justify-center mb-2">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"><FaTwitter size={20} /></a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"><FaGithub size={20} /></a>
          </div>
          <div className="text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} hoarder. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 