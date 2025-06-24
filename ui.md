# 🖥️ UI Screens – AI Bookmarking Platform (MVP)

This document outlines all the UI screens required for the MVP of the AI-powered bookmarking platform.

---

## 🧠 Core App Screens

### 1. Home / Feed Screen
**Purpose**: Main screen showing all saved content  
**Components**:
- Search bar (natural language)
- Filters: category tags, platforms, date saved
- Feed of bookmarks: title, preview image, snippet, platform icon
- Toggle: list/grid view
- Bookmark actions: favorite, delete, edit tags  
**Enhancements**:
- Infinite scroll or pagination
- “Newly Saved” or “Most Viewed” tabs

---

### 2. Search Results Screen
**Purpose**: Display filtered bookmarks based on user query  
**Components**:
- Sticky search bar
- Query feedback: “Results for ‘AI tools from Twitter’”
- Sorted result cards
- Filter options (platform, tag, date)  
**Enhancements**:
- Semantic “related terms” suggestions
- Highlight matching text in results

---

### 3. Categories View
**Purpose**: Organize bookmarks by AI-generated or manual tags  
**Components**:
- Grid/list of categories (e.g., “Startups”, “UX”, “Inspiration”)
- Click → opens filtered feed
- Tag count badges (e.g., “Design (24)”)  
**Enhancements**:
- Merge/edit tags
- Show top saved tags

---

### 4. Platform View
**Purpose**: View bookmarks by source platform  
**Components**:
- Tabs or cards for each platform: Twitter, Reddit, LinkedIn, TikTok
- Each opens a filtered feed
- Platform icons + saved count  
**Enhancements**:
- Ability to disconnect/disable a platform
- Platform-specific filters (e.g., "only Twitter threads")

---

### 5. Bookmark Detail Screen *(optional)*
**Purpose**: Show expanded view of a saved bookmark  
**Components**:
- Full preview (text, image, embedded video if applicable)
- Tags and categories
- Edit button: title, notes, tags
- Source link with “open in new tab”  
**Enhancements**:
- AI summary of content (future scope)
- Bookmark version history

---

## 📥 Capture Interfaces

### 6. Browser Extension Popup
**Purpose**: Save content from any website  
**Components**:
- Current page preview (title, link)
- “Save” button
- Optional: suggested tags from AI
- Link to “View in Feed”  
**Enhancements**:
- One-click tagging
- Keyboard shortcuts

---

### 7. WhatsApp Bot Flow *(external UI)*
**Purpose**: Save content by messaging the bot a link  
**User sees in app**:
- Bot setup status in settings
- Bot instructions
- Last saved items confirmation

---

## 🔐 Authentication Screens

### 8. Sign Up Screen
**Purpose**: Create a new account  
**Components**:
- Email + password fields
- Google OAuth button
- Submit CTA
- Redirect to feed after sign-up

---

### 9. Login Screen
**Purpose**: Existing user authentication  
**Components**:
- Email/password fields
- “Continue with Google”
- Forgot password link
- Redirect to feed on success

---

### 10. Forgot Password Screen
**Purpose**: Reset password flow  
**Components**:
- Email field
- Reset instructions
- Confirmation screen

---

### 11. Email Verification Screen *(optional)*
**Purpose**: Prompt user to confirm their email  
**Components**:
- Notice with resend option
- Placeholder feed with “limited access” until verification

---

## 🧾 Support Screens

### 12. Notifications Center
**Purpose**: Revisit reminders, highlights, trending saves  
**Components**:
- Notification feed: “You saved this 2 weeks ago”, “You revisited 5 items last week”
- Mark as read/unread  
**Enhancements**:
- Dismiss or snooze options
- Personalized nudges

---

### 13. Settings Screen
**Purpose**: User preferences, platform linking, bot setup  
**Components**:
- Profile info (email, connected platforms)
- Enable/disable WhatsApp bot
- Tag cleanup tools
- Notification preferences
- Delete account button

---

### 14. Onboarding / Empty State
**Purpose**: Guide new users  
**Components**:
- Welcome message
- “How to save links” walkthrough
- CTA: Install extension / connect WhatsApp
- Placeholder bookmarks or demo content  
**Enhancements**:
- Interactive tutorial
- “Start with a sample save” feature

---

### 15. 404 / Error Screen
**Purpose**: Fallback for broken routes  
**Components**:
- “Page not found” message
- Button to return to home
