# Project Architecture

## Overview

The Thesis Management System follows a modern, scalable architecture with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Components                        │   │
│  │  ├─ Pages (Page components for routes)              │   │
│  │  ├─ Components (Reusable UI components)             │   │
│  │  └─ Navigation (App-wide routing)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              State Management (Zustand)             │   │
│  │  ├─ Auth Store                                      │   │
│  │  ├─ Project Store                                   │   │
│  │  ├─ Supervisor Store                                │   │
│  │  └─ Notification Store                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                          │   │
│  │  ├─ authService                                     │   │
│  │  ├─ projectService                                  │   │
│  │  ├─ supervisorService                               │   │
│  │  ├─ requestService                                  │   │
│  │  └─ notificationService                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│                  Tailwind CSS Styling                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↕ (API Calls)
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Backend (BaaS)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PostgreSQL Database                        │   │
│  │  ├─ user_profiles                                   │   │
│  │  ├─ supervisors                                     │   │
│  │  ├─ students                                        │   │
│  │  ├─ projects                                        │   │
│  │  ├─ supervisor_requests                            │   │
│  │  └─ notifications                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Authentication & RLS                       │   │
│  │  ├─ Email/Password Auth                             │   │
│  │  ├─ JWT Tokens                                      │   │
│  │  └─ Row-Level Security Policies                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Pages
- **HomePage**: Landing page with feature overview
- **LoginPage**: User authentication
- **RegisterPage**: New user registration
- **StudentProjectsPage**: Browse and search projects
- **StudentSupervisorsPage**: Find supervisors
- **StudentRequestsPage**: View request status
- **SupervisorRequestsPage**: Manage student requests
- **NotificationsPage**: View notifications
- **AdminDashboardPage**: System overview

### Components
- **Layout Components**: Container, Section, Grid
- **Form Components**: Input, Select, Textarea
- **Card Components**: Card, ProjectCard, SupervisorCard
- **UI Components**: Button, Badge, Modal, Alert, LoadingSpinner
- **Navigation**: App navigation bar

### Services
- **authService**: Authentication operations
- **projectService**: Project CRUD operations
- **supervisorService**: Supervisor profile operations
- **requestService**: Request management
- **notificationService**: Notification handling

### State Management
```javascript
// Zustand Stores
useAuthStore()          // User & auth state
useProjectStore()       // Projects state
useSupervisorStore()    // Supervisors state
useNotificationStore()  // Notifications state
```

## Data Flow

### Authentication Flow
```
User Input (Login)
    ↓
LoginPage Component
    ↓
authService.login()
    ↓
Supabase Auth
    ↓
JWT Token
    ↓
useAuthStore (setUser, setProfile)
    ↓
Route Redirect (based on role)
```

### Project Viewing Flow
```
StudentProjectsPage
    ↓
useEffect -> projectService.getProjects()
    ↓
Supabase Query (with RLS)
    ↓
setProjects() -> useProjectStore
    ↓
Re-render with projects
    ↓
User can search/filter
```

### Request Submission Flow
```
User clicks "Send Request"
    ↓
requestService.sendRequest(studentId, supervisorId)
    ↓
INSERT into supervisor_requests
    ↓
CREATE notification
    ↓
setSuccessMessage
    ↓
Fetch updated requests
```

## Security Architecture

### Authentication
- Supabase built-in authentication
- Email + password method
- Secure JWT tokens
- Automatic session management

### Authorization (RBAC)
- Three roles: student, supervisor, admin
- Role stored in user_profiles table
- Route-level protection with ProtectedRoute component
- Row-Level Security policies in database

### RLS Policies
```
user_profiles
├─ Users can view own profile
├─ Admins can view all profiles
└─ Users can update own profile

supervisors
├─ Everyone can view supervisors
├─ Supervisors can update own profile
└─ Admins can manage all

students
├─ Students can view own profile
├─ Supervisors can view assigned students
└─ Admins can view all

projects
├─ Everyone can view projects
├─ Supervisors/Admins can create
├─ Creators can update own
└─ Admins can manage all

supervisor_requests
├─ Students see own requests
├─ Supervisors see own requests
├─ Students can create requests
└─ Supervisors can update status

notifications
├─ Users see own notifications
├─ System creates notifications
├─ Users can update own
└─ Users can delete own
```

## Data Model

### user_profiles
- id (UUID, PK)
- email (unique)
- full_name
- role (enum)
- created_at, updated_at

### supervisors
- id (UUID, PK)
- user_id (FK, unique)
- department
- research_area
- experience
- contact_email
- bio

### students
- id (UUID, PK)
- user_id (FK, unique)
- department
- group_id
- enrollment_number

### projects
- id (UUID, PK)
- title, description
- category
- video_link
- created_by (FK)
- supervisor_id (FK)
- status

### supervisor_requests
- id (UUID, PK)
- student_id (FK)
- supervisor_id (FK)
- status (enum)
- created_at, updated_at
- Unique constraint: (student_id, supervisor_id)

### notifications
- id (UUID, PK)
- user_id (FK)
- message
- type
- is_read
- created_at, updated_at

## API Layer

### Service Functions
All external API calls go through services:

```javascript
// Example: projectService
projectService.getProjects()        // GET all projects
projectService.getProjectById(id)   // GET project
projectService.getProjectsByCategory(cat)
projectService.createProject(data)  // POST
projectService.updateProject(id, data)
projectService.deleteProject(id)    // DELETE
```

Error handling is consistent:
```javascript
{ success: true, data: [...] }      // Success
{ success: false, error: "message" } // Error
```

## Styling Architecture

### Tailwind CSS
- Utility-first approach
- Responsive design
- Custom color palette
- Reusable components

### Component Patterns
```jsx
// Base components use Tailwind utilities
<Button variant="primary" size="md" fullWidth>
<Card hover>
<Input label="Name" />
```

## Performance Considerations

### Frontend
- Code splitting by route
- Component memoization (if needed)
- Lazy loading for images
- Minimal re-renders with Zustand

### Backend
- Indexes on frequently queried columns
- RLS policies optimized
- Query optimization
- Connection pooling

### Caching
- Browser cache for static assets
- Zustand for state persistence
- Session storage for tokens

## Error Handling

### Frontend
- Try-catch blocks in async operations
- User-friendly error messages
- Alert component for notifications
- Graceful degradation

### Backend
- RLS policies prevent unauthorized access
- Database constraints enforce data integrity
- Error messages logged for debugging

## Testing Strategy (Future)

### Unit Tests
- Service functions
- Utility functions
- Component logic

### Integration Tests
- Authentication flow
- Request submission
- Data fetching

### E2E Tests
- User workflows
- Cross-role interactions
- Edge cases

## Scalability

### Horizontal Scaling
- Supabase handles database scaling
- Vercel handles frontend scaling
- Stateless API design

### Vertical Scaling
- Upgrade Supabase tier for more resources
- Upgrade Vercel plan for better performance

### Future Optimizations
- Implement caching strategies
- Optimize database queries
- Add CDN for assets
- Implement WebSocket for real-time updates

---

This architecture ensures maintainability, security, and scalability for the Thesis Management System.
