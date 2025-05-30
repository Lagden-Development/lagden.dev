# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the lagden.dev website codebase. This document should be updated after each task that involves code changes.

## 🚨 CRITICAL INSTRUCTIONS FOR CLAUDE

1. **ALWAYS USE TODO LISTS** - For any task involving multiple steps, create a todo list using TodoWrite tool
2. **UPDATE THIS FILE** - After completing any code changes, update relevant sections of this CLAUDE.md file
3. **NO UNNECESSARY FILES** - Never create files unless explicitly requested (especially documentation)
4. **PREFER EDITING** - Always edit existing files rather than creating new ones
5. **USE PNPM** - Always use `pnpm` instead of `npm` for all commands
6. **NO TESTING WITH PNPM DEV** - Never run `pnpm dev` to test. Always ask the user to test instead

## 📁 Project Overview

This is a **Next.js 15** portfolio website for Lagden Development, showcasing projects and team members with a focus on open-source development.

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS with custom dark theme
- **Fonts**: Geist Sans & Geist Mono
- **CMS**: External API with Contentful rich-text support
- **Analytics**: Google Analytics 4 (GA4)
- **Monitoring**: Sentry for error tracking and performance
- **Package Manager**: pnpm (REQUIRED - do not use npm)

### Key Dependencies

- `@contentful/rich-text-html-renderer` - Rendering CMS content
- `@sentry/nextjs` - Error and performance monitoring
- `lucide-react` - Icon library
- `web-vitals` - Performance metrics
- `shadcn/ui` components (button, card)

### Ad Blocker Compatibility

- Site is designed to work with ad blockers enabled
- Analytics (GA4) wrapped in SafeAnalytics component for graceful failure
- Global error handler prevents analytics errors from breaking the site
- All analytics calls check for gtag existence before execution

## 🏗️ Architecture

### Directory Structure

```
app/
├── api/                  # API routes
│   ├── health/          # Health check endpoint
│   └── og/              # Open Graph image generation with project/people images
├── components/          # React components
│   ├── layout/         # Navigation & Footer
│   ├── shared/ui/      # Reusable UI components
│   └── ui/             # Base UI components (shadcn)
├── helpers/            # Helper functions
├── lib/                # Core utilities
├── types/              # TypeScript interfaces
└── [pages]             # Page routes
```

### Data Flow Architecture

1. **Pages** (Client Components) → Show skeleton loading, then fetch data using `api-client`
2. **API Client** → Makes requests to cached API routes (`/api/*`)
3. **API Routes** → Use server-side caching (`unstable_cache`) to fetch from external CMS
4. **Components** → Fetch own data and render with loading states
5. **Analytics** → Track user interactions and performance

## 📄 Page Structure

### Home Page (`app/page.tsx`)

- Hero section with company branding
- Highlights cards (Open Source, Global, Modern Stack) with improved responsive design:
  - Uses `items-start` for consistent top alignment
  - Flexible layout with `flex-1 min-w-0` for text containers
  - Responsive padding (p-4 sm:p-6) and icon sizes (h-5 sm:h-6)
  - Better text sizing (text-lg sm:text-xl for titles, text-xs sm:text-sm for descriptions)
  - `flex-shrink-0` on icons to prevent deformation
  - Grid changes from 1 column to 3 columns at md breakpoint
- Development pillars section
- Featured projects grid
- Contact/CTA section
- SEO: Organization & Website structured data

### Projects Pages

- **List** (`/projects`): Paginated grid (9 per page)
- **Detail** (`/projects/[slug]`): Project info, README, status indicator
- **Commits** (`/projects/[slug]/commits`): Revolutionary commit viewer with hash-based generative art, timeline design, and smart commit type detection
- SEO: Project structured data with Open Graph images featuring project images

### People Pages

- **List** (`/people`): Team member grid
- **Detail** (`/people/[slug]`): Profile with skills, links, introduction
- SEO: Profile structured data with Open Graph images featuring person photo

### Search System

