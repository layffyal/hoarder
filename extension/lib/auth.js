import { supabase } from './supabase.js'

class AuthManager {
  constructor() {
    this.user = null
    this.session = null
    this.loading = true
    this.listeners = []
    
    this.init()
  }

  async init() {
    try {
      // Check if there's a recent signout flag
      const signoutResult = await chrome.storage.local.get(['hoarder_signout_flag']);
      if (signoutResult.hoarder_signout_flag) {
        const now = Date.now();
        const flagTime = signoutResult.hoarder_signout_flag;
        const timeDiff = now - flagTime;
        
        // Only skip session restoration if the signout was very recent (within 5 seconds)
        if (timeDiff < 5000) {
          console.log('Found recent signout flag (', timeDiff, 'ms ago), clearing it and skipping session restoration');
          await chrome.storage.local.remove('hoarder_signout_flag');
          // Don't try to restore session, just start fresh
          this.session = null;
          this.user = null;
          this.loading = false;
          this.notifyListeners();
          return;
        } else {
          console.log('Found old signout flag (', timeDiff, 'ms ago), clearing it and allowing normal session restoration');
          await chrome.storage.local.remove('hoarder_signout_flag');
        }
      }
      
      // First, try to restore session from chrome.storage.local
      const result = await chrome.storage.local.get(['hoarder_auth_token']);
      if (result.hoarder_auth_token) {
        console.log('Found stored auth token, attempting to restore session...');
        
        // Try to get the current session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No current session, try to refresh using the stored token
          // Since we only store access tokens, we'll need to handle this differently
          console.log('No current session, clearing stored token as it may be invalid');
          await chrome.storage.local.remove('hoarder_auth_token');
        } else {
          console.log('Current session exists, using it');
          this.session = session;
          this.user = session.user;
        }
      }

      // Get current session (this will use any existing session)
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user ?? null
      this.loading = false
      this.notifyListeners()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
          this.session = session
          this.user = session?.user ?? null
          this.loading = false
          
          // Store or clear token based on session state
          if (session && session.access_token) {
            await chrome.storage.local.set({ hoarder_auth_token: session.access_token });
            console.log('Stored new auth token');
          } else {
            await chrome.storage.local.remove('hoarder_auth_token');
            console.log('Cleared auth token');
          }
          
          this.notifyListeners()
        }
      )

      // Store subscription for cleanup
      this.subscription = subscription
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.loading = false
      this.notifyListeners()
    }
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    this.listeners.push(callback)
    // Immediately call with current state
    callback({
      user: this.user,
      session: this.session,
      loading: this.loading
    })

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        user: this.user,
        session: this.session,
        loading: this.loading
      })
    })
  }

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  async signUp(email, password) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  async signOut() {
    console.log('authManager.signOut called');
    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No valid session found, just clearing stored token');
        await chrome.storage.local.remove('hoarder_auth_token');
        // Update our internal state
        this.session = null;
        this.user = null;
        this.notifyListeners();
        return;
      }
      
      // If we have a session, try to sign out properly
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase signOut error:', error);
          throw error;
        }
        console.log('Supabase signOut successful');
      } catch (signOutError) {
        console.error('Supabase signOut failed:', signOutError);
        // Don't re-throw, we'll handle cleanup locally
      }
      
      // Always clear stored token and update state, regardless of Supabase signOut success
      await chrome.storage.local.remove('hoarder_auth_token');
      console.log('Stored auth token cleared');
      
      // Clear our internal state
      this.session = null;
      this.user = null;
      
      // Set a flag to prevent session restoration on next init
      await chrome.storage.local.set({ hoarder_signout_flag: Date.now() });
      console.log('Set signout flag to prevent session restoration');
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if everything fails, clear the stored token and update state
      await chrome.storage.local.remove('hoarder_auth_token');
      this.session = null;
      this.user = null;
      this.notifyListeners();
      throw error;
    }
  }

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: chrome.runtime.getURL('popup.html'),
      },
    })
    if (error) throw error
  }

  // Cleanup
  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.listeners = []
  }
}

// Create singleton instance
export const authManager = new AuthManager() 