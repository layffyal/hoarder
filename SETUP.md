# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

## 1. Install Dependencies
```bash
npm install
```

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Settings → API to get your credentials
3. Copy the `Project URL` and `anon public` key

## 3. Configure Environment Variables

Create a `.env.local` file in the root directory:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script

## 5. Start the Development Server
```bash
npm run dev
```

## 6. Open Your Browser
Navigate to `http://localhost:3000`

## 7. Test the App

1. Sign up for a new account
2. Once logged in, you'll see an empty feed
3. Click "Add Sample Data" to populate with test bookmarks
4. Explore the different views (Home, Categories, Platforms, Settings)

## 🎉 You're Done!

The app should now be fully functional with:
- ✅ User authentication
- ✅ Sample data
- ✅ Search and filtering
- ✅ Platform and category views
- ✅ Responsive design

## Next Steps

- [ ] Add real bookmarks via the "Add Bookmark" button
- [ ] Explore the different views and features
- [ ] Customize the UI and add more features
- [ ] Deploy to Vercel or your preferred platform

## Troubleshooting

**"Missing Supabase environment variables" error:**
- Make sure your `.env.local` file exists and has the correct values
- Restart the development server after adding environment variables

**Database connection issues:**
- Verify your Supabase credentials are correct
- Make sure you've run the SQL setup script
- Check that Row Level Security policies are in place

**Authentication issues:**
- Ensure Google OAuth is configured in your Supabase project (optional)
- Check that email confirmation is set up correctly 