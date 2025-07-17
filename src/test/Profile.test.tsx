import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Profile from '../pages/Profile'
import { FollowService } from '../lib/followService'
import { useAuth } from '../contexts/AuthContext'

// Mock the FollowService
vi.mock('../lib/followService', () => ({
  FollowService: {
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    getUserFollowers: vi.fn(),
    getUserFollowing: vi.fn(),
  },
}))

// Mock the AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Import the mock after vi.mock calls
import { mockFollowService } from './__mocks__/followService'

describe('Profile Page', () => {
  const user = userEvent.setup()
  const mockAuthUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
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
    vi.mocked(FollowService.getUserProfile).mockResolvedValue({
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
    vi.mocked(FollowService.getUserFollowers).mockResolvedValue([
      { follower_id: 'follower-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
      { follower_id: 'follower-2', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
    ])
    vi.mocked(FollowService.getUserFollowing).mockResolvedValue([
      { following_id: 'following-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
    ])
  })

  describe('Profile Loading', () => {
    it('should show loading state initially', () => {
      render(<Profile />)
      
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('should load profile data on mount', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(FollowService.getUserProfile).toHaveBeenCalledWith(mockAuthUser.id)
        expect(FollowService.getUserFollowers).toHaveBeenCalled()
        expect(FollowService.getUserFollowing).toHaveBeenCalled()
      })
    })

    it('should display profile information correctly', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument()
        expect(screen.getByDisplayValue('https://example.com/avatar.jpg')).toBeInTheDocument()
      })
    })

    it('should display follower and following counts', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // followers count
        expect(screen.getByText('1')).toBeInTheDocument() // following count
      })
    })
  })

  describe('Profile Form Inputs', () => {
    it('should update username when typed', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      })

      const usernameInput = screen.getByDisplayValue('testuser')
      await user.clear(usernameInput)
      await user.type(usernameInput, 'newusername')

      expect(usernameInput).toHaveValue('newusername')
    })

    it('should update display name when typed', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      })

      const displayNameInput = screen.getByDisplayValue('Test User')
      await user.clear(displayNameInput)
      await user.type(displayNameInput, 'New Display Name')

      expect(displayNameInput).toHaveValue('New Display Name')
    })

    it('should update bio when typed', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument()
      })

      const bioInput = screen.getByDisplayValue('Test bio')
      await user.clear(bioInput)
      await user.type(bioInput, 'New bio content')

      expect(bioInput).toHaveValue('New bio content')
    })

    it('should update avatar URL when typed', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/avatar.jpg')).toBeInTheDocument()
      })

      const avatarInput = screen.getByDisplayValue('https://example.com/avatar.jpg')
      await user.clear(avatarInput)
      await user.type(avatarInput, 'https://example.com/new-avatar.jpg')

      expect(avatarInput).toHaveValue('https://example.com/new-avatar.jpg')
    })
  })

  describe('Privacy Settings', () => {
    it('should show public privacy setting by default', async () => {
      render(<Profile />)

      await waitFor(() => {
        const publicButton = screen.getByRole('button', { name: /public/i })
        expect(publicButton).toHaveClass('bg-green-100')
      })
    })

    it('should show private privacy setting when profile is private', async () => {
      vi.mocked(FollowService.getUserProfile).mockResolvedValue({
        id: 'profile-1',
        user_id: mockAuthUser.id,
        username: 'testuser',
        display_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        is_private: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<Profile />)

      await waitFor(() => {
        const privateButton = screen.getByRole('button', { name: /private/i })
        expect(privateButton).toHaveClass('bg-red-100')
      })
    })

    it('should switch to private when private button is clicked', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /public/i })).toBeInTheDocument()
      })

      const privateButton = screen.getByRole('button', { name: /private/i })
      await user.click(privateButton)

      expect(privateButton).toHaveClass('bg-red-100')
      expect(screen.getByText('Private: Users must request to follow you to see your public bookmarks')).toBeInTheDocument()
    })

    it('should switch to public when public button is clicked', async () => {
      mockFollowService.getUserProfile.mockResolvedValue({
        id: 'profile-1',
        user_id: mockAuthUser.id,
        username: 'testuser',
        display_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        is_private: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /private/i })).toBeInTheDocument()
      })

      const publicButton = screen.getByRole('button', { name: /public/i })
      await user.click(publicButton)

      expect(publicButton).toHaveClass('bg-green-100')
      expect(screen.getByText('Public: Anyone can see your profile and public bookmarks')).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('should save profile changes successfully', async () => {
      vi.mocked(FollowService.updateUserProfile).mockResolvedValue(undefined)

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      })

      const usernameInput = screen.getByDisplayValue('testuser')
      await user.clear(usernameInput)
      await user.type(usernameInput, 'newusername')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(FollowService.updateUserProfile).toHaveBeenCalledWith({
          id: 'profile-1',
          user_id: mockAuthUser.id,
          username: 'newusername',
          display_name: 'Test User',
          bio: 'Test bio',
          avatar_url: 'https://example.com/avatar.jpg',
          is_private: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        })
      })
    })

    it('should show loading state during save', async () => {
      vi.mocked(FollowService.updateUserProfile).mockImplementation(() => new Promise<void>(resolve => setTimeout(() => resolve(), 100)))

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(saveButton).toBeDisabled()
    })

    it('should reload profile data after successful save', async () => {
      vi.mocked(FollowService.updateUserProfile).mockResolvedValue(undefined)

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        // Should call getUserProfile again after successful save
        expect(FollowService.getUserProfile).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle save errors gracefully', async () => {
      vi.mocked(FollowService.updateUserProfile).mockRejectedValue(new Error('Save failed'))

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(FollowService.updateUserProfile).toHaveBeenCalled()
      })
    })
  })

  describe('Profile Stats', () => {
    it('should display correct follower count', async () => {
      vi.mocked(FollowService.getUserFollowers).mockResolvedValue([
        { follower_id: 'follower-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
        { follower_id: 'follower-2', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
        { follower_id: 'follower-3', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
      ])

      render(<Profile />)

      await waitFor(() => {
        const followersLabel = screen.getByText('Followers')
        const count = followersLabel.parentElement?.nextElementSibling
        expect(count).toHaveTextContent('3')
      })
    })

    it('should display correct following count', async () => {
      vi.mocked(FollowService.getUserFollowing).mockResolvedValue([
        { following_id: 'following-1', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
        { following_id: 'following-2', status: 'accepted', created_at: '2024-01-01T00:00:00Z' },
      ])

      render(<Profile />)

      await waitFor(() => {
        const followingLabel = screen.getByText('Following')
        const count = followingLabel.parentElement?.nextElementSibling
        expect(count).toHaveTextContent('2')
      })
    })

    it('should display zero counts when no followers/following', async () => {
      vi.mocked(FollowService.getUserFollowers).mockResolvedValue([])
      vi.mocked(FollowService.getUserFollowing).mockResolvedValue([])

      render(<Profile />)

      await waitFor(() => {
        const followersLabel = screen.getByText('Followers')
        const followersCount = followersLabel.parentElement?.nextElementSibling
        const followingLabel = screen.getByText('Following')
        const followingCount = followingLabel.parentElement?.nextElementSibling
        expect(followersCount).toHaveTextContent('0')
        expect(followingCount).toHaveTextContent('0')
      })
    })
  })

  describe('Privacy Tips', () => {
    it('should display privacy tips section', async () => {
      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByText('Privacy Tips')).toBeInTheDocument()
        expect(screen.getByText('• Public profiles are visible to everyone')).toBeInTheDocument()
        expect(screen.getByText('• Private profiles require follow approval')).toBeInTheDocument()
        expect(screen.getByText('• You can make individual bookmarks private')).toBeInTheDocument()
        expect(screen.getByText('• Only public bookmarks appear in feeds')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle profile loading errors gracefully', async () => {
      vi.mocked(FollowService.getUserProfile).mockRejectedValue(new Error('Profile load failed'))

      render(<Profile />)

      await waitFor(() => {
        expect(FollowService.getUserProfile).toHaveBeenCalledWith(mockAuthUser.id)
      })
    })

    it('should handle followers loading errors gracefully', async () => {
      vi.mocked(FollowService.getUserFollowers).mockRejectedValue(new Error('Followers load failed'))

      render(<Profile />)

      await waitFor(() => {
        expect(FollowService.getUserFollowers).toHaveBeenCalled()
      })
    })

    it('should handle following loading errors gracefully', async () => {
      vi.mocked(FollowService.getUserFollowing).mockRejectedValue(new Error('Following load failed'))

      render(<Profile />)

      await waitFor(() => {
        expect(FollowService.getUserFollowing).toHaveBeenCalled()
      })
    })
  })

  describe('Form Validation', () => {
    it('should handle empty profile data gracefully', async () => {
      vi.mocked(FollowService.getUserProfile).mockResolvedValue(null)

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter display name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('https://example.com/avatar.jpg')).toBeInTheDocument()
      })
    })

    it('should handle partial profile data', async () => {
      vi.mocked(FollowService.getUserProfile).mockResolvedValue({
        id: 'profile-1',
        user_id: mockAuthUser.id,
        username: 'testuser',
        display_name: undefined,
        bio: undefined,
        avatar_url: undefined,
        is_private: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })

      render(<Profile />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter display name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('https://example.com/avatar.jpg')).toBeInTheDocument()
      })
    })
  })
}) 