- **Main Search** (`/search`): Full-text search with filters
- **Tag Search** (`/search/tag/[tagName]`): Tag-based filtering
- Query parameter support (`?q=searchterm`)
- Analytics tracking for all searches

### Updates Page (`/updates`)

- Shows latest commits from the main "lagden-dev" project with stunning visual design
- Revolutionary commit viewer featuring hash-based generative art (4 pattern types: gradient, geometric, organic, circuit)
- Smart commit type detection with emoji indicators (✨ features, 🐛 fixes, 📚 docs, etc.)
- Timeline visualization with connecting lines and pulsing dots
- Interactive hover animations including rotating commit art
- Uses new GitHub public API integration (no API key required)

## 🧩 Component Architecture

### Layout Components

- **Navbar**: Responsive navigation with mobile menu, scroll opacity
- **Footer**: Links and dynamic year display
- **SectionHeader**: Dynamic letter-spacing transitions on scroll

### Core Components

- **SearchBar**: Advanced search with debouncing, filters, analytics
- **ProjectsGrid**: Server component with pagination, skeleton loading, stagger animations
- **PeopleGrid**: Server component for team display
- **CommitsList**: Revolutionary commits viewer with hash-based generative art, timeline design, commit type detection, and beautiful animations
- **StatusIndicator**: Real-time service health status with countdown timer, uses new `/api/projects/[slug]/status` endpoint
- **MouseGradient**: Interactive gradient effect following cursor
- **TiltCard**: 3D parallax tilt effect with dynamic glow on hover
- **SectionHeader**: Scroll-triggered letter-spacing transitions

### UI Components (shadcn/ui style)

- **Button**: Multiple variants (default, destructive, outline, ghost, link)
- **Card**: Container components with header/title/content/footer

### Component Patterns

- **Client Components with skeleton loading** for all data fetching
- **No build-time data fetching** - everything loads at runtime
- Skeleton loading states while data fetches from cached API endpoints
- Consistent prop interfaces
- Analytics tracking integration
- Accessibility features (ARIA labels, keyboard nav)

## 🔌 API Integration & Caching System

### New Cache-First Architecture

The website now uses a sophisticated in-memory caching system with demand-based fetching:

#### Cache Manager (`lib/cache/manager.ts`)

- **Singleton in-memory cache** with TTL support
- **LRU eviction** when memory limits are reached
- **Demand-based fetching**: Only fetches when requested AND expired
- **Request deduplication**: Multiple concurrent requests return same response
- **Statistics tracking**: Hit rate, memory usage, access patterns

#### API Structure (`/api/`)

```
/api/
├── projects/
│   ├── route.ts                 # GET all projects (60 req/min)
│   └── [slug]/
│       ├── route.ts             # GET single project (120 req/min)
│       ├── status/
│       │   └── route.ts         # GET project status (120 req/min)
│       └── commits/
│           └── route.ts         # GET project commits (30 req/min)
├── people/
│   ├── route.ts                 # GET all people (60 req/min)
│   └── [slug]/
│       └── route.ts             # GET single person (120 req/min)
├── health/
│   └── route.ts                 # Enhanced health endpoint (60 req/min)
├── cache/
│   └── stats/
│       └── route.ts             # Cache statistics (30 req/min)
└── system/
    └── route.ts                 # System information (30 req/min)
```

#### Rate Limiting

All API routes now include rate limiting with the following configuration:
- **High-frequency endpoints**: 120 requests per minute (detail pages, status)
- **Medium-frequency endpoints**: 60 requests per minute (list pages, health)
- **Low-frequency endpoints**: 30 requests per minute (commits, stats, system)
- **Rate limit headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- **Rate limit enforcement**: Per-client IP address with 1-minute sliding window
- **Automatic cleanup**: Old rate limit records are cleaned up every minute

#### Unified Response Format

All API endpoints return:

