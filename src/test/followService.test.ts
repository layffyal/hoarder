import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FollowService } from '../lib/followService'
import { supabaseMock, supabaseMockChain } from './setup'

// Helper to reset all chain mocks
function resetSupabaseChain() {
  Object.values(supabaseMockChain).forEach(fn => fn.mockReset && fn.mockReset())
  supabaseMock.from.mockImplementation(() => supabaseMockChain)
  supabaseMock.rpc.mockReset && supabaseMock.rpc.mockReset()
}

describe('FollowService', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  }

  const mockTargetUser = {
    id: 'target-user-id',
    email: 'target@example.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetSupabaseChain()
    // Mock authenticated user
    vi.mocked(supabaseMock.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  describe('getUserFeed', () => {
    it('should return user feed successfully', async () => {
      const mockFeed = [
        {
          id: 'bookmark-1',
          user_id: 'target-user-id',
          url: 'https://example.com',
          title: 'Test Bookmark',
          platform: 'web',
          tags: ['test'],
          source: 'web',
          is_public: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          author_username: 'testuser',
          author_display_name: 'Test User',
        },
      ]
      supabaseMock.rpc.mockResolvedValue({ data: mockFeed, error: null })
      const result = await FollowService.getUserFeed()
      expect(supabaseMock.rpc).toHaveBeenCalledWith('get_user_feed', { user_uuid: mockUser.id })
      expect(result).toEqual(mockFeed)
    })
    it('should throw error when user is not authenticated', async () => {
      vi.mocked(supabaseMock.auth.getUser).mockResolvedValue({ data: { user: null }, error: null })
      await expect(FollowService.getUserFeed()).rejects.toThrow('User not authenticated')
    })
  })

  describe('getUserFollowers', () => {
    it('should return user followers successfully', async () => {
      const mockFollowers = [
        {
          follower_id: 'follower-1',
          follower_username: 'follower1',
          follower_display_name: 'Follower One',
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]
      supabaseMock.rpc.mockResolvedValue({ data: mockFollowers, error: null })
      const result = await FollowService.getUserFollowers()
      expect(supabaseMock.rpc).toHaveBeenCalledWith('get_user_followers', { user_uuid: mockUser.id })
      expect(result).toEqual(mockFollowers)
    })
  })

  describe('getUserFollowing', () => {
    it('should return user following successfully', async () => {
      const mockFollowing = [
        {
          following_id: 'following-1',
          following_username: 'following1',
          following_display_name: 'Following One',
          status: 'accepted',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]
      supabaseMock.rpc.mockResolvedValue({ data: mockFollowing, error: null })
      const result = await FollowService.getUserFollowing()
      expect(supabaseMock.rpc).toHaveBeenCalledWith('get_user_following', { user_uuid: mockUser.id })
      expect(result).toEqual(mockFollowing)
    })
  })

  describe('followUser', () => {
    it('should follow a public user successfully', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single
        .mockResolvedValueOnce({ data: null, error: null }) // not following
        .mockResolvedValueOnce({ data: { is_private: false }, error: null }) // public profile
      supabaseMockChain.insert.mockResolvedValue({ error: null })
      await FollowService.followUser(mockTargetUser.id)
      expect(supabaseMockChain.insert).toHaveBeenCalledWith({
        follower_id: mockUser.id,
        following_id: mockTargetUser.id,
        status: 'accepted',
      })
    })
    it('should send follow request to private user', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single
        .mockResolvedValueOnce({ data: null, error: null }) // not following
        .mockResolvedValueOnce({ data: { is_private: true }, error: null }) // private profile
      supabaseMockChain.insert.mockResolvedValue({ error: null })
      await FollowService.followUser(mockTargetUser.id)
      expect(supabaseMockChain.insert).toHaveBeenCalledWith({
        follower_id: mockUser.id,
        following_id: mockTargetUser.id,
        status: 'pending',
      })
    })
    it('should throw error when already following', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single.mockResolvedValue({ data: { id: 'existing-follow' }, error: null })
      await expect(FollowService.followUser(mockTargetUser.id)).rejects.toThrow('Already following this user')
    })
  })

  describe('unfollowUser', () => {
    it('should unfollow user successfully', async () => {
      // Reset and setup the chain for this specific test
      resetSupabaseChain()
      
      // Setup the chain to handle multiple eq calls
      const finalChain = { error: null }
      supabaseMockChain.delete.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq
        .mockReturnValueOnce(supabaseMockChain) // First eq call
        .mockResolvedValueOnce(finalChain) // Second eq call resolves

      await FollowService.unfollowUser(mockTargetUser.id)

      expect(supabaseMockChain.delete).toHaveBeenCalled()
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('follower_id', mockUser.id)
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('following_id', mockTargetUser.id)
    })
  })

  describe('acceptFollowRequest', () => {
    it('should accept follow request successfully', async () => {
      resetSupabaseChain()
      
      const finalChain = { error: null }
      supabaseMockChain.update.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq
        .mockReturnValueOnce(supabaseMockChain) // First eq call
        .mockReturnValueOnce(supabaseMockChain) // Second eq call
        .mockResolvedValueOnce(finalChain) // Third eq call resolves

      await FollowService.acceptFollowRequest('follower-id')

      expect(supabaseMockChain.update).toHaveBeenCalledWith({ status: 'accepted' })
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('follower_id', 'follower-id')
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('following_id', mockUser.id)
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('status', 'pending')
    })
  })

  describe('rejectFollowRequest', () => {
    it('should reject follow request successfully', async () => {
      resetSupabaseChain()
      
      const finalChain = { error: null }
      supabaseMockChain.update.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq
        .mockReturnValueOnce(supabaseMockChain) // First eq call
        .mockReturnValueOnce(supabaseMockChain) // Second eq call
        .mockResolvedValueOnce(finalChain) // Third eq call resolves

      await FollowService.rejectFollowRequest('follower-id')

      expect(supabaseMockChain.update).toHaveBeenCalledWith({ status: 'rejected' })
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('follower_id', 'follower-id')
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('following_id', mockUser.id)
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('status', 'pending')
    })
  })

  describe('withdrawFollowRequest', () => {
    it('should withdraw follow request successfully', async () => {
      resetSupabaseChain()
      
      const finalChain = { error: null }
      supabaseMockChain.delete.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq
        .mockReturnValueOnce(supabaseMockChain) // First eq call
        .mockReturnValueOnce(supabaseMockChain) // Second eq call
        .mockResolvedValueOnce(finalChain) // Third eq call resolves

      await FollowService.withdrawFollowRequest(mockTargetUser.id)

      expect(supabaseMockChain.delete).toHaveBeenCalled()
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('follower_id', mockUser.id)
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('following_id', mockTargetUser.id)
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('status', 'pending')
    })
  })

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
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
        },
      ]

      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.or.mockReturnValue(supabaseMockChain)
      supabaseMockChain.neq.mockReturnValue(supabaseMockChain) // Fix: use neq instead of ne
      supabaseMockChain.limit.mockResolvedValue({ data: mockUsers, error: null })

      const result = await FollowService.searchUsers('test')

      expect(supabaseMockChain.or).toHaveBeenCalledWith('username.ilike.%test%,display_name.ilike.%test%')
      expect(supabaseMockChain.neq).toHaveBeenCalledWith('user_id', mockUser.id) // Fix: use neq
      expect(supabaseMockChain.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(mockUsers)
    })
  })

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const mockProfile = {
        id: 'profile-1',
        user_id: mockUser.id,
        username: 'testuser',
        display_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        is_private: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single.mockResolvedValue({ data: mockProfile, error: null })

      const result = await FollowService.getUserProfile(mockUser.id)

      expect(supabaseMockChain.select).toHaveBeenCalledWith('*')
      expect(supabaseMockChain.eq).toHaveBeenCalledWith('user_id', mockUser.id)
      expect(result).toEqual(mockProfile)
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockProfile = {
        username: 'newusername',
        display_name: 'New Display Name',
        bio: 'New bio',
        is_private: true,
      }

      supabaseMockChain.upsert.mockResolvedValue({ error: null })

      await FollowService.updateUserProfile(mockProfile)

      expect(supabaseMockChain.upsert).toHaveBeenCalledWith(
        {
          user_id: mockUser.id,
          ...mockProfile,
        },
        { onConflict: 'user_id' }
      )
    })
  })

  describe('isFollowing', () => {
    it('should return true when following user', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single.mockResolvedValue({ data: { status: 'accepted' }, error: null })

      const result = await FollowService.isFollowing(mockTargetUser.id)

      expect(result).toBe(true)
    })

    it('should return false when not following user', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single.mockResolvedValue({ data: null, error: null })

      const result = await FollowService.isFollowing(mockTargetUser.id)

      expect(result).toBe(false)
    })
  })

  describe('isFollowRequestPending', () => {
    it('should return true when follow request is pending', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single.mockResolvedValue({ data: { status: 'pending' }, error: null })

      const result = await FollowService.isFollowRequestPending(mockTargetUser.id)

      expect(result).toBe(true)
    })

    it('should return false when no pending request', async () => {
      supabaseMockChain.select.mockReturnValue(supabaseMockChain)
      supabaseMockChain.eq.mockReturnValue(supabaseMockChain)
      supabaseMockChain.single.mockResolvedValue({ data: null, error: null })

      const result = await FollowService.isFollowRequestPending(mockTargetUser.id)

      expect(result).toBe(false)
    })
  })
}) 