import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Discover from '../pages/Discover'
import { FollowService } from '../lib/followService'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock the FollowService with factory function
vi.mock('../lib/followService', () => ({
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
    withdrawFollowRequest: vi.fn(),
    acceptFollowRequest: vi.fn(),
    rejectFollowRequest: vi.fn(),
  },
}))

describe('Discover Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementations
    vi.mocked(FollowService.getUserFollowers).mockResolvedValue([])
    vi.mocked(FollowService.getUserFollowing).mockResolvedValue([])
    vi.mocked(FollowService.getPendingFollowRequests).mockResolvedValue([])
    vi.mocked(FollowService.getOutgoingPendingRequests).mockResolvedValue([])
    vi.mocked(FollowService.searchUsers).mockResolvedValue([])
    vi.mocked(FollowService.isFollowing).mockResolvedValue(false)
    vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(false)
  })

  describe('Search Functionality', () => {
    it('should render search input and button', () => {
      render(<Discover />)
      
      expect(screen.getByPlaceholderText('Search by username or display name...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    it('should search users when search button is clicked', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          user_id: 'user-1',
          username: 'testuser1',
          display_name: 'Test User 1',
          bio: 'Test bio 1',
          avatar_url: 'https://example.com/avatar1.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          followStatus: 'none' as const,
        },
      ]

      vi.mocked(FollowService.searchUsers).mockResolvedValue(mockUsers)
      vi.mocked(FollowService.isFollowing).mockResolvedValue(false)
      vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(false)

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(FollowService.searchUsers).toHaveBeenCalledWith('testuser')
      })

      await waitFor(() => {
        expect(screen.getByText('Test User 1')).toBeInTheDocument()
        expect(screen.getByText('@testuser1')).toBeInTheDocument()
        expect(screen.getByText('Test bio 1')).toBeInTheDocument()
      })
    })

    it('should search users when Enter key is pressed', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          user_id: 'user-1',
          username: 'testuser1',
          display_name: 'Test User 1',
          bio: 'Test bio 1',
          avatar_url: 'https://example.com/avatar1.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          followStatus: 'none' as const,
        },
      ]

      vi.mocked(FollowService.searchUsers).mockResolvedValue(mockUsers)
      vi.mocked(FollowService.isFollowing).mockResolvedValue(false)
      vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(false)

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      await user.type(searchInput, 'testuser')
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 })

      await waitFor(() => {
        expect(FollowService.searchUsers).toHaveBeenCalledWith('testuser')
      })
    })

    it('should not search when query is empty', async () => {
      render(<Discover />)
      
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.click(searchButton)

      expect(FollowService.searchUsers).not.toHaveBeenCalled()
    })

    it('should show loading state during search', async () => {
      vi.mocked(FollowService.searchUsers).mockImplementation(() => new Promise<any[]>(resolve => setTimeout(() => resolve([]), 100)))

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
    })

    it('should show "No users found" when search returns empty results', async () => {
      vi.mocked(FollowService.searchUsers).mockResolvedValue([])

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'nonexistent')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument()
      })
    })
  })

  describe('Follow Functionality', () => {
    it('should show Follow button for users not being followed', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          user_id: 'user-1',
          username: 'testuser1',
          display_name: 'Test User 1',
          bio: 'Test bio 1',
          avatar_url: 'https://example.com/avatar1.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          followStatus: 'none' as const,
        },
      ]

      vi.mocked(FollowService.searchUsers).mockResolvedValue(mockUsers)
      vi.mocked(FollowService.isFollowing).mockResolvedValue(false)
      vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(false)
      vi.mocked(FollowService.followUser).mockResolvedValue(undefined)

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      await waitFor(() => {
        // There may be multiple 'Follow' buttons (tab and action), so pick the one inside the user card
        const followButtons = screen.getAllByRole('button', { name: /follow/i })
        // The action button should have class 'btn-primary' and 'btn-sm'
        const actionButton = followButtons.find(btn => btn.className.includes('btn-primary') && btn.className.includes('btn-sm'))
        expect(actionButton).toBeInTheDocument()
      })

      const followButtons = screen.getAllByRole('button', { name: /follow/i })
      const actionButton = followButtons.find(btn => btn.className.includes('btn-primary') && btn.className.includes('btn-sm'))
      await user.click(actionButton!)

      await waitFor(() => {
        expect(FollowService.followUser).toHaveBeenCalledWith('user-1')
      })
    })

    it('should show Unfollow button for users being followed', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          user_id: 'user-1',
          username: 'testuser1',
          display_name: 'Test User 1',
          bio: 'Test bio 1',
          avatar_url: 'https://example.com/avatar1.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          followStatus: 'following' as const,
        },
      ]

      vi.mocked(FollowService.searchUsers).mockResolvedValue(mockUsers)
      vi.mocked(FollowService.isFollowing).mockResolvedValue(true)
      vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(false)
      vi.mocked(FollowService.unfollowUser).mockResolvedValue(undefined)

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument()
      })

      const unfollowButton = screen.getByRole('button', { name: /unfollow/i })
      await user.click(unfollowButton)

      await waitFor(() => {
        expect(FollowService.unfollowUser).toHaveBeenCalledWith('user-1')
      })
    })

    it('should show Withdraw Request button for pending follow requests', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          user_id: 'user-1',
          username: 'testuser1',
          display_name: 'Test User 1',
          bio: 'Test bio 1',
          avatar_url: 'https://example.com/avatar1.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          followStatus: 'pending' as const,
        },
      ]

      vi.mocked(FollowService.searchUsers).mockResolvedValue(mockUsers)
      vi.mocked(FollowService.isFollowing).mockResolvedValue(false)
      vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(true)
      vi.mocked(FollowService.withdrawFollowRequest).mockResolvedValue(undefined)

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /withdraw request/i })).toBeInTheDocument()
      })

      const withdrawButton = screen.getByRole('button', { name: /withdraw request/i })
      await user.click(withdrawButton)

      await waitFor(() => {
        expect(FollowService.withdrawFollowRequest).toHaveBeenCalledWith('user-1')
      })
    })
  })

  describe('Followers Tab', () => {
    it('should display followers list', async () => {
      const mockFollowers = [
        {
          follower_id: 'follower-1',
          follower_username: 'follower1',
          follower_display_name: 'Follower One',
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          follower_id: 'follower-2',
          follower_username: 'follower2',
          follower_display_name: 'Follower Two',
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(FollowService.getUserFollowers).mockResolvedValue(mockFollowers)

      render(<Discover />)

      const followersTab = screen.getByRole('button', { name: /followers/i })
      await user.click(followersTab)

      await waitFor(() => {
        expect(screen.getByText('Follower One')).toBeInTheDocument()
        expect(screen.getByText('@follower1')).toBeInTheDocument()
        expect(screen.getByText('Follower Two')).toBeInTheDocument()
        expect(screen.getByText('@follower2')).toBeInTheDocument()
      })
    })

    it('should show empty state when no followers', async () => {
      vi.mocked(FollowService.getUserFollowers).mockResolvedValue([])

      render(<Discover />)

      const followersTab = screen.getByRole('button', { name: /followers/i })
      await user.click(followersTab)

      await waitFor(() => {
        expect(screen.getByText('No followers yet')).toBeInTheDocument()
      })
    })
  })

  describe('Following Tab', () => {
    it('should display following list', async () => {
      const mockFollowing = [
        {
          following_id: 'following-1',
          following_username: 'following1',
          following_display_name: 'Following One',
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          following_id: 'following-2',
          following_username: 'following2',
          following_display_name: 'Following Two',
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(FollowService.getUserFollowing).mockResolvedValue(mockFollowing)
      vi.mocked(FollowService.unfollowUser).mockResolvedValue(undefined)

      render(<Discover />)

      const followingTab = screen.getByRole('button', { name: /following/i })
      await user.click(followingTab)

      await waitFor(() => {
        expect(screen.getByText('Following One')).toBeInTheDocument()
        expect(screen.getByText('@following1')).toBeInTheDocument()
        expect(screen.getByText('Following Two')).toBeInTheDocument()
        expect(screen.getByText('@following2')).toBeInTheDocument()
      })

      // Test unfollow functionality
      const unfollowButtons = screen.getAllByRole('button', { name: /unfollow/i })
      await user.click(unfollowButtons[0])

      await waitFor(() => {
        expect(FollowService.unfollowUser).toHaveBeenCalledWith('following-1')
      })
    })

    it('should show empty state when not following anyone', async () => {
      vi.mocked(FollowService.getUserFollowing).mockResolvedValue([])

      render(<Discover />)

      const followingTab = screen.getByRole('button', { name: /following/i })
      await user.click(followingTab)

      await waitFor(() => {
        expect(screen.getByText('Not following anyone yet')).toBeInTheDocument()
      })
    })
  })

  describe('Requests Tab', () => {
    it('should display pending follow requests', async () => {
      const mockPendingRequests = [
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
      ]

      vi.mocked(FollowService.getPendingFollowRequests).mockResolvedValue(mockPendingRequests)
      vi.mocked(FollowService.acceptFollowRequest).mockResolvedValue(undefined)
      vi.mocked(FollowService.rejectFollowRequest).mockResolvedValue(undefined)

      render(<Discover />)

      const requestsTab = screen.getByRole('button', { name: /requests/i })
      await user.click(requestsTab)

      await waitFor(() => {
        expect(screen.getByText('Requester One')).toBeInTheDocument()
        expect(screen.getByText('@requester1')).toBeInTheDocument()
        expect(screen.getByText('Requester Two')).toBeInTheDocument()
        expect(screen.getByText('@requester2')).toBeInTheDocument()
      })

      // Test accept functionality
      const acceptButtons = screen.getAllByRole('button', { name: /accept follow request/i })
      await user.click(acceptButtons[0])

      await waitFor(() => {
        expect(FollowService.acceptFollowRequest).toHaveBeenCalledWith('requester-1')
      })

      // Test reject functionality
      const rejectButtons = screen.getAllByRole('button', { name: /reject follow request/i })
      await user.click(rejectButtons[0])

      await waitFor(() => {
        expect(FollowService.rejectFollowRequest).toHaveBeenCalledWith('requester-1')
      })
    })

    it('should show empty state when no pending requests', async () => {
      vi.mocked(FollowService.getPendingFollowRequests).mockResolvedValue([])

      render(<Discover />)

      const requestsTab = screen.getByRole('button', { name: /requests/i })
      await user.click(requestsTab)

      await waitFor(() => {
        expect(screen.getByText('No pending follow requests')).toBeInTheDocument()
      })
    })
  })

  describe('Pending Tab', () => {
    it('should display outgoing pending requests', async () => {
      const mockOutgoingRequests = [
        {
          following_id: 'target-1',
          following_username: 'target1',
          following_display_name: 'Target One',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          following_id: 'target-2',
          following_username: 'target2',
          following_display_name: 'Target Two',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      vi.mocked(FollowService.getOutgoingPendingRequests).mockResolvedValue(mockOutgoingRequests)
      vi.mocked(FollowService.withdrawFollowRequest).mockResolvedValue(undefined)

      render(<Discover />)

      const pendingTab = screen.getByRole('button', { name: /pending/i })
      await user.click(pendingTab)

      await waitFor(() => {
        expect(screen.getByText('Target One')).toBeInTheDocument()
        expect(screen.getByText('@target1')).toBeInTheDocument()
        expect(screen.getByText('Target Two')).toBeInTheDocument()
        expect(screen.getByText('@target2')).toBeInTheDocument()
      })

      // Test withdraw functionality
      const withdrawButtons = screen.getAllByRole('button', { name: /withdraw request/i })
      await user.click(withdrawButtons[0])

      await waitFor(() => {
        expect(FollowService.withdrawFollowRequest).toHaveBeenCalledWith('target-1')
      })
    })

    it('should show empty state when no outgoing requests', async () => {
      vi.mocked(FollowService.getOutgoingPendingRequests).mockResolvedValue([])

      render(<Discover />)

      const pendingTab = screen.getByRole('button', { name: /pending/i })
      await user.click(pendingTab)

      await waitFor(() => {
        expect(screen.getByText('No outgoing follow requests')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      render(<Discover />)

      // Initially on discover tab
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()

      // Switch to followers tab
      const followersTab = screen.getByRole('button', { name: /followers/i })
      await user.click(followersTab)
      expect(screen.queryByRole('button', { name: /search/i })).not.toBeInTheDocument()

      // Switch to following tab
      const followingTab = screen.getByRole('button', { name: /following/i })
      await user.click(followingTab)
      expect(screen.queryByRole('button', { name: /search/i })).not.toBeInTheDocument()

      // Switch back to discover tab
      const discoverTab = screen.getByRole('button', { name: /discover/i })
      await user.click(discoverTab)
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle search errors gracefully', async () => {
      vi.mocked(FollowService.searchUsers).mockRejectedValue(new Error('Search failed'))
      // Use the shared mock
      const toastSpy = require('react-hot-toast').toast.error

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      await waitFor(() => {
        expect(toastSpy).toHaveBeenCalledWith('Failed to search users')
      })
    })

    it('should handle follow errors gracefully', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          user_id: 'user-1',
          username: 'testuser1',
          display_name: 'Test User 1',
          bio: 'Test bio 1',
          avatar_url: 'https://example.com/avatar1.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          followStatus: 'none' as const,
        },
      ]

      vi.mocked(FollowService.searchUsers).mockResolvedValue(mockUsers)
      vi.mocked(FollowService.isFollowing).mockResolvedValue(false)
      vi.mocked(FollowService.isFollowRequestPending).mockResolvedValue(false)
      vi.mocked(FollowService.followUser).mockRejectedValue(new Error('Follow failed'))

      render(<Discover />)
      
      const searchInput = screen.getByPlaceholderText('Search by username or display name...')
      const searchButton = screen.getByRole('button', { name: /search/i })

      await user.type(searchInput, 'testuser')
      await user.click(searchButton)

      await waitFor(() => {
        const followButton = screen.getByText('Follow')
        return expect(followButton).toBeInTheDocument()
      })

      const followButton = screen.getByText('Follow')
      await user.click(followButton)

      await waitFor(() => {
        expect(FollowService.followUser).toHaveBeenCalledWith('user-1')
      })
    })
  })
}) 