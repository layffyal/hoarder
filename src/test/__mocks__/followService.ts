import { vi } from 'vitest'
import type { UserProfile, Follower, Following } from '../../lib/supabase'

export const mockFollowService = {
  getUserFeed: vi.fn(),
  getUserFollowers: vi.fn(),
  getUserFollowing: vi.fn(),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
  acceptFollowRequest: vi.fn(),
  rejectFollowRequest: vi.fn(),
  withdrawFollowRequest: vi.fn(),
  searchUsers: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  isFollowing: vi.fn(),
  isFollowRequestPending: vi.fn(),
  getPendingFollowRequests: vi.fn(),
  getOutgoingPendingRequests: vi.fn(),
}

// Mock data
export const mockUserProfile: UserProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  bio: 'Test bio',
  avatar_url: 'https://example.com/avatar.jpg',
  is_private: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockFollower: Follower = {
  follower_id: 'follower-id',
  follower_username: 'follower',
  follower_display_name: 'Follower User',
  status: 'accepted',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockFollowing: Following = {
  following_id: 'following-id',
  following_username: 'following',
  following_display_name: 'Following User',
  status: 'accepted',
  created_at: '2024-01-01T00:00:00Z',
}

// Setup default mock implementations
mockFollowService.getUserFollowers.mockResolvedValue([mockFollower])
mockFollowService.getUserFollowing.mockResolvedValue([mockFollowing])
mockFollowService.getPendingFollowRequests.mockResolvedValue([])
mockFollowService.getOutgoingPendingRequests.mockResolvedValue([])
mockFollowService.searchUsers.mockResolvedValue([mockUserProfile])
mockFollowService.getUserProfile.mockResolvedValue(mockUserProfile)
mockFollowService.isFollowing.mockResolvedValue(false)
mockFollowService.isFollowRequestPending.mockResolvedValue(false) 