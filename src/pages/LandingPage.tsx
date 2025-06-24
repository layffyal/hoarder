import { Link } from 'react-router-dom'
import { FaTwitter, FaGithub } from 'react-icons/fa'

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#f6faff]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary-600">🧠 hoarder</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-primary-700 font-medium hover:underline">Sign In</Link>
          <Link to="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary-700 transition">Create Account</Link>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Visualize your bookmarks <br />
          <span className="text-primary-600">beautifully</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Transform your chaotic bookmarks into an organized, visual workspace. Discover and revisit your favorite content with ease.
        </p>
        <Link to="/signup" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-primary-700 transition text-lg mb-2">
          Get Started - It's Free
        </Link>
        <div className="text-gray-400 text-sm mb-12">No credit card required • Free forever plan available</div>
        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-center gap-12 mt-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">50K+</div>
            <div className="text-gray-500 text-sm">Bookmarks organized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">10K+</div>
            <div className="text-gray-500 text-sm">Active users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">100+</div>
            <div className="text-gray-500 text-sm">Visual collections</div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#181f2a] py-8 text-center text-gray-300 text-sm mt-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold">
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
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400"><FaTwitter size={20} /></a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400"><FaGithub size={20} /></a>
          </div>
          <div>&copy; {new Date().getFullYear()} hoarder. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 