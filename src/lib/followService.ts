import { supabase } from './supabase'
import { UserProfile, Follower, Following, FeedBookmark } from './supabase'

export class FollowService {
  // Get user's feed (bookmarks from followed users)
  static async getUserFeed(): Promise<FeedBookmark[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('get_user_feed', {
      user_uuid: user.id
    })

    if (error) throw error
    return data || []
  }

  // Get user's followers
  static async getUserFollowers(): Promise<Follower[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('get_user_followers', {
      user_uuid: user.id
    })

    if (error) throw error
    return data || []
  }

  // Get user's following
  static async getUserFollowing(): Promise<Following[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('get_user_following', {
      user_uuid: user.id
    })

    if (error) throw error
    return data || []
  }

  // Search for users by username or display name
  static async searchUsers(query: string): Promise<UserProfile[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('user_id', user.id)
      .limit(10)

    if (error) throw error
    return data || []
  }

  // Follow a user
  static async followUser(targetUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single()

    if (existingFollow) {
      throw new Error('Already following this user')
    }

    // Check if target user is private or public
    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('is_private')
      .eq('user_id', targetUserId)
      .single()

    // If user doesn't have a profile, default to public (is_private = false)
    const isPrivate = targetProfile?.is_private ?? false

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
        status: isPrivate ? 'pending' : 'accepted'
      })

    if (error) throw error
  }

  // Accept follow request
  static async acceptFollowRequest(followerId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('follows')
      .update({ status: 'accepted' })
      .eq('follower_id', followerId)
      .eq('following_id', user.id)
      .eq('status', 'pending')

    if (error) throw error
  }

  // Reject follow request
  static async rejectFollowRequest(followerId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('follows')
      .update({ status: 'rejected' })
      .eq('follower_id', followerId)
      .eq('following_id', user.id)
      .eq('status', 'pending')

    if (error) throw error
  }

  // Unfollow a user
  static async unfollowUser(targetUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)

    if (error) throw error
  }

  // Withdraw a follow request (for pending requests to private users)
  static async withdrawFollowRequest(targetUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .eq('status', 'pending')

    if (error) throw error
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  // Update user profile
  static async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Only send updatable fields
    const updatableFields = ['username', 'display_name', 'bio', 'avatar_url', 'is_private']
    const update: any = { user_id: user.id }
    for (const key of updatableFields) {
      if (profile[key as keyof UserProfile] !== undefined) {
        update[key] = profile[key as keyof UserProfile]
      }
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(update, { onConflict: 'user_id' })

    if (error) throw error
  }

  // Check if following a user
  static async isFollowing(targetUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single()

    return data?.status === 'accepted'
  }

  // Check if follow request is pending
  static async isFollowRequestPending(targetUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single()

    return data?.status === 'pending'
  }

  // Get pending follow requests
  static async getPendingFollowRequests(): Promise<Follower[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        created_at,
        user_profiles!follows_follower_id_fkey (
          username,
          display_name
        )
      `)
      .eq('following_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: any) => ({
      follower_id: item.follower_id,
      follower_username: item.user_profiles?.username,
      follower_display_name: item.user_profiles?.display_name,
      status: 'pending',
      created_at: item.created_at
    }))
  }

  // Get outgoing pending follow requests
  static async getOutgoingPendingRequests(): Promise<Following[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        created_at,
        user_profiles!follows_following_id_fkey (
          username,
          display_name
        )
      `)
      .eq('follower_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: any) => ({
      following_id: item.following_id,
      following_username: item.user_profiles?.username,
      following_display_name: item.user_profiles?.display_name,
      status: 'pending',
      created_at: item.created_at
    }))
  }
} 