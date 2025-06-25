# Hoarder Browser Extension

A browser extension that allows users to save bookmarks to their Hoarder account with ease.

## Features

- 🔐 **Secure Authentication**: Uses the same Supabase authentication as the main platform
- 📱 **Easy Bookmarking**: One-click bookmark saving from any webpage
- 🎯 **Smart Platform Detection**: Automatically detects and categorizes bookmarks by platform (Twitter, LinkedIn, Reddit, TikTok, etc.)
- 🎨 **Clean UI**: Modern, responsive design that matches the main platform

## Setup Instructions

### 1. Configure Supabase

1. Open `lib/supabase.js`
2. Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase credentials
3. These should be the same credentials used in your main Hoarder application

### 2. Create Icons

Replace the placeholder icon files in the `icons/` directory with actual PNG icons:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create a simple icon with the brain emoji (🧠) or your preferred design.

### 3. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension should now appear in your extensions list

### 4. Test the Extension

1. Click the extension icon in your browser toolbar
2. You should see the login/signup form
3. Sign in with your Hoarder account credentials
4. Once authenticated, you'll see the bookmark saving interface

## Development

### File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup HTML
├── popup.css             # Popup styles
├── popup.js              # Main popup logic
├── background.js         # Background service worker
├── content.js            # Content script for web pages
├── lib/
│   ├── supabase.js       # Supabase client configuration
│   └── auth.js           # Authentication manager
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Key Components

- **Popup**: The main UI that appears when clicking the extension icon
- **Background Script**: Handles background tasks and message routing
- **Content Script**: Runs on web pages to extract metadata
- **Auth Manager**: Handles authentication state and Supabase integration

### Authentication Flow

The extension uses the same authentication system as your main Hoarder application:

1. Users can sign in with email/password
2. Users can sign up for new accounts
3. Google OAuth is supported
4. Sessions are persisted across browser sessions
5. Authentication state is shared with the main application

## Next Steps

This is a basic implementation. Future enhancements could include:

- [ ] Save bookmark functionality
- [ ] Tag management
- [ ] Quick bookmark preview
- [ ] Keyboard shortcuts
- [ ] Context menu integration
- [ ] Sync with main platform
- [ ] Offline support

## Troubleshooting

### Extension not loading
- Check that all files are in the correct locations
- Verify the manifest.json is valid
- Check Chrome's developer console for errors

### Authentication issues
- Verify Supabase credentials are correct
- Check that your Supabase project has the correct authentication settings
- Ensure the redirect URL is properly configured

### Icons not showing
- Make sure all icon files are actual PNG images
- Verify the file paths in manifest.json match the actual files
- Try reloading the extension

## Security Notes

- The extension only requests necessary permissions
- Authentication tokens are stored securely by Supabase
- No sensitive data is stored in local storage
- All API calls go through your Supabase backend

## Support

For issues or questions, please refer to the main Hoarder project documentation or create an issue in the project repository. 