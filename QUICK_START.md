# 🚀 Quick Start - Nexus AI Frontend

## 1-Minute Setup

### Prerequisites Check
```bash
# Check Node.js version (need 18+)
node --version

# Check if backend services are running
curl http://localhost:3001/health  # Auth service
curl http://localhost:3002/health  # Task service
```

### Install & Run
```bash
# From nexus-ai-client directory
npm install
npm run dev
```

### First Login
1. Open http://localhost:3000
2. Click "Don't have an account? Sign up"
3. Register with:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
4. Auto-redirected to dashboard ✅

### Test Kanban Board

**Create a Task:**
```
1. Click "New Task" button (top right)
2. Fill in:
   - Title: "Setup development environment"
   - Description: "Install dependencies and configure"
   - Status: "todo" (pre-selected)
   - Priority: "high"
   - Due Date: Tomorrow's date
   - Tags: "setup, infrastructure"
3. Click "Create"
4. Task appears in "To Do" column
```

**Drag & Drop:**
```
1. Grab task card (click and hold)
2. Drag to "In Progress" column
3. Drop it
4. Status updates automatically (check DB!)
```

**Edit Task:**
```
1. Click on any task card
2. Change priority to "urgent"
3. Click "Update"
4. Card updates with red badge
```

## Expected Behavior

✅ Login redirects to dashboard
✅ Default project auto-created
✅ Tasks load in columns
✅ Drag-drop updates status via API
✅ Modal forms validate inputs
✅ Overdue dates show warning icon
✅ Logout clears tokens

## Quick Troubleshooting

**White screen / blank page:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

**"Failed to load tasks":**
```bash
# Verify backend is running
cd ../services/nexus-ai-task
npm run start:dev
```

**401 Unauthorized:**
```bash
# Token expired - logout and login again
# Or clear localStorage in browser DevTools
localStorage.clear()
```

## Development Tips

**Hot Reload**: Changes auto-refresh
**Console**: Open browser DevTools (F12) to see API calls
**Network Tab**: Monitor requests/responses
**React DevTools**: Install extension to inspect components

## Demo Credentials

If auth service has seed data:
- Email: `admin@nexus.ai`
- Password: `admin123`

## What to Look For

1. **Smooth Animations**: Drag-drop feels natural
2. **Instant Updates**: Optimistic UI responds immediately
3. **Loading States**: Spinners during API calls
4. **Error Handling**: Friendly messages on failures
5. **Responsive Design**: Works on mobile (try resizing browser)

## Next: Run E2E Tests

```bash
# In separate terminal, test API integration
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Copy the accessToken from response

export TOKEN="<your-token-here>"

# List tasks
curl http://localhost:3002/tasks?teamId=<team-id> \
  -H "Authorization: Bearer $TOKEN"

# Create task
curl -X POST http://localhost:3002/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API test task",
    "status": "todo",
    "priority": "medium",
    "project_id": "<project-id>",
    "team_id": "<team-id>"
  }'
```

**Frontend sees this task instantly on refresh!**

---

🎉 **Week 2 Complete!** Kanban board is live and functional.

