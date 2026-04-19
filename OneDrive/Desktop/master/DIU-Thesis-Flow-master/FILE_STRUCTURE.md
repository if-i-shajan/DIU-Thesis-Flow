# File Structure & Index

## 📂 Complete Project Structure

```
Thesis Management System/
│
├── 📄 Configuration Files
│   ├── package.json                 # Project dependencies
│   ├── vite.config.js              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.node.json          # TypeScript Node configuration
│   └── eslint.config.js            # ESLint configuration
│
├── 📋 Documentation Files
│   ├── README.md                   # Complete project documentation
│   ├── QUICKSTART.md              # 5-minute quick start guide
│   ├── SETUP.md                   # Detailed setup instructions
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── ARCHITECTURE.md            # Technical architecture
│   ├── DEVELOPMENT.md             # Development guidelines
│   ├── PROJECT_SUMMARY.md         # Project overview
│   ├── FEATURES_CHECKLIST.md      # Complete features list
│   ├── FILE_STRUCTURE.md          # This file
│   └── .env.example               # Environment template
│
├── 🗄️ Database Files
│   ├── DATABASE_SCHEMA.sql        # Complete database schema
│   │   ├── Tables (7)
│   │   ├── Policies (RLS)
│   │   ├── Indexes
│   │   └── Triggers
│   └── SAMPLE_DATA.sql            # Sample data for testing
│
├── 📁 src/ (Source Code)
│   │
│   ├── 🎨 components/             # Reusable UI components
│   │   ├── index.js               # Component exports
│   │   ├── Button.jsx             # Button component (multiple variants)
│   │   ├── Card.jsx               # Card layout components
│   │   ├── Modal.jsx              # Modal dialog component
│   │   ├── Alert.jsx              # Alert/notification component
│   │   ├── FormInputs.jsx         # Input, Select, Textarea
│   │   ├── Navigation.jsx         # Navigation bar component
│   │   ├── ProjectCard.jsx        # Project card component
│   │   ├── SupervisorCard.jsx     # Supervisor card component
│   │   ├── Badge.jsx              # Badge component
│   │   ├── LoadingSpinner.jsx     # Loading spinner component
│   │   └── Layout.jsx             # Container, Section, Grid components
│   │
│   ├── 📄 pages/                  # Page components for routes
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── LoginPage.jsx          # Login page
│   │   ├── RegisterPage.jsx       # Registration page
│   │   ├── StudentProjectsPage.jsx     # Student projects page
│   │   ├── StudentSupervisorsPage.jsx  # Supervisors listing
│   │   ├── StudentRequestsPage.jsx     # Student requests page
│   │   ├── SupervisorRequestsPage.jsx  # Supervisor requests page
│   │   ├── NotificationsPage.jsx       # Notifications page
│   │   └── AdminDashboardPage.jsx      # Admin dashboard
│   │
│   ├── 🪝 hooks/                  # Custom React hooks
│   │   ├── index.js               # Hook exports
│   │   ├── useAuth.js             # Authentication hook
│   │   └── useFetch.js            # Data fetching hook
│   │
│   ├── 🔧 services/               # API service functions
│   │   ├── index.js               # Service exports
│   │   ├── supabase.js            # Supabase client
│   │   ├── authService.js         # Authentication service
│   │   ├── projectService.js      # Project operations
│   │   ├── supervisorService.js   # Supervisor operations
│   │   ├── requestService.js      # Request management
│   │   └── notificationService.js # Notification service
│   │
│   ├── 📦 context/                # State management (Zustand)
│   │   └── store.js               # Global state stores
│   │                               ├── useAuthStore
│   │                               ├── useProjectStore
│   │                               ├── useSupervisorStore
│   │                               └── useNotificationStore
│   │
│   ├── 🛠️ utils/                  # Utility functions
│   │   └── ProtectedRoute.jsx     # Route protection component
│   │
│   ├── 🎨 styles/                 # Global styles
│   │   └── globals.css            # Global CSS with Tailwind
│   │
│   ├── App.jsx                    # Main app component with routing
│   └── main.jsx                   # Application entry point
│
├── 📁 public/                     # Static files
│   └── (placeholder for favicon, etc.)
│
├── 🔍 .gitignore                  # Git ignore rules
├── 📦 node_modules/               # Dependencies (after npm install)
└── 📄 index.html                  # HTML entry point
```

## 📚 Documentation Guide

| File | Purpose | Audience | Reading Time |
|------|---------|----------|--------------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 5 minutes | Everyone | 5 min |
| [README.md](README.md) | Complete documentation | All users | 20 min |
| [SETUP.md](SETUP.md) | Detailed setup instructions | Developers | 15 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment | DevOps/Developers | 10 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture | Developers | 15 min |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development guidelines | Developers | 10 min |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview | Stakeholders | 5 min |
| [FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md) | All features listed | Testers/PMs | 10 min |

