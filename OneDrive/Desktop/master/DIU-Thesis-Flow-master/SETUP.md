# Thesis Management System - Setup Guide

## Quick Start Guide

This guide will help you set up and run the Thesis Management System locally.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up or log in
4. Create a new project
5. Wait for project initialization (2-3 minutes)

## Step 3: Get Supabase Keys

1. In Supabase dashboard, go to **Project Settings** > **API**
2. Copy:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon public` key (VITE_SUPABASE_ANON_KEY)

## Step 4: Configure Environment

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_API_URL=http://localhost:3000
```

Replace with your actual Supabase URL and keys.

## Step 5: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire content from `DATABASE_SCHEMA.sql` file
4. Paste into the SQL editor
5. Click **Run**
6. Wait for schema creation to complete

## Step 6: Load Sample Data (Optional)

1. In SQL Editor, click "New Query"
2. Copy entire content from `SAMPLE_DATA.sql` file
3. Paste into the SQL editor
4. Click **Run**

## Step 7: Enable Authentication

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled (it should be by default)
3. Go to **Settings** > configure email templates if needed

## Step 8: Start Development Server

```bash
npm run dev
```

The app will automatically open at http://localhost:3000

## Step 9: Access the Application

### Test Credentials (After sample data load):

```
Student Account:
Email: student@example.com
Password: password123

Supervisor Account:
Email: supervisor@example.com
Password: password123

Admin Account:
Email: admin@example.com
Password: password123
```

## Troubleshooting

### "VITE_SUPABASE_URL is not defined"
- Check that `.env.local` file exists in root directory
- Verify environment variable names are exactly as shown
- Restart the dev server after creating `.env.local`

### "Connection refused" error
- Verify Supabase URL is correct
- Check internet connection
- Ensure Supabase project is active

### Database errors
- Verify SQL schema was executed successfully
- Check Supabase SQL Editor for any error messages
- Ensure all tables were created

### Authentication issues
- Clear browser cookies and localStorage
- Try incognito/private browsing mode
- Verify email provider is enabled in Supabase

## Next Steps

1. Customize user profiles after login
2. Create your own projects as supervisor
3. Send supervisor requests as student
4. Monitor requests from supervisor dashboard
5. Check notifications in real-time

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components for routes
├── hooks/         # Custom React hooks
├── services/      # API service layer
├── context/       # Zustand state management
├── utils/         # Utility functions
├── styles/        # Global CSS
└── App.jsx        # Main app component
```

## Features Overview

### For Students
- Browse available projects
- Watch project videos
- Search and filter projects
- View supervisor profiles
- Send supervisor requests
- Track request status

### For Supervisors
- Receive student requests
- Accept or reject requests
- View assigned students
- Track managed projects

### For Admins
- Dashboard with statistics
- Manage all users
- Create and manage projects
- Add video links
- System administration

## Video Integration

Projects support YouTube video links. When adding a project:

1. Get YouTube video URL (format: https://www.youtube.com/watch?v=VIDEO_ID)
2. Add to project's `video_link` field
3. Video will automatically embed in project card

## Need Help?

- Check the full README.md for comprehensive documentation
- Review DATABASE_SCHEMA.sql for database structure
- Check service files in `src/services/` for API examples
- Refer to Supabase docs: https://supabase.com/docs

## Security Notes

- Never commit `.env.local` with real keys
- Supabase Row-Level Security policies are enabled
- All user data is protected by authentication
- Use HTTPS in production

---

Enjoy building your thesis management system! 🚀
