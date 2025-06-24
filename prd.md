# 🧠 AI-Powered Social Bookmarking Platform – PRD

## 📄 Overview  
An AI-powered platform that lets users save, search, and organize bookmarks or links across multiple social media platforms (e.g., Twitter, LinkedIn, Reddit, TikTok). It enables fast retrieval using natural language and topic-based organization. All content is securely tied to the user’s account across devices.

---

## ❗️Problem Statement  
Users who frequently save interesting content across social platforms (e.g., tweets, posts, threads, videos) struggle to revisit or retrieve it when needed. Bookmarks are scattered, poorly searchable, and often forgotten. For digital hoarders, valuable content gets lost in the noise.

---

## 🔍 Scope

### In Scope (MVP):
- **User Accounts**:
  - Email/password sign-up and login
  - OAuth (Google)
  - Session persistence via Supabase auth
- Save links via:
  - Browser extension
  - WhatsApp bot
- Ingest saved content from platforms: Twitter, LinkedIn, TikTok, Reddit
- AI-powered tagging and categorization
- Natural language search
- Toggle between platform view (e.g., Twitter) and category view (e.g., “Shoes”)
- Bookmark previews depending on content type
- Reminders/notifications to revisit saved content
- Unified feed of all bookmarks

### Out of Scope (for now):
- Social sharing of saved content  
- Team folders or collaboration  
- Dedicated mobile app  
- Full content summarization  

---

## 👣 User Flow

1. User signs up via email/password or Google login  
2. They install a browser extension or add the WhatsApp bot  
3. User discovers a post, video, or webpage on a social platform  
4. They save it using:
   - The browser extension  
   - WhatsApp bot  
5. The link is added to their feed  
6. AI tags the content with relevant labels (e.g., “design inspiration”)  
7. User later searches using natural language (e.g., “growth hacking Twitter threads”)  
8. Results are organized by relevance, category, and/or platform  
9. Reminders occasionally prompt the user to revisit saved items  

---

## 🛠️ Features

| Feature                      | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| Account Creation & Auth     | Email/password + Google login, session persistence                        |
| Save via Extension          | Save any link through a browser extension                                  |
| Save via WhatsApp Bot       | Share links to a WhatsApp chat to auto-save them                           |
| Cross-Platform Ingestion    | Automatically ingest links from Twitter, LinkedIn, TikTok, Reddit          |
| AI Tagging                  | AI applies smart tags based on content themes                              |
| Natural Language Search     | Search using queries like “startup memes from Reddit”                      |
| Categories View             | Toggle between platform and topic/category views                           |
| Bookmark Previews           | Show title, image, and/or snippet depending on content type                |
| Reminders & Notifications   | Nudges to revisit saved or trending bookmarks                              |
| Unified Feed                | Central place to browse and filter saved content                           |

---

## 🧱 Tech Stack

| Layer         | Choice                   | Notes                                                                 |
|---------------|---------------------------|-----------------------------------------------------------------------|
| Frontend      | React (Vite or Next.js)   | Fast development with component-based structure and routing           |
| Backend       | Supabase Functions        | Lightweight, serverless Postgres + auth + storage                     |
| Database      | Supabase Postgres + pgvector | Managed DB with real-time + vector search support                 |
| Auth          | Supabase Auth             | Email/password + Google login, session handling                      |
| AI/ML         | OpenAI + pgvector         | For tagging and semantic search with vector embedding storage         |
| Hosting       | Vercel                    | CI/CD and deployment for frontend                                     |
| Extension     | Chrome Extension (v3)     | Allows saving content from browser                                    |
| Bot           | WhatsApp Cloud API        | Receives and processes links from WhatsApp chat                       |

---

## 🧪 Success Metrics (MVP)

- 80%+ of saved links are tagged correctly by AI  
- >60% of users perform a search within 1 week of saving content  
- Avg. time to find a saved post under 10 seconds  
- >30% revisit rate on saved content (via reminders or feed)  
- 90% user retention for logged-in users across 7 days

