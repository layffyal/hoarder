import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { FollowService } from '../lib/followService'
import { toast } from 'react-hot-toast'

export default function Test() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    if (!user) {
      setTestResults(['❌ No user logged in'])
      return
    }

    setLoading(true)
    const results: string[] = []

    try {
      // Test 1: Basic bookmarks query
      results.push('🔍 Testing bookmarks table...')
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .limit(1)
      
      if (bookmarksError) {
        results.push(`❌ Bookmarks query failed: ${bookmarksError.message}`)
      } else {
        results.push(`✅ Bookmarks table accessible (${bookmarks?.length || 0} records found)`)
      }

      // Test 2: User profiles table
      results.push('🔍 Testing user_profiles table...')
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
      
      if (profilesError) {
        results.push(`❌ User profiles query failed: ${profilesError.message}`)
      } else {
        results.push(`✅ User profiles table accessible (${profiles?.length || 0} records found)`)
      }

      // Test 3: Follows table
      results.push('🔍 Testing follows table...')
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('*')
        .limit(1)
      
      if (followsError) {
        results.push(`❌ Follows query failed: ${followsError.message}`)
      } else {
        results.push(`✅ Follows table accessible (${follows?.length || 0} records found)`)
      }

      // Test 4: FollowService methods
      results.push('🔍 Testing FollowService...')
      try {
        const followers = await FollowService.getUserFollowers()
        results.push(`✅ FollowService.getUserFollowers() works (${followers.length} followers)`)
      } catch (error: any) {
        results.push(`❌ FollowService.getUserFollowers() failed: ${error.message}`)
      }

      try {
        const following = await FollowService.getUserFollowing()
        results.push(`✅ FollowService.getUserFollowing() works (${following.length} following)`)
      } catch (error: any) {
        results.push(`❌ FollowService.getUserFollowing() failed: ${error.message}`)
      }

      // Test 5: Check if user has a profile
      results.push('🔍 Checking user profile...')
      try {
        const profile = await FollowService.getUserProfile(user.id)
        if (profile) {
          results.push(`✅ User profile exists: ${profile.display_name || profile.username || 'No name set'}`)
        } else {
          results.push('⚠️ User profile does not exist (this is normal for new users)')
        }
      } catch (error: any) {
        results.push(`❌ User profile check failed: ${error.message}`)
      }

    } catch (error: any) {
      results.push(`❌ General error: ${error.message}`)
    }

    setTestResults(results)
    setLoading(false)
  }

  const createTestProfile = async () => {
    if (!user) return

    try {
      await FollowService.updateUserProfile({
        username: 'testuser',
        display_name: 'Test User',
        bio: 'This is a test profile',
        is_private: false
      })
      toast.success('Test profile created!')
      runTests()
    } catch (error: any) {
      toast.error(`Failed to create test profile: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Database Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing database connectivity and new tables
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={runTests}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Running Tests...' : 'Run Tests'}
          </button>
          
          <button
            onClick={createTestProfile}
            className="btn btn-secondary"
          >
            Create Test Profile
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Instructions</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Make sure you've run the database migration in Supabase</p>
            <p>2. Click "Run Tests" to check database connectivity</p>
            <p>3. If user profile doesn't exist, click "Create Test Profile"</p>
            <p>4. Check the results to see what's working and what's not</p>
          </div>
        </div>
      </div>
    </div>
  )
} 