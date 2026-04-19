# Visual Application Flow

## 🎯 User Journey Maps

### Student Journey
```
┌─────────────────────────────────────────────────────────┐
│                    STUDENT JOURNEY                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. REGISTRATION                                        │
│     ┌──────────────────┐                               │
│     │ Register Page    │                               │
│     │ (Email + Pass)   │ ──→ Email confirmed           │
│     │ (Select Student) │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  2. LOGIN                                              │
│     ┌──────────────────┐                               │
│     │ Login Page       │ ──→ JWT Token                 │
│     │ (Verify Creds)   │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  3. BROWSE PROJECTS                                    │
│     ┌──────────────────┐                               │
│     │ Projects Page    │ ──→ See all projects          │
│     │ (Search/Filter)  │ ──→ Watch videos             │
│     └──────────────────┘                               │
│           ↓                                             │
│  4. FIND SUPERVISOR                                    │
│     ┌──────────────────┐                               │
│     │ Supervisors Page │ ──→ See all supervisors       │
│     │ (Filter/Search)  │ ──→ View details             │
│     └──────────────────┘                               │
│           ↓                                             │
│  5. SEND REQUEST                                       │
│     ┌──────────────────┐                               │
│     │ Send Request     │ ──→ Notification sent         │
│     │ (Supervisor)     │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  6. TRACK STATUS                                       │
│     ┌──────────────────┐                               │
│     │ My Requests      │ ──→ Pending/Accepted/Rejected │
│     │ Check Status     │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  7. GET NOTIFICATIONS                                  │
│     ┌──────────────────┐                               │
│     │ Notifications    │ ──→ Accept/Reject updates    │
│     │ (Real-time)      │                               │
│     └──────────────────┘                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Supervisor Journey
```
┌─────────────────────────────────────────────────────────┐
│                   SUPERVISOR JOURNEY                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. REGISTRATION                                        │
│     ┌──────────────────┐                               │
│     │ Register Page    │ ──→ Email confirmed           │
│     │ (Supervisor role)│                               │
│     │ (Add Details)    │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  2. LOGIN                                              │
│     ┌──────────────────┐                               │
│     │ Supervisor Login │ ──→ JWT Token                 │
│     └──────────────────┘                               │
│           ↓                                             │
│  3. RECEIVE REQUESTS                                   │
│     ┌──────────────────┐                               │
│     │ Requests Page    │ ──→ See pending requests      │
│     │ (From Students)  │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  4. MANAGE REQUESTS                                    │
│     ┌──────────────────┐                               │
│     │ Accept/Reject    │ ──→ Student notified         │
│     │ Decision Action  │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  5. VIEW STUDENTS                                      │
│     ┌──────────────────┐                               │
│     │ My Students      │ ──→ See assigned students    │
│     │ List             │                               │
│     └──────────────────┘                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Admin Journey
```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN JOURNEY                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. ADMIN LOGIN                                         │
│     ┌──────────────────┐                               │
│     │ Admin Login      │ ──→ Full Access              │
│     └──────────────────┘                               │
│           ↓                                             │
│  2. ADMIN DASHBOARD                                    │
│     ┌──────────────────┐                               │
│     │ System Overview  │ ──→ Statistics               │
│     │ Stats & Status   │ ──→ System Health            │
│     └──────────────────┘                               │
│           ↓                                             │
│  3. MANAGE USERS                                       │
│     ┌──────────────────┐                               │
│     │ User Management  │ ──→ Create/Edit/Delete      │
│     │ All Roles        │ ──→ Assign Roles            │
│     └──────────────────┘                               │
│           ↓                                             │
│  4. MANAGE PROJECTS                                    │
│     ┌──────────────────┐                               │
│     │ Project CRUD     │ ──→ Create Projects          │
│     │ Add Videos       │ ──→ Add Links               │
│     │ Edit/Delete      │                               │
│     └──────────────────┘                               │
│           ↓                                             │
│  5. MONITOR ACTIVITIES                                 │
│     ┌──────────────────┐                               │
│     │ Activity Monitor │ ──→ All actions              │
│     │ Audit Log        │                               │
│     └──────────────────┘                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)               │
│ ┌───────────────────────────────────────────────────┐  │
│ │           React Components                        │  │
│ │  ┌─────────────┐  ┌──────────────┐ ┌──────────┐ │  │
│ │  │ Pages       │  │ Components   │ │ UI State │ │  │
│ │  │ (9 pages)   │  │ (11 types)   │ │          │ │  │
│ │  └─────────────┘  └──────────────┘ └──────────┘ │  │
│ └───────────────────────────────────────────────────┘  │
│           ↓ (API Calls via Services)                   │
│ ┌───────────────────────────────────────────────────┐  │
│ │        Service Layer (abstraction)                │  │
│ │  • authService      • projectService              │  │
│ │  • supervisorService  • requestService            │  │
│ │  • notificationService                            │  │
│ └───────────────────────────────────────────────────┘  │
│           ↓ (Zustand Store)                            │
│ ┌───────────────────────────────────────────────────┐  │
│ │     State Management (Zustand)                    │  │
│ │  • Auth Store     • Project Store                 │  │
│ │  • Supervisor Store  • Notification Store         │  │
│ └───────────────────────────────────────────────────┘  │
│           ↓ (HTTP Requests)                            │
│ ┌───────────────────────────────────────────────────┐  │
│ │     Styling Layer (Tailwind CSS)                  │  │
│ │     Responsive • Modern • Accessible              │  │
│ └───────────────────────────────────────────────────┘  │
│                                                        │
└─────────────────────────────────────────────────────────┘
           ↕ (REST API / Realtime)
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Supabase)                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │   Authentication & Authorization                  │  │
│ │   • JWT Tokens  • Session Management              │  │
│ │   • Role-based Access Control (RBAC)              │  │
│ └───────────────────────────────────────────────────┘  │
│           ↓                                             │
│ ┌───────────────────────────────────────────────────┐  │
│ │       PostgreSQL Database                         │  │
│ │  ┌──────────┐ ┌─────────────────────────────────┐│  │
│ │  │ Tables   │ │ Security Policies (RLS)         ││  │
│ │  │ • Users  │ │ • Row-level Security            ││  │
│ │  │ • Projects│ │ • Access Control               ││  │
│ │  │ • Requests│ │ • Data Privacy                 ││  │
│ │  │ • etc    │ │                                 ││  │
│ │  └──────────┘ └─────────────────────────────────┘│  │
│ └───────────────────────────────────────────────────┘  │
│           ↓                                             │
│ ┌───────────────────────────────────────────────────┐  │
│ │    Storage & Backup (Managed)                     │  │
│ │    • Automatic Backups   • Point-in-time restore  │  │
│ └───────────────────────────────────────────────────┘  │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
LOGIN/REGISTER
      ↓
    Email & Password
      ↓
  Supabase Auth ────→ JWT Token
      ↓
   Set in Store
      ↓
  Get User Profile
      ↓
  Check Role (RBAC)
      ↓
   ╔═══════════════════════════════════╗
   ║  Role-Based Redirect              ║
   ╠═══════════════════════════════════╣
   ║ Student     → /student/projects   ║
   ║ Supervisor  → /supervisor/requests║
   ║ Admin       → /admin/dashboard    ║
   ╚═══════════════════════════════════╝
      ↓
   Protected Routes
      ↓
   App Components
```

