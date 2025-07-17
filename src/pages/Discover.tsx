import { useState, useEffect } from 'react'
import { UserProfile, Follower, Following } from '../lib/supabase'
import { FollowService } from '../lib/followService'
import { toast } from 'react-hot-toast'
import { Search, UserPlus, Users, UserCheck, Clock, Check, X } from 'lucide-react'

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [following, setFollowing] = useState<Following[]>([])
  const [pendingRequests, setPendingRequests] = useState<Follower[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<Following[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'followers' | 'following' | 'requests' | 'pending'>('discover')
  const [updating, setUpdating] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [followersData, followingData, pendingData, outgoingData] = await Promise.all([
        FollowService.getUserFollowers(),
        FollowService.getUserFollowing(),
        FollowService.getPendingFollowRequests(),
        FollowService.getOutgoingPendingRequests()
      ])
      setFollowers(followersData)
      setFollowing(followingData)
      setPendingRequests(pendingData)
      setOutgoingRequests(outgoingData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const results = await FollowService.searchUsers(searchQuery)
      
      // Check follow status for each user
      const resultsWithFollowStatus = await Promise.all(
        results.map(async (user) => {
          const isFollowing = await FollowService.isFollowing(user.user_id)
          const isPending = await FollowService.isFollowRequestPending(user.user_id)
          return {
            ...user,
            followStatus: (isFollowing ? 'following' : isPending ? 'pending' : 'none') as 'following' | 'pending' | 'none'
          }
        })
      )
      
      setSearchResults(resultsWithFollowStatus)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      setUpdating(userId)
      await FollowService.followUser(userId)
      // Check if the follow was accepted immediately (public user) or pending (private user)
      const isFollowing = await FollowService.isFollowing(userId)
      const isPending = await FollowService.isFollowRequestPending(userId)
      if (isFollowing) {
        toast.success('Successfully followed user')
        setSearchResults(prev => prev.map(user =>
          user.user_id === userId ? { ...user, followStatus: 'following' } : user
        ))
      } else if (isPending) {
        toast.success('Follow request sent')
        setSearchResults(prev => prev.map(user =>
          user.user_id === userId ? { ...user, followStatus: 'pending' } : user
        ))
      }
      await loadData()
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    } finally {
      setUpdating(null)
    }
  }

  const handleUnfollow = async (userId: string) => {
    try {
      setUpdating(userId)
      await FollowService.unfollowUser(userId)
      toast.success('Unfollowed user')
      await loadData()
    } catch (error) {
      console.error('Error unfollowing user:', error)
      toast.error('Failed to unfollow user')
    } finally {
      setUpdating(null)
    }
  }

  const handleWithdrawRequest = async (userId: string) => {
    try {
      setUpdating(userId)
      await FollowService.withdrawFollowRequest(userId)
      toast.success('Follow request withdrawn')
      setSearchResults(prev => prev.map(user =>
        user.user_id === userId ? { ...user, followStatus: 'none' as const } : user
      ))
      await loadData()
    } catch (error) {
      console.error('Error withdrawing follow request:', error)
      toast.error('Failed to withdraw follow request')
    } finally {
      setUpdating(null)
    }
  }

  const handleAcceptRequest = async (followerId: string) => {
    try {
      setUpdating(followerId)
      await FollowService.acceptFollowRequest(followerId)
      toast.success('Follow request accepted')
      await loadData()
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept request')
    } finally {
      setUpdating(null)
    }
  }

  const handleRejectRequest = async (followerId: string) => {
    try {
      setUpdating(followerId)
      await FollowService.rejectFollowRequest(followerId)
      toast.success('Follow request rejected')
      await loadData()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request')
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const UserCard = ({ user, showFollowButton = false, showUnfollowButton = false, showAcceptReject = false, onAccept, onReject, onWithdraw }: any) => {
    // Handle different data structures for different user types
    const displayName = user.display_name || user.follower_display_name || user.following_display_name || user.username || user.follower_username || user.following_username || 'Unknown User'
    const username = user.username || user.follower_username || user.following_username
    const bio = user.bio
    
    // Determine if this is a pending request (for outgoing requests)
    const isPendingRequest = user.status === 'pending' && user.following_id
    
    return (
    <div className="card p-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <span className="text-primary-600 dark:text-primary-400 text-lg">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {displayName}
          </h3>
          {username && (
            <p className="text-sm text-gray-600 dark:text-gray-400">@{username}</p>
          )}
          {bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{bio}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {showFollowButton && (
            <>
              {(user.followStatus === 'none' || (!user.followStatus && !isPendingRequest)) && (
                <button
                  onClick={() => handleFollow(user.user_id || user.following_id)}
                  className="btn btn-primary btn-sm flex items-center space-x-1"
                  disabled={updating === (user.user_id || user.following_id)}
                >
                  {updating === (user.user_id || user.following_id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
              {(user.followStatus === 'pending' || isPendingRequest) && (
                <button
                  onClick={() => onWithdraw(user.user_id || user.following_id)}
                  className="btn btn-secondary btn-sm flex items-center space-x-1"
                  disabled={updating === (user.user_id || user.following_id)}
                >
                  {updating === (user.user_id || user.following_id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Withdraw Request</span>
                    </>
                  )}
                </button>
              )}
              {user.followStatus === 'following' && (
                <button
                  onClick={() => handleUnfollow(user.user_id || user.following_id)}
                  className="btn btn-secondary btn-sm"
                  disabled={updating === (user.user_id || user.following_id)}
                >
                  {updating === (user.user_id || user.following_id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Unfollow'
                  )}
                </button>
              )}
            </>
          )}
          {showUnfollowButton && (
            <button
              onClick={() => handleUnfollow(user.following_id || user.user_id)}
              className="btn btn-secondary btn-sm"
              disabled={updating === user.user_id}
            >
              {updating === user.user_id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Unfollow'
              )}
            </button>
          )}
          {showAcceptReject && (
            <div className="flex space-x-1">
              <button
                onClick={() => onAccept(user.follower_id)}
                className="btn btn-primary btn-sm"
                disabled={updating === user.follower_id}
                aria-label="Accept follow request"
              >
                {updating === user.follower_id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => onReject(user.follower_id)}
                className="btn btn-secondary btn-sm"
                disabled={updating === user.follower_id}
                aria-label="Reject follow request"
              >
                {updating === user.follower_id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Discover People</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find and follow people to see their shared bookmarks
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Search className="h-4 w-4 inline mr-2" />
          Discover
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'followers'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Followers ({followers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'following'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <UserCheck className="h-4 w-4 inline mr-2" />
          Following ({following?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Requests ({pendingRequests?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Pending ({outgoingRequests?.length || 0})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'discover' && (
        <div>
          {/* Search */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search by username or display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input flex-1"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn btn-primary"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((user) => (
                <UserCard 
                  key={user.user_id} 
                  user={user} 
                  showFollowButton={true}
                  onWithdraw={handleWithdrawRequest}
                />
              ))}
            </div>
          ) : searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'followers' && (
        <div className="space-y-4">
          {!followers || followers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No followers yet</p>
            </div>
          ) : (
            followers.map((follower) => (
              <UserCard key={follower.follower_id} user={follower} />
            ))
          )}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="space-y-4">
          {!following || following.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Not following anyone yet</p>
            </div>
          ) : (
            following.map((followingUser) => (
              <UserCard 
                key={followingUser.following_id} 
                user={followingUser} 
                showUnfollowButton={true}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {!pendingRequests || pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No pending follow requests</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <UserCard 
                key={request.follower_id} 
                user={request} 
                showAcceptReject={true}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {!outgoingRequests || outgoingRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No outgoing follow requests</p>
            </div>
          ) : (
            outgoingRequests.map((request) => (
              <UserCard 
                key={request.following_id} 
                user={request} 
                showFollowButton={true}
                onWithdraw={handleWithdrawRequest}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
} 