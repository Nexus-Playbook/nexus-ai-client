# Nexus AI Client - Setup Guide

## Week 2 Deliverable: Kanban Board with Task Management

This frontend application provides a complete Kanban board interface for managing tasks across projects and teams, integrated with the Nexus AI backend services.

## Features Implemented

✅ **Authentication & Authorization**
- Login/Register pages with JWT token management
- Auto-refresh token handling
- Protected routes with auth guards
- Team-scoped data access

✅ **Kanban Board UI**
- Drag-and-drop task management using @dnd-kit
- Four columns: To Do, In Progress, Done, Blocked
- Real-time optimistic updates
- Task counts per column
- Responsive design

✅ **Task Management**
- Create/Edit tasks with rich modal forms
- Task properties: title, description, status, priority, due date, assignee, tags
- Visual priority indicators (low, medium, high, urgent)
- Overdue date warnings
- Tag support

✅ **Project Management**
- Multi-project support
- Project selector in header
- Auto-create default project on first login

✅ **UI Components**
- Reusable Button, Input, Textarea, Select, Card, Modal components
- Consistent design system with Tailwind CSS
- Loading states and error handling

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Running backend services:
  - Auth service on port 3001
  - Task service on port 3002

## Installation

1. **Install dependencies:**
   ```bash
   cd nexus-ai-client
   npm install
   ```

2. **Configure environment:**
   The `.env.local` file is already set up with default values:
   ```env
   NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
   NEXT_PUBLIC_TASK_API_URL=http://localhost:3002
   NEXT_PUBLIC_GATEWAY_API_URL=http://localhost:4000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Quick Start Guide

### 1. Register/Login
- Navigate to the login page (auto-redirects)
- Register a new account or login with existing credentials
- Personal team is auto-created on registration

### 2. View Dashboard
- After login, you're redirected to the dashboard
- A default project is created automatically if none exists
- Select projects from the dropdown in the header

### 3. Manage Tasks

**Create Task:**
- Click "New Task" button in header, or
- Click "+" button in any column header
- Fill in task details (title required)
- Task is created and appears in the appropriate column

**Edit Task:**
- Click on any task card
- Update properties in the modal
- Changes are saved immediately

**Move Task:**
- Drag any task card to a different column
- Status updates automatically via API
- Optimistic UI updates for instant feedback

**Task Properties:**
- **Title**: Required, max 200 characters
- **Description**: Optional, multi-line
- **Status**: todo, in_progress, done, blocked
- **Priority**: low, medium, high, urgent (color-coded)
- **Due Date**: Optional, shows warning if overdue
- **Assigned To**: Optional, user ID or email
- **Tags**: Optional, comma-separated

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── dashboard/         # Main dashboard with Kanban
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── tasks/             # Task-specific components
│   │   ├── TaskCard.tsx   # Individual task display
│   │   └── TaskModal.tsx  # Create/edit modal
│   └── kanban/            # Kanban board components
│       ├── KanbanBoard.tsx      # Main board controller
│       ├── KanbanColumn.tsx     # Column with drag-drop
│       └── SortableTaskCard.tsx # Draggable wrapper
├── lib/
│   ├── api-client.ts      # Axios API client with interceptors
│   ├── auth-store.ts      # Zustand auth state management
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## API Integration

The client integrates with two backend services:

### Auth Service (port 3001)
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `GET /users/me` - Get current user

### Task Service (port 3002)
- `GET /tasks?teamId={id}&projectId={id}` - List tasks
- `GET /tasks/{id}` - Get single task
- `POST /tasks` - Create task
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `GET /projects?teamId={id}` - List projects
- `POST /projects` - Create project

All requests to the task service include JWT Bearer token authentication.

## Testing Checklist

- [ ] **Registration Flow**
  - Create new account
  - Auto-login after registration
  - Personal team auto-created

- [ ] **Login Flow**
  - Login with existing credentials
  - Token stored in localStorage
  - Redirect to dashboard

- [ ] **Task CRUD**
  - Create task via "New Task" button
  - Create task via column "+" button
  - Edit task by clicking card
  - View all task properties
  - Save validates required fields

- [ ] **Drag & Drop**
  - Drag task from "To Do" to "In Progress"
  - Verify status updates in database
  - Optimistic UI updates immediately
  - Network failure reverts change

- [ ] **Multi-Tenancy**
  - Tasks scoped to team
  - Cannot see other teams' tasks
  - Project selector filters correctly

- [ ] **UI/UX**
  - Loading states show spinners
  - Errors display user-friendly messages
  - Responsive on mobile/tablet
  - Smooth animations

## Known Issues & Limitations

1. **No Real-time Updates**: Tasks don't auto-refresh when other users make changes (Week 3 feature)
2. **No Bulk Operations**: Can't select/move multiple tasks at once
3. **No Task Search/Filter**: All tasks shown in columns (future enhancement)
4. **No Inline Editing**: Must open modal to edit tasks
5. **No Task Deletion**: Delete endpoint not exposed in UI yet

## Next Steps (Week 3)

- [ ] Add WebSocket support for real-time updates
- [ ] Implement task subscriptions
- [ ] Add activity feed
- [ ] Implement collaborative editing indicators
- [ ] Add user presence (who's online)

## Troubleshooting

**Problem: "Failed to fetch tasks"**
- Ensure task service is running on port 3002
- Check network tab for 401 errors (auth issue)
- Verify JWT token in localStorage

**Problem: "Cannot read property 'teamId' of null"**
- User object not loaded yet
- Check auth service is running on port 3001
- Try logging out and back in

**Problem: Drag-and-drop not working**
- Ensure you drag from the card area
- Check browser console for errors
- Verify @dnd-kit packages installed

**Problem: Tasks not persisting**
- Check MongoDB connection in task service
- Verify network requests complete successfully
- Check task service logs

## Performance Notes

- Tasks load on component mount
- Optimistic updates provide instant feedback
- Token refresh handled automatically
- Minimal re-renders using React best practices

## Security Notes

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- All API calls include Bearer token
- Auto-redirect to login on 401
- No sensitive data in client-side code
- Team isolation enforced server-side

---

**Completed**: October 25, 2024
**Week 2 Status**: ✅ Complete - Backend + Frontend Kanban UI delivered