## 📱 Component Hierarchy

```
App
├── Navigation
│   ├── Logo/Brand
│   ├── NavLinks (role-specific)
│   ├── Notifications Bell
│   └── User Menu
│
├── Routes
│   ├── HomePage
│   │   ├── Hero Section
│   │   ├── Features Grid
│   │   └── CTA Section
│   │
│   ├── LoginPage
│   │   ├── Form Container
│   │   ├── Input Fields
│   │   └── Error Alert
│   │
│   ├── StudentProjectsPage
│   │   ├── Search Bar
│   │   ├── Filter Section
│   │   ├── ProjectCard (Grid)
│   │   │   ├── Video Player
│   │   │   ├── Project Info
│   │   │   └── Action Buttons
│   │   └── Loading/Empty State
│   │
│   ├── StudentSupervisorsPage
│   │   ├── Search & Filter
│   │   └── SupervisorCard (Grid)
│   │       ├── Avatar Area
│   │       ├── Profile Info
│   │       └── Send Request Button
│   │
│   └── OtherPages...
│
└── Modal (for dialogs/confirmations)
```

## 🎯 State Management Flow

```
Zustand Stores
│
├─ useAuthStore
│  ├─ user (current logged-in user)
│  ├─ profile (user profile data)
│  ├─ isLoading
│  └─ error
│
├─ useProjectStore
│  ├─ projects (array)
│  ├─ selectedProject
│  ├─ filter (category, search)
│  └─ refetch()
│
├─ useSupervisorStore
│  ├─ supervisors (array)
│  ├─ filter (department, search)
│  └─ refetch()
│
└─ useNotificationStore
   ├─ notifications (array)
   ├─ unreadCount
   └─ setNotifications()
```

## 🔄 Request Lifecycle

```
Student Action
    ↓
Component Event Handler
    ↓
Service Function Call
    ↓
Supabase Query
    ↓
   ╔════════════════════╗
   ║  Success/Error     ║
   ╠════════════════════╣
   ║ Success: 200       ║
   ║ Error: 400/500     ║
   ╚════════════════════╝
    ↓
Update Store/State
    ↓
  Re-render UI
    ↓
Show Result to User
    ↓
  (Success: Message + Data)
  (Error: Alert Message)
```

## 📊 Database Relationships

```
user_profiles (users)
    ↑            ↑
    │            │
    ├─ students  │
    │  │         │
    │  └─→ supervisor_requests
    │            │
    ├─ supervisors
    │  │         │
    │  └─→ projects
    │
    └─ notifications
```

---

This visual guide helps understand how all components work together to create a seamless user experience!
