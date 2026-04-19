# ⚡ Quick Setup Reference - Supabase

**Status:** 🟢 Ready to Setup
**Time Required:** 10 minutes
**Difficulty:** ⭐ Easy

---

## 📍 You Are Here

```
✅ Project Created & Running
✅ Code Pushed to GitHub
👉 NEXT: Setup Supabase (10 min)
```

---

## 🎯 Your Next Steps (Pick One)

### Option A: Windows - Run Setup Script (RECOMMENDED)
```powershell
# Open PowerShell in project folder and run:
.\scripts\setup-supabase.ps1

# Follow the on-screen instructions
```

### Option B: macOS/Linux - Run Setup Script
```bash
# Open Terminal in project folder and run:
bash scripts/setup-supabase.sh

# Follow the on-screen instructions
```

### Option C: Manual Setup (All Platforms)
Follow this checklist step-by-step (see below)

---

## 📋 Manual Setup Checklist

### Step 1: Open Supabase Dashboard ⏱️ 1 min
- [ ] Go to https://app.supabase.com
- [ ] Sign in with your account
- [ ] Select project: **Thesis Management System**
- [ ] You should see project dashboard

### Step 2: Create Database Schema ⏱️ 3 min
- [ ] Click **SQL Editor** (left sidebar)
- [ ] Click **New Query**
- [ ] Open your local `DATABASE_SCHEMA.sql` file
- [ ] Copy **ENTIRE** content
- [ ] Paste into SQL Editor
- [ ] Click **Run** button (blue)
- [ ] Wait for success message
- [ ] ✅ 6 tables created!

### Step 3: Load Sample Data ⏱️ 2 min
- [ ] Click **New Query** again in SQL Editor
- [ ] Open your local `SAMPLE_DATA.sql` file
- [ ] Copy **ENTIRE** content
- [ ] Paste into new SQL Editor
- [ ] Click **Run** button
- [ ] Wait for success message
- [ ] ✅ Test data loaded!

### Step 4: Test Login ⏱️ 2 min
- [ ] Go to http://localhost:3000
- [ ] Click **Login**
- [ ] Use demo credentials:
  ```
  Email:    student@test.com
  Password: password123
  ```
- [ ] Click **Login** button
- [ ] ✅ You should see Student Dashboard!

### Step 5: Verify Success ⏱️ 2 min
- [ ] Check you're logged in
- [ ] You see student dashboard
- [ ] Try navigating to:
  - [ ] Projects page
  - [ ] Supervisors page
  - [ ] Requests page
- [ ] All pages load without errors
- [ ] ✅ Setup Complete!

---

## 🧪 Alternative Test Users

After loading sample data, you can also test as:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| 👤 Student | `student@test.com` | `password123` | /student/projects |
| 👨‍🏫 Supervisor | `supervisor@test.com` | `password123` | /supervisor/requests |
| 👨‍💼 Admin | `admin@test.com` | `password123` | /admin/dashboard |

---

## ✅ Success Indicators

You'll know setup is complete when:

```
✅ Can login at http://localhost:3000
✅ Student dashboard shows empty project list
✅ No errors in browser console (F12)
✅ Can see all menu items in navigation
✅ Pages load quickly without lag
✅ Can view notifications section
```

---

## 🚨 If Something Goes Wrong

### Login page shows "Invalid credentials"
- [ ] Verify sample data was loaded (Step 3)
- [ ] Check that SQL ran successfully (no errors)
- [ ] Try demo email again exactly: `student@test.com`

### "Cannot connect to Supabase"
- [ ] Check .env.local has correct credentials
- [ ] Restart dev server: `npm run dev`
- [ ] Verify Supabase project is active

### "Table does not exist"
- [ ] Run DATABASE_SCHEMA.sql again
- [ ] Verify all SQL executed successfully
- [ ] Check Supabase Tables section shows 6 tables

### "AuthApiError: Invalid API Key"
- [ ] Go to Supabase Settings
- [ ] Copy your **Anon Public Key**
- [ ] Update .env.local with correct key
- [ ] Restart dev server

---

## 📞 Need Help?

**Full Documentation:**
- 📖 [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed guide
- 📖 [README.md](README.md) - Project overview
- 📖 [QUICKSTART.md](QUICKSTART.md) - Quick start

**Check These First:**
1. Browser console (F12) - look for errors
2. Network tab (F12) - check API calls
3. Supabase logs - SQL errors
4. Project terminal - server errors

---

## ⏱️ Timeline

```
📅 Day 1:
  ✅ 10:00 - Run setup script (10 min)
  ✅ 10:10 - All set!
  
🚀 Ready for Development!
```

---

## 🎉 Next After Setup

Once Supabase is configured:

1. **Explore Features**
   - Try each user role
   - Test all pages
   - Explore functionality

2. **Customize**
   - Change colors in tailwind.config.js
   - Update text and content
   - Add your branding

3. **Add More Data**
   - Create test projects
   - Add more supervisors
   - Test workflows

4. **Deploy** (Optional)
   - See DEPLOYMENT.md
   - Push to Vercel
   - Custom domain

---

## 📊 Project Structure After Setup

```
Thesis Management System/
├── .env.local                    ← Supabase credentials ✅
├── DATABASE_SCHEMA.sql           ← Create tables ✅
├── SAMPLE_DATA.sql               ← Test data ✅
├── src/
│   ├── services/
│   │   └── supabase.js          ← Connected ✅
│   └── pages/
│       ├── LoginPage.jsx         ← Working ✅
│       └── StudentProjectsPage   ← Ready ✅
└── scripts/
    └── setup-supabase.ps1        ← Can re-run anytime
```

---

**Current Time: ~10 minutes until complete setup!** ⏱️

**Estimated Completion:** 10 minutes from now

**Next Command:** See above for your chosen setup method

Good luck! 🚀
