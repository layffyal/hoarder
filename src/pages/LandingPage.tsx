import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary-600">🧠 Hoarder</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-primary-700 font-medium hover:underline">Sign In</Link>
          <Link to="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary-700 transition">Create Account</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Transform your chaotic bookmarks into an organized, visual workspace.</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
          Discover and revisit your favorite content with ease.
        </p>
        <div className="space-x-4 mb-4">
          <Link to="/signup" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary-700 transition text-lg">Get Started - It's Free</Link>
        </div>
        <p className="text-gray-400 text-sm mb-12">No credit card required • Free forever plan available</p>
        {/* Stats Section */}
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-700">50K+</div>
            <div className="text-gray-600 text-sm">Bookmarks organized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-700">10K+</div>
            <div className="text-gray-600 text-sm">Active users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-700">100+</div>
            <div className="text-gray-600 text-sm">Visual collections</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Hoarder?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-700 mb-2">Save from Anywhere</h3>
              <p className="text-gray-600">Bookmark links from Twitter, YouTube, Medium, WhatsApp, and more. One click or one message is all it takes.</p>
            </div>
            <div className="bg-primary-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-700 mb-2">Smart Tagging</h3>
              <p className="text-gray-600">Automatic metadata extraction and AI-powered tags help you find what you need, fast.</p>
            </div>
            <div className="bg-primary-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary-700 mb-2">WhatsApp Integration</h3>
              <p className="text-gray-600">Save links by simply messaging them to your Hoarder WhatsApp bot. It's that easy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 text-primary-700 rounded-full p-4 mb-4 text-3xl">🔗</div>
              <h4 className="font-semibold mb-2">Send or Paste a Link</h4>
              <p className="text-gray-600 text-center">Use WhatsApp or the web app to save any link, article, or video.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 text-primary-700 rounded-full p-4 mb-4 text-3xl">🏷️</div>
              <h4 className="font-semibold mb-2">We Organize It</h4>
              <p className="text-gray-600 text-center">Hoarder extracts metadata, generates tags, and sorts your content automatically.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 text-primary-700 rounded-full p-4 mb-4 text-3xl">📚</div>
              <h4 className="font-semibold mb-2">Access Anytime</h4>
              <p className="text-gray-600 text-center">Find, search, and manage your knowledge from your personal dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Hoarder. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage 