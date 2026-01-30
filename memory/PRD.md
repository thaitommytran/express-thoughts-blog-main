# Express/Thoughts - Personal Blog Platform

## Original Problem Statement
Build a complete personal blog website with React frontend, FastAPI backend, MongoDB database. Features include blog posts, admin dashboard, authentication, comments, tags, search, dark mode, and markdown editor.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Authentication**: JWT + Emergent Google OAuth

## User Personas
1. **Blog Admin**: Creates, edits, deletes posts via markdown editor
2. **Reader**: Browses posts, searches, filters by tags, leaves comments

## Core Requirements (Static)
- Blog post CRUD operations
- Markdown content with code highlighting
- Comment system for readers
- Tag-based categorization
- Full-text search
- Dark/Light theme toggle
- Responsive design
- SEO-friendly structure

## What's Been Implemented (Jan 30, 2026)
- [x] Neo-Brutalist design theme with Space Grotesk + JetBrains Mono fonts
- [x] Homepage with featured post and grid layout
- [x] Single post page with rendered markdown
- [x] Admin dashboard with post management
- [x] Create/Edit post with markdown editor (@uiw/react-md-editor)
- [x] Comment system (add/delete comments)
- [x] Tagging system with tag cloud sidebar
- [x] Search functionality
- [x] Dark/Light mode toggle with persistence
- [x] JWT authentication (email/password)
- [x] Google OAuth via Emergent Auth
- [x] Responsive design for mobile/desktop

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/session` - Google OAuth session exchange
- `POST /api/auth/logout` - Logout
- `GET /api/posts` - List posts (with pagination, search, tag filter)
- `GET /api/posts/{id}` - Get single post
- `POST /api/posts` - Create post (admin)
- `PUT /api/posts/{id}` - Update post (admin)
- `DELETE /api/posts/{id}` - Delete post (admin)
- `GET /api/posts/{id}/comments` - List comments
- `POST /api/posts/{id}/comments` - Add comment
- `DELETE /api/posts/{id}/comments/{cid}` - Delete comment (admin)
- `GET /api/tags` - List all tags with counts

## Admin Credentials (Test)
- Email: admin@blog.com
- Password: admin123

## Prioritized Backlog
### P0 (Critical) - Done
- [x] Core blog functionality
- [x] Authentication
- [x] Comment system

### P1 (Important) - Future
- [ ] Image uploads for posts
- [ ] RSS feed generation
- [ ] Email subscription/newsletter
- [ ] Social sharing buttons

### P2 (Nice to have) - Future
- [ ] Post scheduling
- [ ] Analytics dashboard
- [ ] Related posts suggestions
- [ ] Reading time estimates

## Next Tasks
1. Add image upload capability for posts
2. Implement RSS feed for subscribers
3. Add social sharing buttons
4. Consider email subscription feature

## Design Update (Jan 30, 2026 - v2)
Changed from Neo-Brutalist to **Cozy Berry Theme** per user feedback:

### Color Palette (Berry Crush)
- Primary: #B74F6F (Berry Crush) - dusty rose
- Secondary: #ADBDFF (Periwinkle) - soft lavender blue  
- Accent: #34E5FF (Electric Aqua) - cyan
- Azure: #3185FC - friendly blue
- Dark mode: #35281D (Dark Coffee) - warm brown base

### Typography
- Headings: Outfit (clean, modern)
- Body: DM Sans (friendly, readable)
- Accent: Caveat (handwritten feel for "Thoughts")

### Design Features
- Rounded corners (1rem radius)
- Soft shadows with hover elevation
- Animated blob with sparkles ✨
- Glass-morphism header with blur
- Gradient dividers
- Warm, inviting color transitions
- Less aggressive, more zany/playful feel
