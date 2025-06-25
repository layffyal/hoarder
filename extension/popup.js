import { authManager } from './lib/auth.js'
import { saveCurrentPage } from './lib/bookmarks.js'

function storeAuthToken(session) {
  if (session && session.access_token) {
    chrome.storage.local.set({ hoarder_auth_token: session.access_token });
  }
}

function clearAuthToken() {
  chrome.storage.local.remove('hoarder_auth_token');
}

function showBanner(message, type = 'success', duration = 3000) {
  let banner = document.getElementById('hoarder-banner')
  if (!banner) {
    banner = document.createElement('div')
    banner.id = 'hoarder-banner'
    banner.style.position = 'fixed'
    banner.style.top = '0'
    banner.style.left = '0'
    banner.style.right = '0'
    banner.style.zIndex = '9999'
    banner.style.padding = '16px'
    banner.style.textAlign = 'center'
    banner.style.fontWeight = 'bold'
    banner.style.fontSize = '16px'
    banner.style.transition = 'opacity 0.3s'
    document.body.appendChild(banner)
  }
  banner.textContent = message
  banner.style.backgroundColor = type === 'success' ? '#22c55e' : '#ef4444'
  banner.style.color = '#fff'
  banner.style.opacity = '1'
  setTimeout(() => {
    banner.style.opacity = '0'
    setTimeout(() => banner.remove(), 300)
  }, duration)
}

class PopupApp {
  constructor() {
    this.root = document.getElementById('root')
    this.currentView = 'loading'
    this.authState = { user: null, session: null, loading: true }
    
    this.init()
  }