```typescript
{
  data: T | null,
  meta: {
    cached: boolean,
    cacheAge?: number,    // milliseconds since cached
    ttl?: number,         // time until expiration
    nextUpdate?: number,  // for status endpoints
  },
  error?: {
    code: string,
    message: string
  }
}
```

### API Client (`lib/api-client.ts`)

```typescript
// Server-side cached functions (for API routes)
getProjects(featuredOnly?) // Uses unstable_cache - 1hr cache
getProject(slug)           // Uses unstable_cache - 5min cache
getPeople()                // Uses unstable_cache - 2hr cache
getPerson(slug)            // Uses unstable_cache - 10min cache
getCommits(slug)           // Uses unstable_cache - 5min cache

// Client-side functions (for components)
getProjectsClient(featuredOnly?) // Fetches from /api/projects
getProjectClient(slug)           // Fetches from /api/projects/[slug]
getPeopleClient()                // Fetches from /api/people
getPersonClient(slug)            // Fetches from /api/people/[slug]
getCommitsClient(slug)           // Fetches from /api/projects/[slug]/commits
getProjectStatus(slug)           // Real-time status updates
```

### Environment Variables

```bash
# Cache Configuration (seconds)
CACHE_PROJECTS_LIST=3600          # 1 hour
CACHE_PROJECTS_DETAIL=300         # 5 minutes
CACHE_PEOPLE_LIST=7200            # 2 hours
CACHE_PEOPLE_DETAIL=600           # 10 minutes
CACHE_STATUS=30                   # 30 seconds
CACHE_COMMITS=300                 # 5 minutes
CACHE_TAGS=86400                  # 24 hours
CACHE_SEARCH=300                  # 5 minutes

# Cache Settings
CACHE_MAX_SIZE_MB=50
CACHE_MAX_ENTRIES=1000
ENABLE_CACHE_STATS=true

# External Services
CONTENTFUL_SPACE_ID              # Contentful CMS space ID
CONTENTFUL_DELIVERY_API_KEY      # Contentful delivery API key
CONTENTFUL_ENVIRONMENT=master    # Contentful environment (optional)
BETTERSTACK_UPTIME_API_KEY       # Better Stack API key for status monitoring (optional)
SENTRY_AUTH_TOKEN                # Sentry integration (optional)

# Note: No GitHub API key required - uses public GitHub API
```

### Cache Features

- **TTL-based expiration** with configurable timeouts
- **Memory management** with size and entry limits
- **Tag-based invalidation** for selective cache clearing
- **Performance statistics** for monitoring hit rates
- **Automatic cleanup** of expired entries
- **Request deduplication** to prevent duplicate API calls
- **Demand-based fetching**: Only updates when requested AND expired

### Client-Side Loading Strategy

- **Skeleton loading** shown immediately while data fetches
- **No build-time data fetching** - fixes `pnpm build` issues
- **Cached responses** from API routes for performance
- **Error handling** with graceful fallbacks
- **Real-time updates** for dynamic content

## 🎨 Styling System

### Design Tokens

- **Colors**: Dark theme with extended semantic palette
  - Primary: Violet/Fuchsia/Indigo gradients
  - Semantic: Cyan (speed), Amber (warmth), Emerald (success), Rose (error), Sky (info)
- **Spacing**: Consistent padding/margins
- **Typography**:
  - Geist Sans (100-900 weights) with variable font support
  - Geist Mono for code and numeric displays
  - Enhanced line-height (1.8) for better readability
  - Dynamic font-weight animations
- **Effects**:
  - Grid background patterns
  - Multi-stop radial gradients
  - Advanced backdrop blur layers
  - 3D transforms and parallax effects

### Tailwind Patterns

