# University Thesis Management System

A modern, full-stack web application for managing university thesis/final year projects. This system digitizes and automates the process of selecting supervisors and project topics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Features by Role](#features-by-role)
- [Deployment](#deployment)
  
## 👥 Devs

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/if-i-shajan">
        <img src="https://github.com/if-i-shajan.png" width="100px" height="100px" style="object-fit:cover;" alt="Shajan"/>
        <br/>
        <b>J.M. Ifthakharul Islam Shajan</b>
      </a>
      <br/>
      <small>Full Stack Developer</small>
    </td>
    <td align="center">
      <a href="https://github.com/hshasan2004">
        <img src="https://github.com/hshasan2004.png" width="100px" height="100px" style="object-fit:cover;" alt="Hasan"/>
        <br/>
        <b>Mohammad Hasan</b>
      </a>
      <br/>
      <small>Full Stack Developer</small>
    </td>
  </tr>
</table>
  
## ✨ Features

### Core Features

- **Role-Based Access Control (RBAC)**
  - Student role
  - Supervisor role
  - Admin role

- **Authentication**
  - Email & password login/registration
  - Secure JWT-based authentication via Supabase
  - Role-based redirects after login

- **Project Management**
  - Browse projects with detailed descriptions
  - Embedded YouTube video support
  - Search and filter by category
  - Project status tracking

- **Supervisor Matching**
  - View supervisor profiles
  - Search by department and expertise
  - View research areas and experience
  - Send supervisor requests

- **Request Management**
  - Students send requests to supervisors
  - Supervisors accept/reject requests
  - Request status tracking
  - Real-time notifications

- **Notifications System**
  - In-app notification panel
  - Unread notification count
  - Notification types (request, accepted, rejected)
  - Mark as read/delete functionality

- **Modern UI/UX**
  - Responsive design (mobile, tablet, desktop)
  - Tailwind CSS styling
  - Smooth animations and transitions
  - Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row-Level Security (RLS)
  - Real-time subscriptions

### DevTools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📦 Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (free tier available)
- Git for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Thesis Management System"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project
4. Wait for the project to be set up
5. Copy the project URL and anon key

### 4. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:3000
```

### 5. Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the entire content from `DATABASE_SCHEMA.sql`
4. Paste it into the SQL editor
5. Click **Run**
6. (Optional) Load sample data by running `SAMPLE_DATA.sql`

### 6. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── FormInputs.jsx
│   ├── Navigation.jsx
│   ├── ProjectCard.jsx
│   ├── SupervisorCard.jsx
│   ├── Badge.jsx
│   ├── LoadingSpinner.jsx
│   └── Layout.jsx
├── pages/               # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── StudentProjectsPage.jsx
│   ├── StudentSupervisorsPage.jsx
│   ├── SupervisorRequestsPage.jsx
│   ├── NotificationsPage.jsx
│   └── AdminDashboardPage.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication hook
│   └── useFetch.js     # Data fetching hook
├── services/           # API service functions
│   ├── supabase.js     # Supabase client
│   ├── authService.js
│   ├── projectService.js
│   ├── supervisorService.js
│   ├── requestService.js
│   └── notificationService.js
├── context/            # Zustand stores
│   └── store.js        # Global state management
├── utils/              # Utility functions
│   └── ProtectedRoute.jsx
├── styles/             # CSS styles
│   └── globals.css
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_URL` | API base URL (default: https://diuthesisflow.web.app) |

## 🗄️ Database Schema

### Tables

1. **user_profiles**
   - id (UUID, PK)
   - email, full_name
   - role (student/supervisor/admin)

2. **supervisors**
   - id, user_id (FK)
   - department, research_area
   - experience, contact_email

3. **students**
   - id, user_id (FK)
   - department, group_id

4. **projects**
   - id, title, description
   - category, video_link
   - created_by (FK), supervisor_id (FK)

5. **supervisor_requests**
   - id, student_id (FK), supervisor_id (FK)
   - status (pending/accepted/rejected)

6. **notifications**
   - id, user_id (FK)
   - message, type, is_read

### Security
- Row Level Security (RLS) enabled on all tables
- Policies restrict data access by role
- Users can only see their own data (except publicly viewable content)

## 🎯 Features by Role

### Student
- ✅ Browse projects with video support
- ✅ Search and filter projects by category
- ✅ View supervisor profiles
- ✅ Send supervisor requests
- ✅ View request status
- ✅ Receive notifications

### Supervisor
- ✅ View incoming student requests
- ✅ Accept or reject requests
- ✅ View assigned students
- ✅ Receive notifications

### Admin
- ✅ Dashboard with statistics
- ✅ Manage users (students, supervisors)
- ✅ Create/edit/delete projects
- ✅ Add video links to projects
- ✅ Monitor all activities
- ✅ Full system access

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set environment variables
5. Deploy

### Backend (Supabase)

- Supabase automatically hosts your database
- No additional deployment needed

## 📝 Sample Credentials (For Demo)

After running sample data:

```
Student:
Email: student@example.com
Password: password123

Supervisor:
Email: supervisor@example.com
Password: password123

Admin:
Email: admin@example.com
Password: password123
```

## 🔄 API Endpoints (via Supabase)

All operations use Supabase client-side SDK. Examples:

```javascript
// Auth
authService.login(email, password)
authService.signup(email, password, fullName, role)
authService.logout()

// Projects
projectService.getProjects()
projectService.getProjectsByCategory(category)

// Supervisors
supervisorService.getSupervisors()
supervisorService.getSupervisorsByDepartment(department)

// Requests
requestService.sendRequest(studentId, supervisorId)
requestService.updateRequest(requestId, status)

// Notifications
notificationService.getNotifications(userId)
notificationService.markAsRead(notificationId)
```

## 🎨 Styling & Components

### Tailwind CSS Configuration
- Custom color palette (primary, secondary, accent)
- Responsive breakpoints (sm, md, lg)
- Custom shadows and utilities

### Component Library
- **Button** - Multiple variants (primary, secondary, danger, success, outline)
- **Card** - Container component with sections
- **Modal** - Dialog component with configurable sizes
- **Alert** - Status messages (info, success, error)
- **Input/Select/Textarea** - Form controls with validation
- **Badge** - Status indicators
- **LoadingSpinner** - Loading states

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interface
- Optimized for all screen sizes

## 🚨 Error Handling

- Try-catch blocks in all services
- User-friendly error messages
- Toast/Alert notifications
- Form validation
- Loading states

## 🔒 Security Features

- Supabase Authentication (secure JWT)
- Row-Level Security (RLS) policies
- SQL injection prevention (Supabase ORM)
- XSS protection (React sanitization)
- HTTPS in production
- Secure environment variables

## 🌐 Deployment to Firebase Hosting

### Quick Start (15 minutes)

1. **Create Firebase Project**
   - Visit: https://console.firebase.google.com/
   - Click "Add Project"
   - Name: `thesis-management-system`

2. **Get Project ID**
   - Firebase Console → Project Settings
   - Copy your Project ID

3. **Update Configuration**
   - Edit `.firebaserc`
   - Replace `YOUR_FIREBASE_PROJECT_ID` with your Project ID

4. **Login & Deploy**
   ```bash
   firebase login
   .\scripts\deploy-firebase.ps1
   ```

5. **Get Your Live URL**
   ```
   Hosting URL: https://your-project-id.web.app
   ```

### Deployment Options

**Option A: Automated Script (Easiest)**
```powershell
.\scripts\deploy-firebase.ps1
```

**Option B: Manual Commands**
```bash
npm run build
firebase deploy
```

**Option C: NPM Script**
```bash
npm run deploy:firebase
```

### Detailed Guides

- **Full Guide:** [FIREBASE_DEPLOYMENT.md](FIREBASE_DEPLOYMENT.md)
- **Quick Start:** [FIREBASE_QUICK_START.md](FIREBASE_QUICK_START.md)
- **Setup Instructions:** [FIREBASE_HOSTING_SETUP.md](FIREBASE_HOSTING_SETUP.md)

### Deployment Checklist

- [ ] Firebase project created
- [ ] Project ID copied
- [ ] `.firebaserc` updated
- [ ] `firebase login` executed
- [ ] `npm run build` completed
- [ ] `firebase deploy` successful
- [ ] Live URL verified
- [ ] Site loaded in browser

### Build & Deployment Stats

```
Build Size: ~440 KB (122 KB gzipped)
Build Time: 3.25 seconds
Deployment: Instant to Firebase CDN
Performance: Global CDN with automatic SSL/TLS
```

### Post-Deployment

After deployment, your site is live at:
- Main URL: `https://your-project-id.web.app`
- Alternate: `https://your-project-id.firebaseapp.com`

For every update:
```bash
npm run build
firebase deploy
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For support, email support@thesis-management.com or open an issue in the repository.

---

**Happy coding! 🚀**