  async init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'SHOW_BANNER') {
        showBanner(request.message, request.status)
      }
    })
    // On popup load, check session validity
    await this.checkSession()
    // Subscribe to auth state changes
    this.unsubscribe = authManager.subscribe((state) => {
      this.authState = state
      // Store the token whenever the session changes
      if (state.session && state.session.access_token) {
        chrome.storage.local.set({ hoarder_auth_token: state.session.access_token });
      }
      this.render()
    })
  }

  async checkSession() {
    // Check session validity with Supabase
    if (authManager && typeof authManager.init === 'function') {
      await authManager.init()
    }
  }

  render() {
    if (this.authState.loading) {
      this.renderLoading()
    } else if (this.authState.user) {
      this.renderAuthenticated()
    } else {
      this.renderLogin()
    }
  }

  renderLoading() {
    this.root.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-600">Loading...</p>
        </div>
      </div>
    `
  }

  renderLogin() {
    this.root.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div class="max-w-md w-full space-y-8">
          <div>
            <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
              <span class="text-2xl">🧠</span>
            </div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to Hoarder
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              Save bookmarks to your Hoarder account
            </p>
          </div>

          <form id="loginForm" class="mt-8 space-y-6">
            <div class="space-y-4">
              <div>
                <label for="email" class="sr-only">Email address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    class="input pl-10"
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <label for="password" class="sr-only">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    class="input pl-10"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                id="signInBtn"
                class="btn btn-primary btn-full"
              >
                Sign in
              </button>
            </div>

            <div class="divider">
              <span>Or continue with</span>
            </div>

            <div>
              <button
                type="button"
                id="googleSignInBtn"
                class="btn btn-secondary btn-full"
              >
                <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            <div class="text-center">
              <p class="text-sm text-gray-600">
                Don't have an account? 
                <button type="button" id="showSignUpBtn" class="font-medium text-primary-600 hover:text-primary-500">
                  Sign up
                </button>
              </p>
            </div>
          </form>

          <form id="signUpForm" class="mt-8 space-y-6 hidden">
            <div class="space-y-4">
              <div>
                <label for="signUpEmail" class="sr-only">Email address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                  <input
                    id="signUpEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    class="input pl-10"
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <label for="signUpPassword" class="sr-only">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    id="signUpPassword"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    class="input pl-10"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                id="signUpBtn"
                class="btn btn-primary btn-full"
              >
                Sign up
              </button>
            </div>

            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account? 
                <button type="button" id="showSignInBtn" class="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    `

    this.attachEventListeners()
  }

  renderAuthenticated() {
    this.root.innerHTML = `
      <div class="min-h-screen flex flex-col bg-white">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-8 w-8 flex items-center justify-center rounded-full bg-primary-100">
                <span class="text-lg">🧠</span>
              </div>
              <div class="ml-3">
                <h1 class="text-lg font-semibold text-gray-900">Hoarder</h1>
                <p class="text-sm text-gray-500">${this.authState.user.email}</p>
              </div>
            </div>
            <button id="signOutBtn" class="text-sm text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>

        <div class="flex-1 p-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Save Current Page</h2>
            <p class="text-sm text-gray-600 mb-6">Save the current page to your Hoarder account</p>
            
            <button id="savePageBtn" class="btn btn-primary btn-full">
              Save to Hoarder
            </button>
          </div>

          <div class="mt-8">
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Keyboard Shortcuts</h3>
              <div class="space-y-1 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span>Save bookmark:</span>
                  <kbd class="px-2 py-1 bg-white border border-gray-300 rounded text-xs">${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Shift+S</kbd>
                </div>
                <div class="flex justify-between">
                  <span>Open popup:</span>
                  <kbd class="px-2 py-1 bg-white border border-gray-300 rounded text-xs">${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Shift+H</kbd>
                </div>
              </div>
            </div>

            <div class="text-center">
              <a href="https://hoarder-eight.vercel.app/app" target="_blank" class="text-sm text-primary-600 hover:text-primary-500">
                View all bookmarks →
              </a>
            </div>
          </div>
        </div>
      </div>
    `

    this.attachAuthenticatedEventListeners()
  }

  attachEventListeners() {
    const loginForm = document.getElementById('loginForm')
    const signUpForm = document.getElementById('signUpForm')
    const showSignUpBtn = document.getElementById('showSignUpBtn')
    const showSignInBtn = document.getElementById('showSignInBtn')
    const googleSignInBtn = document.getElementById('googleSignInBtn')

    if (loginForm) {
      loginForm.addEventListener('submit', this.handleSignIn.bind(this))
    }

    if (signUpForm) {
      signUpForm.addEventListener('submit', this.handleSignUp.bind(this))
    }

    if (showSignUpBtn) {
      showSignUpBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden')
        signUpForm.classList.remove('hidden')
      })
    }

    if (showSignInBtn) {
      showSignInBtn.addEventListener('click', () => {
        signUpForm.classList.add('hidden')
        loginForm.classList.remove('hidden')
      })
    }

    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', this.handleGoogleSignIn.bind(this))
    }
  }

  attachAuthenticatedEventListeners() {
    const signOutBtn = document.getElementById('signOutBtn')
    const savePageBtn = document.getElementById('savePageBtn')

    if (signOutBtn) {
      console.log('Attaching sign out event listener');
      signOutBtn.addEventListener('click', this.handleSignOut.bind(this))
    } else {
      console.log('Sign out button not found');
    }

    if (savePageBtn) {
      savePageBtn.addEventListener('click', this.handleSavePage.bind(this))
    }
  }

  async handleSignIn(e) {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const button = document.getElementById('signInBtn')

    try {
      button.disabled = true
      button.innerHTML = '<div class="spinner mr-2"></div>Signing in...'
      await authManager.signIn(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Invalid email or password')
    } finally {
      button.disabled = false
      button.textContent = 'Sign in'
    }
  }

  async handleSignUp(e) {
    e.preventDefault()
    const email = document.getElementById('signUpEmail').value
    const password = document.getElementById('signUpPassword').value
    const button = document.getElementById('signUpBtn')

    try {
      button.disabled = true
      button.innerHTML = '<div class="spinner mr-2"></div>Signing up...'
      await authManager.signUp(email, password)
      alert('Check your email to confirm your account!')
    } catch (error) {
      console.error('Sign up error:', error)
      alert('Failed to create account: ' + error.message)
    } finally {
      button.disabled = false
      button.textContent = 'Sign up'
    }
  }

  async handleGoogleSignIn() {
    const button = document.getElementById('googleSignInBtn')
    try {
      button.disabled = true
      button.innerHTML = '<div class="spinner mr-2"></div>Signing in...'
      await authManager.signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
      alert('Failed to sign in with Google')
    } finally {
      button.disabled = false
      button.innerHTML = `
        <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      `
    }
  }

  async handleSignOut() {
    try {
      console.log('Attempting to sign out...');
      console.log('Current auth state:', this.authState);
      
      // Check if we have a valid session before calling signOut
      if (!this.authState.session) {
        console.log('No session in auth state, just clearing token and updating UI');
        clearAuthToken();
        this.authState = { user: null, session: null, loading: false };
        this.render();
        return;
      }
      
      try {
        await authManager.signOut();
        console.log('Sign out successful');
      } catch (signOutError) {
        console.log('Supabase signOut failed, but continuing with local cleanup:', signOutError);
        // Even if Supabase signOut fails, we'll clear everything locally
      }
      
      // Always clear the token and update UI, regardless of Supabase signOut success
      clearAuthToken();
      this.authState = { user: null, session: null, loading: false };
      this.render();
      console.log('Local cleanup completed');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if everything fails, try to clear locally
      try {
        clearAuthToken();
        this.authState = { user: null, session: null, loading: false };
        this.render();
        console.log('Emergency cleanup completed');
      } catch (cleanupError) {
        console.error('Emergency cleanup also failed:', cleanupError);
      }
      showBanner('Error signing out', 'error');
    }
  }

  async handleSavePage() {
    if (!this.authState.user) {
      alert('You must be logged in to save bookmarks')
      return
    }

    const button = document.getElementById('savePageBtn')
    const originalText = button.textContent

    try {
      button.disabled = true
      button.innerHTML = '<div class="spinner mr-2"></div>Saving...'
      
      const result = await saveCurrentPage(this.authState.user.id)
      
      if (result.success) {
        button.innerHTML = '<div class="spinner mr-2"></div>Saved!'
        setTimeout(() => {
          button.disabled = false
          button.textContent = originalText
        }, 2000)
      }
    } catch (error) {
      console.error('Save page error:', error)
      alert('Failed to save bookmark: ' + error.message)
      button.disabled = false
      button.textContent = originalText
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }
}

// Initialize the popup app
const app = new PopupApp()

// Cleanup when popup closes
window.addEventListener('beforeunload', () => {
  app.destroy()
}) 