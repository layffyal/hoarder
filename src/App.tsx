import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Categories from './pages/Categories'
import PlatformView from './pages/PlatformView'
import Settings from './pages/Settings'
import LandingPage from './pages/LandingPage'
import Feed from './pages/Feed'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Test from './pages/Test'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes */}
              <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Home />} />
                <Route path="feed" element={<Feed />} />
                <Route path="discover" element={<Discover />} />
                <Route path="profile" element={<Profile />} />
                <Route path="categories" element={<Categories />} />
                <Route path="platforms" element={<PlatformView />} />
                <Route path="settings" element={<Settings />} />
                <Route path="test" element={<Test />} />
              </Route>
            </Routes>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App 