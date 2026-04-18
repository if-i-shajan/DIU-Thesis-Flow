# 🚀 Supabase Setup Guide

Complete this guide to set up your Thesis Management System with Supabase.

---

## ✅ Prerequisites

- ✓ Supabase account created (you already have the project)
- ✓ Supabase URL: `https://svrkqmhyggwggcfrlcoi.supabase.co`
- ✓ Anon Public Key: Already in `.env.local`
- ✓ Project is running on http://localhost:3000

---

## 📋 Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in with your account
3. Select your project: **Thesis Management System**

---

## 🗄️ Step 2: Create Database Schema

### 2.1 Open SQL Editor

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the **entire content** from `DATABASE_SCHEMA.sql` file in your project
4. Paste it into the SQL Editor
5. Click **Run** button

**What this does:**
- Creates 6 tables (user_profiles, supervisors, students, projects, supervisor_requests, notifications)
- Adds 30+ Row-Level Security (RLS) policies
- Creates 10+ performance indexes
- Sets up 6 automatic timestamp triggers
- Enables real-time capabilities

---

## 🎯 Step 3: Load Sample Data

### 3.1 Insert Test Data

1. Open **New Query** in SQL Editor again
2. Copy the **entire content** from `SAMPLE_DATA.sql` file in your project
3. Paste it into the SQL Editor
4. Click **Run** button

**What this does:**
- Creates 3 test users (Student, Supervisor, Admin)
- Creates sample projects
- Adds supervisor data
- Provides test data for development

### 3.2 Test Users Created

| Role | Email | Password |
|------|-------|----------|
| **Student** | `student@test.com` | `password123` |
| **Supervisor** | `supervisor@test.com` | `password123` |
| **Admin** | `admin@test.com` | `password123` |

---

## 🔐 Step 4: Enable Authentication

### 4.1 Authentication Settings

1. Go to **Authentication** → **Providers** in Supabase
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs:**
   ```
   http://localhost:3000/
   http://localhost:3000/login
   http://localhost:3000/student/projects
   http://localhost:3000/supervisor/requests
   http://localhost:3000/admin/dashboard
   ```

### 4.2 JWT Settings (for Production)

1. Go to **Authentication** → **JWT** 
2. Copy your JWT Secret (you'll need this for production deployment)
3. Keep it safe - don't share it

---

## ✨ Step 5: Enable Real-Time (Optional but Recommended)

### 5.1 Real-Time for Notifications

1. Go to **Database** → **Replication**
2. Under **Replication** section, find `notifications` table
3. Toggle **Real-time** to **ON**
4. Also enable for `supervisor_requests` table

This allows live notifications without page refresh.

---

## 🧪 Step 6: Test the Connection

### 6.1 Verify App Connection

1. Go to http://localhost:3000
2. Try to **Register** with a new account
   - Email: `teststudent@example.com`
   - Password: `Test123!@#`
   - Role: Student
   - Department: Computer Science

3. If successful:
   - You'll see confirmation message
   - You can then login with that account
   - Dashboard will appear

### 6.2 Test with Sample Users

1. Go to http://localhost:3000/login
2. Try logging in with:
   - Email: `student@test.com`
   - Password: `password123`

3. You should be redirected to Student Dashboard

---

## 🔑 Step 7: Storage Setup (Optional for file uploads)

If you want to add project file uploads:

1. Go to **Storage** in Supabase
2. Create new bucket: `thesis-uploads`
3. Make it **Public** or **Private** (your choice)
4. Keep default settings for now

---

## 🚀 Step 8: Environment Configuration

Your `.env.local` already has:
```
VITE_SUPABASE_URL=https://svrkqmhyggwggcfrlcoi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3000
```

**For Production** add to `.env.production`:
```
VITE_SUPABASE_URL=https://svrkqmhyggwggcfrlcoi.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Database schema created (check **Tables** section in Supabase)
- [ ] 6 tables visible: user_profiles, supervisors, students, projects, supervisor_requests, notifications
- [ ] RLS policies enabled (check each table's **RLS** settings)
- [ ] Sample data loaded (check row counts)
- [ ] Email authentication enabled
- [ ] Can register new user at http://localhost:3000/register
- [ ] Can login at http://localhost:3000/login
- [ ] Student dashboard loads without errors
- [ ] Real-time notifications working (optional)

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'supabase'"
**Solution:** Run `npm install @supabase/supabase-js`

### Issue: Authentication fails
**Solution:** 
1. Check `.env.local` has correct Supabase URL and key
2. Verify Supabase project is active
3. Restart the dev server: `npm run dev`

### Issue: "ANON key is required"
**Solution:**
1. Go to Supabase Settings
2. Copy your Anon Public key
3. Add to `.env.local`
4. Restart dev server

### Issue: RLS policy errors
**Solution:**
1. This is expected if policies didn't load in Step 2
2. Run DATABASE_SCHEMA.sql again completely

### Issue: "Relation does not exist"
**Solution:**
1. Database schema wasn't fully executed
2. Run DATABASE_SCHEMA.sql again
3. Verify all 6 tables exist in Supabase

---

## 📞 Getting Help

1. **Check Supabase Docs:** https://supabase.com/docs
2. **Check App Logs:** Browser Console (F12) and Terminal
3. **Database Logs:** Supabase → Logs → Database
4. **Auth Logs:** Supabase → Logs → Auth

---

## 🎉 Success!

Once completed:
- Your app is fully connected to Supabase
- You can register and login users
- All features are functional
- Ready for production deployment

---

## 📝 Next Steps

1. **Test all features** with sample users
2. **Create your own account** for testing
3. **Customize branding** in the code
4. **Deploy to production** (see DEPLOYMENT.md)

---

**Status:** ✅ Ready for Supabase Setup
