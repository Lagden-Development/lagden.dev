[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/1hfqv.svg)](https://status.lagden.dev)
![GitHub branch check runs](https://img.shields.io/github/check-runs/Lagden-Development/lagden.dev/main)
![Codacy Badge](https://app.codacy.com/project/badge/Grade/e661a3949ba8451fbcf7d42dcb903dbd)

# lagden.dev

The official portfolio website for **Lagden Development**, built with Next.js 16, React 19, and TypeScript. Showcases our open-source projects, team members, and development philosophy.

## Tech Stack

| Category       | Technology                        |
| -------------- | --------------------------------- |
| **Framework**  | Next.js 16.1.4 (App Router)       |
| **UI**         | React 19.2.1, Tailwind CSS 3.4.18 |
| **Language**   | TypeScript 5.8.3                  |
| **CMS**        | Contentful                        |
| **Monitoring** | Sentry, Better Stack              |
| **Deployment** | Docker / Coolify                  |

## Features

- **Project Showcase** - Browse our open-source projects with rich descriptions and live status
- **Team Profiles** - Meet the developers behind Lagden Development
- **Commit Timeline** - Revolutionary commit viewer with hash-based generative art
- **Real-time Status** - Live project health monitoring via Better Stack
- **Advanced Search** - Full-text search with filters across projects and people
- **Performance Optimized** - In-memory caching, rate limiting, Core Web Vitals tracking

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (enabled via Corepack)
- Contentful account with configured space

### Installation

```bash
# Clone the repository
git clone https://github.com/Lagden-Development/lagden.dev.git
cd lagden.dev

# Enable pnpm via Corepack
corepack enable

# Install dependencies
pnpm install

# Copy environment template
cp .env.local.example .env.local
# Edit .env.local with your Contentful credentials

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

**Required:**

```bash
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_API_KEY=your_api_key
```

**Optional:**

```bash
CONTENTFUL_ENVIRONMENT=master
SENTRY_AUTH_TOKEN=             # Build-time only, for source maps
BETTERSTACK_UPTIME_API_KEY=    # Status monitoring
```

See `.env.local.example` for the full list with cache configuration options.

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm analyze      # Bundle analysis
```

## Docker Deployment

The project includes a multi-stage Dockerfile optimized for production:

```bash
# Build the image
docker build -t lagden-dev .

# Run with environment variables
docker run -p 3000:3000 \
  -e CONTENTFUL_SPACE_ID=xxx \
  -e CONTENTFUL_DELIVERY_API_KEY=xxx \
  lagden-dev
```

Or use Docker Compose:

```bash
docker compose up -d
```

**Resource Defaults:**

- CPU: 1 core (0.25 reserved)
- Memory: 512MB (256MB reserved)
- Health check: `/api/health` endpoint

## Project Structure

```
app/
├── api/              # API routes (projects, people, health, etc.)
├── components/       # React components
│   ├── layout/      # Navbar, Footer
│   ├── shared/ui/   # ProjectsGrid, PeopleGrid, CommitsList
│   └── ui/          # Base components (Button, Card)
├── lib/             # Utilities, API client, caching
├── types/           # TypeScript interfaces
└── [routes]/        # Page routes
```

## API Endpoints

| Endpoint                           | Description         | Rate Limit |
| ---------------------------------- | ------------------- | ---------- |
| `GET /api/projects`                | List all projects   | 60/min     |
| `GET /api/projects/[slug]`         | Project details     | 120/min    |
| `GET /api/projects/[slug]/commits` | Project commits     | 30/min     |
| `GET /api/projects/[slug]/status`  | Project health      | 120/min    |
| `GET /api/people`                  | List team members   | 60/min     |
| `GET /api/people/[slug]`           | Person details      | 120/min    |
| `GET /api/health`                  | System health check | 60/min     |

## Contributing

We welcome contributions to improve performance and functionality, but not content changes. For more information, please refer to our [contributing guidelines](https://github.com/Lagden-Development/.github/blob/main/CONTRIBUTING.md).

## License

This project is licensed under the terms of the non-commercial open-source license. You can view the full license [here](https://github.com/zachlagden/zachlagden/blob/main/LICENCE).
