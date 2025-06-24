import { supabase } from './supabase'

const sampleBookmarks = [
  {
    url: 'https://twitter.com/elonmusk/status/123456789',
    title: 'Amazing AI breakthrough in autonomous vehicles',
    description: 'Tesla just achieved a major milestone in self-driving technology with improved neural networks.',
    image_url: 'https://picsum.photos/400/200?random=1',
    platform: 'twitter' as const,
    tags: ['AI', 'Tesla', 'autonomous vehicles', 'technology']
  },
  {
    url: 'https://www.linkedin.com/posts/startup-founder_innovation-growth-activity-123456789',
    title: '10 Growth Hacking Strategies That Actually Work',
    description: 'After scaling our startup to 1M users, here are the strategies that made the biggest impact.',
    image_url: 'https://picsum.photos/400/200?random=2',
    platform: 'linkedin' as const,
    tags: ['startup', 'growth hacking', 'marketing', 'business']
  },
  {
    url: 'https://www.reddit.com/r/technology/comments/123456/ai_breakthrough',
    title: 'New AI model can predict protein folding with 99% accuracy',
    description: 'This breakthrough could revolutionize drug discovery and biotechnology.',
    image_url: 'https://picsum.photos/400/200?random=3',
    platform: 'reddit' as const,
    tags: ['AI', 'biotechnology', 'science', 'research']
  },
  {
    url: 'https://www.tiktok.com/@techinfluencer/video/123456789',
    title: '5 Programming Languages to Learn in 2024',
    description: 'Quick overview of the most in-demand programming languages and why you should learn them.',
    image_url: 'https://picsum.photos/400/200?random=4',
    platform: 'tiktok' as const,
    tags: ['programming', 'coding', 'career', 'education']
  },
  {
    url: 'https://medium.com/@designer/ux-design-principles',
    title: 'The 10 UX Design Principles Every Designer Should Know',
    description: 'A comprehensive guide to creating user-centered designs that convert.',
    image_url: 'https://picsum.photos/400/200?random=5',
    platform: 'web' as const,
    tags: ['UX', 'design', 'user experience', 'product design']
  },
  {
    url: 'https://twitter.com/techblogger/status/987654321',
    title: 'Why React 18 is a Game Changer for Web Development',
    description: 'Deep dive into the new features and performance improvements in React 18.',
    image_url: 'https://picsum.photos/400/200?random=6',
    platform: 'twitter' as const,
    tags: ['React', 'web development', 'JavaScript', 'frontend']
  },
  {
    url: 'https://www.linkedin.com/posts/venture-capitalist_investment-startup-funding-activity-987654321',
    title: 'The Future of Venture Capital in 2024',
    description: 'Trends and predictions for the VC landscape in the coming year.',
    image_url: 'https://picsum.photos/400/200?random=7',
    platform: 'linkedin' as const,
    tags: ['venture capital', 'investment', 'startup', 'finance']
  },
  {
    url: 'https://www.reddit.com/r/webdev/comments/987654/react_vs_vue',
    title: 'React vs Vue: Which Framework Should You Choose?',
    description: 'Detailed comparison of React and Vue.js for modern web development.',
    image_url: 'https://picsum.photos/400/200?random=8',
    platform: 'reddit' as const,
    tags: ['React', 'Vue', 'web development', 'frameworks']
  }
]

export async function seedDatabase(userId: string) {
  try {
    const bookmarksWithUserId = sampleBookmarks.map(bookmark => ({
      ...bookmark,
      user_id: userId
    }))

    const { data, error } = await supabase
      .from('bookmarks')
      .insert(bookmarksWithUserId)

    if (error) {
      console.error('Error seeding database:', error)
      throw error
    }

    console.log('Database seeded successfully!')
    return data
  } catch (error) {
    console.error('Failed to seed database:', error)
    throw error
  }
} 