```css
/* Typography */
.text-10xl: 10rem font size with dynamic weight animation
.leading-extra-relaxed: 1.8 line-height
.section-header-scrolled: letter-spacing -0.05em on scroll

/* Common patterns */
.gradient-text: bg-gradient-to-br from-white via-white to-violet-200
.card-hover: hover:border-violet-500/30 hover:bg-black/60
.backdrop: backdrop-blur-md bg-black/50

/* Card states */
.card-interactive: Base card with evolution states
.card-interactive:hover: Enhanced border/shadow/glow
.card-interactive:active: Scale and intensity increase
.card-interactive.selected: Persistent selection state

/* Animations */
.stagger-fade-in: Sequential fade-in with rotation
.animate-font-weight: Variable font weight animation
.animate-letter-spacing: Dynamic letter spacing
.animate-tilt: 3D tilt effect
```

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Container: max-w-7xl with px-8 padding

## 📊 Analytics & Performance

### Google Analytics 4

- Property ID: `G-JHDS9FXCK2`
- Events tracked:
  - `web_vital` - Core Web Vitals
  - `search` - Search queries
  - `filter_applied` - Filter usage
  - `user_flow` - Navigation patterns
  - `performance_budget_violation` - Performance issues

### Web Vitals Monitoring

```typescript
// Performance budgets
FCP: 1800ms
LCP: 2500ms
INP: 200ms
CLS: 0.1
TTFB: 800ms
```

### Sentry Integration

- Error tracking with context
- Performance monitoring
- Session replay (10% sample rate)
- Source map support

## 🛡️ Security & Middleware

### Security Headers (via middleware)

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Caching Strategy

- Static assets: 1 year (immutable)
- API routes: no-cache
- Dynamic pages: 60s with stale-while-revalidate
- List pages: 5min cache

## 🧪 Development Workflow

### Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm analyze      # Bundle analysis
```

### UI/UX Improvements (Phase 1 - Completed)

1. **Typography Enhancement**

   - Dynamic type scale: Hero text scales from 7xl → 8xl → 10xl
   - Variable font weight animations (100-900)
   - Improved line-height (1.8) for body text
   - Letter-spacing transitions on scroll for headers

2. **Color System Evolution**

   - Added semantic colors: Cyan, Amber, Emerald, Rose, Sky
   - Extended gradient system with multi-stop patterns
   - Color meanings: Cyan (speed), Amber (community), etc.

3. **Animation & Interactions**

   - Stagger fade-in with rotation for grid items
   - 3D parallax tilt effect on project cards
   - Dynamic glow effects following mouse position
   - Card evolution states (default → hover → active → selected)

4. **Component Enhancements**
   - TiltCard: 3D transform with perspective
   - SectionHeader: Scroll-based letter-spacing
   - Enhanced card states with unique effects

### Code Conventions

1. **Imports**: Use absolute imports with `@/` prefix
2. **Components**: PascalCase naming, barrel exports
3. **Types**: Define in `types/index.ts` or colocate
4. **Async**: Use async/await over promises
5. **Error Handling**: Always handle errors gracefully

### Git Workflow

1. Feature branches from `main`
2. Conventional commits (feat:, fix:, docs:, etc.)
3. PR required for merging
4. Auto-deployment on merge

## 🔧 Configuration Files

### Key Configs

- `next.config.mjs` - Next.js config with Sentry & bundle analyzer
- `tailwind.config.js` - Custom theme and plugins
- `tsconfig.json` - TypeScript settings with strict mode
- `middleware.ts` - Request handling and headers

### Environment Detection

```typescript
// Automatic environment detection
development: NODE_ENV === 'development';
staging: VERCEL_ENV === 'preview';
production: VERCEL_ENV === 'production';
```

## 📝 Type Definitions

### Core Types

```typescript
interface Project {
  slug: string;
  title: string;
  description: string;
  picture_url: string;
  github_repo_url?: string;
  website_url?: string;
  tags: string[];
  project_readme: Document; // Contentful
  status?: Status;
}

interface Person {
  name: string;
  slug: string;
  occupation: string;
  location: string;
  pronouns: string;
  skills: string[];
  links: Link[];
  introduction: Document; // Contentful
  picture_url: string;
}

