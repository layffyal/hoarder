import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Discover from '../../pages/Discover'
import Profile from '../../pages/Profile'
import { FollowService } from '../../lib/followService'
import { mockFollowService } from '../__mocks__/followService'
import { useAuth } from '../../contexts/AuthContext'

// Mock the FollowService
vi.mock('../../lib/followService', () => ({
  FollowService: {
    searchUsers: vi.fn(),
    getUserFollowers: vi.fn(),
    getUserFollowing: vi.fn(),
    getPendingFollowRequests: vi.fn(),
    getOutgoingPendingRequests: vi.fn(),
    isFollowing: vi.fn(),
    isFollowRequestPending: vi.fn(),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    acceptFollowRequest: vi.fn(),
    rejectFollowRequest: vi.fn(),
    withdrawFollowRequest: vi.fn(),
  },
}))

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
  }
})

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Test wrapper with router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Follower/Following Integration Flow', () => {
  const user = userEvent.setup()
  const mockAuthUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  }

  const mockTargetUser = {
    id: 'target-user-id',
    user_id: 'target-user-id',
    username: 'targetuser',
    display_name: 'Target User',
    bio: 'Target user bio',
    avatar_url: 'https://example.com/target-avatar.jpg',
    is_private: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: mockAuthUser,
      session: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
      loading: false,
    })
    
    // Reset mock implementations
    mockFollowService.getUserFollowers.mockResolvedValue([])
    mockFollowService.getUserFollowing.mockResolvedValue([])
    mockFollowService.getPendingFollowRequests.mockResolvedValue([])
    mockFollowService.getOutgoingPendingRequests.mockResolvedValue([])
    mockFollowService.searchUsers.mockResolvedValue([])
    mockFollowService.isFollowing.mockResolvedValue(false)
    mockFollowService.isFollowRequestPending.mockResolvedValue(false)
    mockFollowService.getUserProfile.mockResolvedValue({
      id: 'profile-1',
      user_id: mockAuthUser.id,
      username: 'testuser',
      display_name: 'Test User',
      bio: 'Test bio',
      avatar_url: 'https://example.com/avatar.jpg',
      is_private: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    })
  })

  describe('Complete Follow Flow - Public User', () => {
    it('should complete full follow flow for public user', async () => {
      // Setup: User searches for target user
      mockFollowService.searchUsers.mockResolvedValue([mockTargetUser])
      mockFollowService.isFollowing.mockResolvedValue(false)
      mockFollowService.isFollowRequestPending.mockResolvedValue(false)
      
      // Setup: Follow action
      mockFollowService.followUser.mockResolvedValue(undefined)
      mockFollowService.isFollowing.mockResolvedValue(true) // After following
      
      // Setup: Updated following list
      mockFollowService.getUserFollowing.mockResolvedValue([
        {
          following_id: mockTargetUser.user_id,
          following_username: mockTargetUser.username,
          following_display_name: mockTargetUser.display_name,
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      render(
        <TestWrapper>
          <Discover />
        </TestWrapper>
      )

      // Step 1: Search for user
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'targetuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
        expect(screen.getByText('@targetuser')).toBeInTheDocument()
      })

      // Step 2: Follow the user
      const followButton = screen.getByRole('button', { name: /follow/i })
      await user.click(followButton)

      await waitFor(() => {
        expect(mockFollowService.followUser).toHaveBeenCalledWith(mockTargetUser.user_id)
      })

      // Step 3: Verify following tab shows the user
      const followingTab = screen.getByRole('button', { name: /following/i })
      await user.click(followingTab)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
        expect(screen.getByText('@targetuser')).toBeInTheDocument()
      })

      // Step 4: Unfollow the user
      const unfollowButton = screen.getByRole('button', { name: /unfollow/i })
      await user.click(unfollowButton)

      await waitFor(() => {
        expect(mockFollowService.unfollowUser).toHaveBeenCalledWith(mockTargetUser.user_id)
      })
    })
  })

  describe('Complete Follow Flow - Private User', () => {
    it('should complete full follow flow for private user', async () => {
      const privateTargetUser = { ...mockTargetUser, is_private: true }
      
      // Setup: User searches for private target user
      mockFollowService.searchUsers.mockResolvedValue([privateTargetUser])
      mockFollowService.isFollowing.mockResolvedValue(false)
      mockFollowService.isFollowRequestPending.mockResolvedValue(false)
      
      // Setup: Follow request (pending)
      mockFollowService.followUser.mockResolvedValue(undefined)
      mockFollowService.isFollowing.mockResolvedValue(false) // Still not following
      mockFollowService.isFollowRequestPending.mockResolvedValue(true) // Request pending
      
      // Setup: Updated outgoing requests list
      mockFollowService.getOutgoingPendingRequests.mockResolvedValue([
        {
          following_id: privateTargetUser.user_id,
          following_username: privateTargetUser.username,
          following_display_name: privateTargetUser.display_name,
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      render(
        <TestWrapper>
          <Discover />
        </TestWrapper>
      )

      // Step 1: Search for private user
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'targetuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
      })

      // Step 2: Send follow request
      const followButton = screen.getByRole('button', { name: /follow/i })
      await user.click(followButton)

      await waitFor(() => {
        expect(mockFollowService.followUser).toHaveBeenCalledWith(privateTargetUser.user_id)
      })

      // Step 3: Verify pending tab shows the request
      const pendingTab = screen.getByRole('button', { name: /pending/i })
      await user.click(pendingTab)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
        expect(screen.getByText('@targetuser')).toBeInTheDocument()
      })

      // Step 4: Withdraw the request
      const withdrawButton = screen.getByRole('button', { name: /unfollow/i })
      await user.click(withdrawButton)

      await waitFor(() => {
        expect(mockFollowService.withdrawFollowRequest).toHaveBeenCalledWith(privateTargetUser.user_id)
      })
    })
  })

  describe('Profile Privacy Changes', () => {
    it('should update profile privacy and reflect in follow behavior', async () => {
      // Setup: User has a public profile initially
      mockFollowService.getUserProfile.mockResolvedValue({
        id: 'profile-1',
        user_id: mockAuthUser.id,
        username: 'testuser',
        display_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        is_private: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      mockFollowService.updateUserProfile.mockResolvedValue(undefined)

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      })

      // Step 1: Change profile to private
      const privateButton = screen.getByRole('button', { name: /private/i })
      await user.click(privateButton)

      expect(privateButton).toHaveClass('bg-red-100')
      expect(screen.getByText('Private: Users must request to follow you to see your public bookmarks')).toBeInTheDocument()

      // Step 2: Save the changes
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockFollowService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            is_private: true,
          })
        )
      })

      // Step 3: Change back to public
      const publicButton = screen.getByRole('button', { name: /public/i })
      await user.click(publicButton)

      expect(publicButton).toHaveClass('bg-green-100')
      expect(screen.getByText('Public: Anyone can see your profile and public bookmarks')).toBeInTheDocument()

      // Step 4: Save the changes
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockFollowService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            is_private: false,
          })
        )
      })
    })
  })

  describe('Follow Request Management', () => {
    it('should handle incoming follow requests', async () => {
      // Setup: User receives follow requests
      mockFollowService.getPendingFollowRequests.mockResolvedValue([
        {
          follower_id: 'requester-1',
          follower_username: 'requester1',
          follower_display_name: 'Requester One',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          follower_id: 'requester-2',
          follower_username: 'requester2',
          follower_display_name: 'Requester Two',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ])

      mockFollowService.acceptFollowRequest.mockResolvedValue(undefined)
      mockFollowService.rejectFollowRequest.mockResolvedValue(undefined)

      render(
        <TestWrapper>
          <Discover />
        </TestWrapper>
      )

      // Step 1: Navigate to requests tab
      const requestsTab = screen.getByRole('button', { name: /requests/i })
      await user.click(requestsTab)

      await waitFor(() => {
        expect(screen.getByText('Requester One')).toBeInTheDocument()
        expect(screen.getByText('Requester Two')).toBeInTheDocument()
      })

      // Step 2: Accept first request
      const acceptButtons = screen.getAllByRole('button', { name: /check/i })
      await user.click(acceptButtons[0])

      await waitFor(() => {
        expect(mockFollowService.acceptFollowRequest).toHaveBeenCalledWith('requester-1')
      })

      // Step 3: Reject second request
      const rejectButtons = screen.getAllByRole('button', { name: /x/i })
      await user.click(rejectButtons[0])

      await waitFor(() => {
        expect(mockFollowService.rejectFollowRequest).toHaveBeenCalledWith('requester-1')
      })
    })
  })

  describe('Profile Updates and Follow Counts', () => {
    it('should update follower/following counts when relationships change', async () => {
      // Setup: User has some followers and following
      mockFollowService.getUserFollowers.mockResolvedValue([
        { follower_id: 'follower-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
        { follower_id: 'follower-2', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
      ])
      mockFollowService.getUserFollowing.mockResolvedValue([
        { following_id: 'following-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
      ])

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      )

      await waitFor(() => {
        const followersSection = screen.getByText('Followers').closest('div')
        const followingSection = screen.getByText('Following').closest('div')
        expect(followersSection).toHaveTextContent('2')
        expect(followingSection).toHaveTextContent('1')
      })

      // Simulate follower count change
      mockFollowService.getUserFollowers.mockResolvedValue([
        { follower_id: 'follower-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
        { follower_id: 'follower-2', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
        { follower_id: 'follower-3', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
      ])

      // Trigger a reload (simulate save action)
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        const followersSection = screen.getByText('Followers').closest('div')
        expect(followersSection).toHaveTextContent('3')
      })
    })
  })

  describe('Search and Follow Integration', () => {
    it('should maintain follow status across search results', async () => {
      const followedUser = { ...mockTargetUser, followStatus: 'following' as const }
      const pendingUser = { ...mockTargetUser, user_id: 'pending-user-id', username: 'pendinguser', followStatus: 'pending' as const }
      const newUser = { ...mockTargetUser, user_id: 'new-user-id', username: 'newuser', followStatus: 'none' as const }

      // Setup: Search returns multiple users with different follow statuses
      mockFollowService.searchUsers.mockResolvedValue([followedUser, pendingUser, newUser])
      mockFollowService.isFollowing.mockResolvedValue(true) // For followed user
      mockFollowService.isFollowRequestPending.mockResolvedValue(true) // For pending user

      render(
        <TestWrapper>
          <Discover />
        </TestWrapper>
      )

      // Search for users
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'user')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
        expect(screen.getByText('@targetuser')).toBeInTheDocument()
      })

      // Verify different follow buttons are shown
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument() // For followed user
        expect(screen.getByRole('button', { name: /withdraw request/i })).toBeInTheDocument() // For pending user
        expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument() // For new user
      })
    })
  })

  describe('Error Recovery', () => {
    it('should handle network errors and allow retry', async () => {
      // Setup: Initial search fails
      mockFollowService.searchUsers.mockRejectedValueOnce(new Error('Network error'))
      mockFollowService.searchUsers.mockResolvedValueOnce([mockTargetUser])

      render(
        <TestWrapper>
          <Discover />
        </TestWrapper>
      )

      // Step 1: Search fails
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'targetuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockFollowService.searchUsers).toHaveBeenCalledWith('targetuser')
      })

      // Step 2: Retry search (should succeed)
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
      })
    })

    it('should handle follow action errors gracefully', async () => {
      // Setup: Search succeeds but follow fails
      mockFollowService.searchUsers.mockResolvedValue([mockTargetUser])
      mockFollowService.isFollowing.mockResolvedValue(false)
      mockFollowService.isFollowRequestPending.mockResolvedValue(false)
      mockFollowService.followUser.mockRejectedValueOnce(new Error('Follow failed'))
      mockFollowService.followUser.mockResolvedValueOnce(undefined)

      render(
        <TestWrapper>
          <Discover />
        </TestWrapper>
      )

      // Search for user
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'targetuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Target User')).toBeInTheDocument()
      })

      // Step 1: Follow fails
      const followButton = screen.getByRole('button', { name: /follow/i })
      await user.click(followButton)

      await waitFor(() => {
        expect(mockFollowService.followUser).toHaveBeenCalledWith(mockTargetUser.user_id)
      })

      // Step 2: Retry follow (should succeed)
      await user.click(followButton)

      await waitFor(() => {
        expect(mockFollowService.followUser).toHaveBeenCalledTimes(2)
      })
    })
  })
}) 