## 🗂️ Component Organization

### Layout Components
```
Layout.jsx
├── Container      # Main container with max-width
├── Section        # Section with title/subtitle
└── Grid          # Responsive grid layout
```

### Form Components
```
FormInputs.jsx
├── Input          # Text/email/password input
├── Select         # Dropdown select
└── Textarea       # Multi-line textarea
```

### Card Components
```
Card.jsx
├── Card           # Main card container
├── CardHeader     # Card header section
├── CardBody       # Card content section
└── CardFooter     # Card footer section
```

### Card Variants
```
ProjectCard.jsx    # Project display card with video
SupervisorCard.jsx # Supervisor profile card
```

## 🔄 Data Flow

### Authentication Flow
```
User Input → Login/Register Page
         ↓
authService.signup/login()
         ↓
Supabase Auth
         ↓
JWT Token + User Profile
         ↓
useAuthStore (update state)
         ↓
Router redirect by role
```

### Project Data Flow
```
StudentProjectsPage mounts
         ↓
useEffect → projectService.getProjects()
         ↓
Supabase query (with RLS)
         ↓
useProjectStore.setProjects()
         ↓
Re-render with data
         ↓
User can search/filter
```

### Request Flow
```
Student clicks "Send Request"
         ↓
requestService.sendRequest()
         ↓
INSERT supervisor_requests
         ↓
CREATE notification
         ↓
Success message
         ↓
Refetch requests
```

## 📊 Database Tables

### user_profiles
- Core user information
- Role assignment
- Account creation tracking

### supervisors
- Supervisor details
- Research interests
- Department assignment
- Experience level

### students
- Student information
- Department enrollment
- Group assignment

### projects
- Project metadata
- YouTube links
- Category classification
- Supervisor assignment

### supervisor_requests
- Student-Supervisor relationships
- Request status tracking
- Unique constraints

### notifications
- User notifications
- Read status
- Timestamp tracking

## 🔐 Security Components

### Row-Level Security (RLS) Policies
- user_profiles: Own profile access
- supervisors: Public viewing, self-edit
- students: Own profile, supervisor access
- projects: Public viewing, creator edit
- supervisor_requests: Bi-directional access
- notifications: Own notifications

### Protected Routes
```javascript
<ProtectedRoute requiredRole="student">
  <StudentProjectsPage />
</ProtectedRoute>
```

## 📦 Dependencies

### Core
- react (18.2.0) - UI library
- react-dom - DOM rendering
- react-router-dom (6.20.0) - Routing

### State & Data
- zustand (4.4.0) - State management
- @supabase/supabase-js (2.38.0) - Backend
- axios (1.6.0) - HTTP client

### Styling
- tailwindcss (3.3.0) - CSS framework
- lucide-react (0.294.0) - Icons

### Dev Dependencies
- vite (5.0.0) - Build tool
- @vitejs/plugin-react - React support
- eslint - Code linting
- postcss, autoprefixer - CSS processing

## 🚀 Quick Command Reference

```bash
# Installation
npm install

# Development
npm run dev         # Start dev server with HMR

# Production
npm run build       # Build for production
npm run preview     # Preview production build

# Code Quality
npm run lint        # Run ESLint
```

## 📱 Page Routes

### Public Routes
```
/                   → HomePage
/login              → LoginPage
/register           → RegisterPage
```

### Student Routes
```
/student/projects   → StudentProjectsPage
/student/supervisors → StudentSupervisorsPage
/student/requests   → StudentRequestsPage
```

### Supervisor Routes
```
/supervisor/requests → SupervisorRequestsPage
```

### Admin Routes
```
/admin/dashboard    → AdminDashboardPage
```

### Shared Routes
```
/notifications      → NotificationsPage
```

## 🎯 Key Features by File

| Feature | Component | Service | Store |
|---------|-----------|---------|-------|
| Authentication | LoginPage, RegisterPage | authService | useAuthStore |
| Projects | StudentProjectsPage, ProjectCard | projectService | useProjectStore |
| Supervisors | StudentSupervisorsPage, SupervisorCard | supervisorService | useSupervisorStore |
| Requests | SupervisorRequestsPage | requestService | useAuthStore |
| Notifications | NotificationsPage | notificationService | useNotificationStore |

## 📖 Getting Help

1. **Quick Start**: Read [QUICKSTART.md](QUICKSTART.md)
2. **Detailed Setup**: Read [SETUP.md](SETUP.md)
3. **How Things Work**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Development**: Read [DEVELOPMENT.md](DEVELOPMENT.md)
5. **Deployment**: Read [DEPLOYMENT.md](DEPLOYMENT.md)
6. **Complete Info**: Read [README.md](README.md)

---

**Ready to explore the codebase? Start with [QUICKSTART.md](QUICKSTART.md)!**
