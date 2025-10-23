# Nexus AI Client

The frontend application for Nexus AI - an AI-driven productivity and collaboration hub.

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Query for state management
- WebSocket for real-time updates

## Features
- Task management with Kanban boards
- Real-time collaboration
- AI-powered meeting assistance
- Team analytics dashboard
- Authentication with SSO support

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables
Copy `.env.example` to `.env.local` and configure:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Project Structure
```
src/
├── app/           # Next.js app directory
├── components/    # Reusable UI components
├── lib/          # Utilities and configurations
├── hooks/        # Custom React hooks
└── types/        # TypeScript type definitions
```

## Contributing
1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License
Private - Nexus AI Platform