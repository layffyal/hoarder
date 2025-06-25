# 🧠 Hoarder - AI-Powered Social Bookmarking Platform

An AI-powered platform that lets users save, search, and organize bookmarks or links across multiple social media platforms (Twitter, LinkedIn, Reddit, TikTok). It enables fast retrieval using natural language and topic-based organization.

## 🚀 Features

- **User Authentication**: Email/password and Google OAuth login
- **Cross-Platform Bookmarking**: Save content from Twitter, LinkedIn, Reddit, TikTok, and web
- **AI-Powered Tagging**: Automatic categorization of saved content
- **Natural Language Search**: Find bookmarks using conversational queries
- **Multiple Views**: Browse by platform, category, or unified feed
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live bookmark management

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hoarder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   Create a new Supabase project and run the following SQL to create the bookmarks table:
   
   ```sql
   -- Create bookmarks table
   CREATE TABLE bookmarks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     url TEXT NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     image_url TEXT,
     platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'reddit', 'tiktok', 'web')),
     tags TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow users to only see their own bookmarks
   CREATE POLICY "Users can view own bookmarks" ON bookmarks
     FOR SELECT USING (auth.uid() = user_id);

   -- Create policy to allow users to insert their own bookmarks
   CREATE POLICY "Users can insert own bookmarks" ON bookmarks
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Create policy to allow users to update their own bookmarks
   CREATE POLICY "Users can update own bookmarks" ON bookmarks
     FOR UPDATE USING (auth.uid() = user_id);

   -- Create policy to allow users to delete their own bookmarks
   CREATE POLICY "Users can delete own bookmarks" ON bookmarks
     FOR DELETE USING (auth.uid() = user_id);

   -- Create index for better performance
   CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
   CREATE INDEX idx_bookmarks_platform ON bookmarks(platform);
   CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BookmarkCard.tsx # Individual bookmark display
│   ├── Layout.tsx       # Main app layout with navigation
│   └── PrivateRoute.tsx # Authentication wrapper
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── lib/                 # Utility libraries
│   └── supabase.ts      # Supabase client configuration
├── pages/               # Page components
│   ├── Home.tsx         # Main feed page
│   ├── Login.tsx        # Authentication page
│   ├── SignUp.tsx       # Registration page
│   ├── Categories.tsx   # Category view
│   ├── PlatformView.tsx # Platform-specific view
│   └── Settings.tsx     # User settings
├── App.tsx              # Main app component
├── main.tsx             # App entry point
└── index.css            # Global styles
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update routing in `App.tsx`
2. **New Components**: Add to `src/components/` for reusable UI elements
3. **Database Changes**: Update the Supabase schema and types in `src/lib/supabase.ts`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any static hosting platform that supports Vite builds.

## 🔮 Future Enhancements

- [ ] Browser extension for one-click bookmarking
- [ ] WhatsApp bot integration
- [ ] AI-powered content summarization
- [ ] Social sharing features
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Advanced search filters
- [ ] Bookmark collections/folders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

### 🔗 Embedded Content Preview
- **Click to Expand**: Click any bookmark to expand and view embedded content
- **Platform-Specific Previews**: Enhanced previews for different platforms:
  - **YouTube/Vimeo**: Direct video embeds with player controls
  - **Twitter/X**: Social media post previews with engagement metrics
  - **LinkedIn**: Professional content previews
  - **Reddit**: Community discussion previews
  - **GitHub**: Repository information and stats
  - **TikTok**: Video previews with social features
  - **Web Content**: Rich previews with thumbnails and descriptions
- **Fullscreen Mode**: Toggle fullscreen view for immersive content viewing
- **Keyboard Shortcuts**: Press `Esc` to exit fullscreen mode

### 📱 Multi-Platform Support
- **Browser Extension**: Save bookmarks directly from your browser
- **WhatsApp Integration**: Send links via WhatsApp to automatically save
- **Web Dashboard**: Beautiful web interface for managing your bookmarks

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Choose your preferred theme
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Accessibility**: Built with accessibility best practices

## 🆘 Support

- 📧 Email: support@hoarder.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/hoarder/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/hoarder/wiki)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and insights
- [ ] Collaborative bookmarking
- [ ] AI-powered content recommendations
- [ ] Export/import functionality
- [ ] Advanced search filters
- [ ] Bookmark collections and folders
- [ ] Integration with more platforms 