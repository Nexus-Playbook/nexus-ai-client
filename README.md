# Nexus AI Client

The frontend application for Nexus AI - an AI-driven productivity and collaboration hub.

## ✅ Week 2 Status: COMPLETE

**Deliverable**: Full-featured Kanban board with task management UI integrated with backend services.

### What's Implemented

✅ **Authentication & Multi-Tenancy**
- Login/Register flows with JWT token management
- Auto-refresh tokens with interceptors
- Protected routes and team-scoped data
- Personal team auto-creation

✅ **Kanban Board Interface**
- 4-column board (To Do, In Progress, Done, Blocked)
- Drag-and-drop task management using @dnd-kit
- Real-time optimistic updates
- Task counts and visual indicators

✅ **Task CRUD Operations**
- Create tasks via modal forms
- Edit tasks by clicking cards
- Rich task properties: title, description, status, priority, due date, assignee, tags
- Form validation and error handling

✅ **UI/UX Components**
- Reusable component library (Button, Input, Textarea, Select, Card, Modal)
- Modern design with Tailwind CSS
- Loading states and error messages
- Responsive mobile-friendly layout

✅ **Project Management**
- Multi-project support
- Project selector dropdown
- Auto-create default project on first login

## Tech Stack
- **Next.js 14.2** (App Router)
- **TypeScript 5**
- **Tailwind CSS 3.4**
- **@dnd-kit** for drag-and-drop
- **Axios** for API integration
- **Zustand** for state management

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Services
Ensure these are running:
- Auth service: `http://localhost:3001`
- Task service: `http://localhost:3002`

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the Flow
1. **Register**: Create account → Personal team auto-created
2. **Dashboard**: Auto-creates default project
3. **Create Task**: Click "New Task" → Fill form → Submit
4. **Drag Task**: Move task between columns → Status updates via API
5. **Edit Task**: Click task card → Modify → Update

📖 **Detailed Guide**: See [SETUP.md](./SETUP.md) and [QUICK_START.md](./QUICK_START.md)

## Environment Variables
Environment is pre-configured in `.env.local`:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
NEXT_PUBLIC_TASK_API_URL=http://localhost:3002
NEXT_PUBLIC_GATEWAY_API_URL=http://localhost:4000
```

## Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checks

## Project Structure
```
src/
├── app/                         # Next.js App Router
│   ├── login/page.tsx          # Authentication page
│   ├── dashboard/page.tsx      # Main Kanban board
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── tasks/                  # Task components
│   │   ├── TaskCard.tsx        # Individual task display
│   │   └── TaskModal.tsx       # Create/edit form
│   └── kanban/                 # Kanban board
│       ├── KanbanBoard.tsx     # Main board controller
│       ├── KanbanColumn.tsx    # Droppable column
│       └── SortableTaskCard.tsx # Draggable wrapper
├── lib/
│   ├── api-client.ts           # Axios API wrapper
│   ├── auth-store.ts           # Zustand auth state
│   └── utils.ts                # Helper functions
└── types/
    └── index.ts                # TypeScript definitions
```

## API Integration

### Auth Service (port 3001)
- `POST /auth/register` - Register user
- `POST /auth/login` - Authenticate
- `POST /auth/refresh` - Refresh token
- `GET /users/me` - Current user

### Task Service (port 3002)
- `GET /tasks?teamId={id}&projectId={id}` - List tasks
- `POST /tasks` - Create task
- `PATCH /tasks/{id}` - Update task
- `GET /projects?teamId={id}` - List projects
- `POST /projects` - Create project

All Task service calls include JWT Bearer authentication.

## Testing Checklist

- [x] User registration with auto-team creation
- [x] User login with token persistence
- [x] Task creation via form
- [x] Task editing via modal
- [x] Drag-and-drop status updates
- [x] Project selector functionality
- [x] Auto-create default project
- [x] Team-scoped data isolation
- [x] Token refresh on expiry
- [x] Logout clears auth state

## Week 2 Deliverables Met

| Requirement | Status | Evidence |
|------------|--------|----------|
| Kanban UI with create/edit tasks | ✅ Done | `KanbanBoard.tsx`, `TaskModal.tsx` |
| Drag-and-drop functionality | ✅ Done | `@dnd-kit` integration |
| Task CRUD operations | ✅ Done | Full API integration |
| Auth integration | ✅ Done | JWT tokens, protected routes |
| Multi-tenancy support | ✅ Done | Team-scoped queries |
| Modern UI/UX | ✅ Done | Tailwind, responsive design |

## Known Limitations (Future Enhancements)

- No real-time WebSocket updates (Week 3)
- No task search/filtering
- No bulk operations
- No task deletion in UI
- localStorage for tokens (consider httpOnly cookies)

## Next Steps (Week 3)

- [ ] Add WebSocket integration for real-time updates
- [ ] Implement task subscriptions
- [ ] Add collaborative editing indicators
- [ ] User presence (who's viewing/editing)

## Contributing
1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run type-check` and `npm run lint`
4. Test E2E flow manually
5. Submit a pull request

## License
Private - Nexus AI Platform

---

**Completed**: October 25, 2024  
**Status**: ✅ Week 2 Frontend Complete - Ready for E2E Testing