interface Commit {
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  date: string;
  url: string;
}
```

## 🚀 Performance Optimizations

### Cache-First Architecture Benefits

- **Efficiency**: 1000 users viewing same content = ~1 Contentful API call
- **Performance**: Most requests served from memory cache (<1ms response time)
- **Cost Reduction**: Dramatic reduction in external API calls (up to 99% reduction)
- **Scalability**: Can handle high traffic with minimal resources
- **Reliability**: Cached data survives temporary external service outages

### Next.js Optimizations

- Server-side caching with configurable TTL for each content type
- Image optimization with next/image
- Font optimization with next/font
- Package imports optimization for tree-shaking
- Removed `force-dynamic` exports - now using intelligent caching

### Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting
- Optimized bundle sizes

### Monitoring

- Real User Monitoring (RUM) via Web Vitals
- Performance budgets with alerts
- Bundle size tracking
- Cache hit rate monitoring via `/api/cache/stats`
- Enhanced health endpoint with service diagnostics

## 🐛 Error Handling

### Error Boundaries

- Global ErrorBoundary component
- Sentry integration for reporting
- Graceful UI degradation

### API Errors

- Automatic retry logic
- User-friendly error messages
- Error type classification
- Graceful degradation on failure

## 🔍 SEO & Metadata

### Features

- Dynamic metadata generation for all pages
- Structured data (JSON-LD)
- Open Graph tags with custom image generation
- Twitter cards
- Canonical URLs
- Sitemap at `/sitemap.xml`

### Open Graph Image Generation

- **API Route**: `/api/og` - Dynamic image generation for social sharing
- **Features**:
  - Project pages: Include project images and descriptions
  - People pages: Include profile photos, occupation, and location
  - Responsive layout with branded design
  - Type-specific styling (circular for people, rounded for projects)
  - Default to logo for pages without images
- **Parameters**: `title`, `description`, `type`, `image`, `occupation`, `location`

### Structured Data Types

- Organization (home page)
- Project (project pages)
- Person (people pages)
- Website (search action)
- Breadcrumb (navigation)

## 📚 Common Tasks

### Adding a New Page

1. Create `app/[route]/page.tsx`
2. Add metadata export
3. Implement data fetching with ISR
4. Add to navigation if needed
5. Update sitemap if public

### Adding a Component

1. Create in appropriate directory
2. Use TypeScript interfaces
3. Add 'use client' if needed
4. Export from barrel file
5. Document props with JSDoc

### Updating API Integration

1. Modify `lib/api-client.ts`
2. Update types in `types/index.ts`
3. Handle errors gracefully
4. Add performance tracking
5. Update cache settings

### Performance Debugging

1. Check Web Vitals in console (dev mode)
2. Review GA4 performance events
3. Use Chrome DevTools Performance tab
4. Check Sentry for slow transactions
5. Run `pnpm analyze` for bundle size

## 🔄 State Management

### Patterns

- Server Components for data fetching
- URL state for navigation (searchParams)
- Local state with useState for UI
- No global state management needed

### Data Fetching

- Server-side in page components
- Client-side with proper loading states
- Always handle errors
- Handle errors appropriately

## 🎯 Best Practices

### Do's

✅ Use pnpm for all operations
✅ Follow existing code patterns
✅ Add proper TypeScript types
✅ Handle loading and error states
✅ Track analytics events
✅ Update this file after changes

### Don'ts

❌ Don't use npm or yarn
❌ Don't create unnecessary files
❌ Don't skip error handling
❌ Don't ignore accessibility
❌ Don't bypass the API client
❌ Don't forget to update CLAUDE.md

## 📦 Deployment

### Platforms

- **Production**: Vercel (automatic from main branch)
- **Staging**: Vercel preview deployments
- **Monitoring**: Better Stack for uptime

### Build Process

1. Install dependencies: `pnpm install`
2. Build: `pnpm build`
3. Start: `pnpm start`

### Environment Variables

Set in Vercel dashboard:

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_DELIVERY_API_KEY`
- `SENTRY_AUTH_TOKEN` (optional)

---

**Remember**: This file is your source of truth. Keep it updated after every task involving code changes!
