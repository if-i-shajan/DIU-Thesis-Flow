# 📚 Setup Scripts

Helper scripts to set up and manage the Thesis Management System.

---

## 📝 Available Scripts

### Windows (PowerShell)
```bash
.\scripts\setup-supabase.ps1
```
**What it does:**
- Verifies .env.local exists
- Checks for DATABASE_SCHEMA.sql
- Checks for SAMPLE_DATA.sql
- Provides step-by-step setup instructions
- Optional: Shows file previews

**Requirements:**
- PowerShell 5.0+
- Windows OS

---

### macOS / Linux (Bash)
```bash
bash scripts/setup-supabase.sh
```
**What it does:**
- Same as PowerShell version
- Uses bash for Unix-like systems

**Requirements:**
- Bash shell
- macOS or Linux

---

### Node.js Setup
```bash
node scripts/setup-supabase.js
```
**What it does:**
- Tests Supabase connection
- Verifies credentials
- Provides setup instructions
- Can be run from any OS

**Requirements:**
- Node.js 16+
- @supabase/supabase-js package

---

## 🚀 Quick Start

### Option 1: Automated (Recommended for Windows)
```powershell
cd "path/to/project"
.\scripts\setup-supabase.ps1
```

### Option 2: Automated (macOS/Linux)
```bash
cd path/to/project
bash scripts/setup-supabase.sh
```

### Option 3: Manual Setup
1. Open [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
2. Follow the step-by-step instructions
3. Run SQL files manually in Supabase dashboard

---

## 📋 Manual Setup Checklist

If running scripts:

- [ ] Run setup script
- [ ] Follow printed instructions
- [ ] Log in to Supabase dashboard
- [ ] Open SQL Editor
- [ ] Copy DATABASE_SCHEMA.sql
- [ ] Run in SQL Editor
- [ ] Copy SAMPLE_DATA.sql
- [ ] Run in SQL Editor
- [ ] Verify tables created
- [ ] Test login at http://localhost:3000

---

## 🔧 What Each Script Does

### setup-supabase.ps1 (Windows)
1. Validates environment files exist
2. Reads Supabase URL from .env.local
3. Confirms SQL files present
4. Displays step-by-step setup guide
5. Optional: Shows file previews

**Usage:**
```powershell
.\scripts\setup-supabase.ps1
# Follow the on-screen instructions
```

### setup-supabase.sh (Unix)
1. Same validations as PowerShell
2. Cross-platform compatible
3. Uses bash syntax

**Usage:**
```bash
bash scripts/setup-supabase.sh
# Follow the on-screen instructions
```

### setup-supabase.js (Node.js)
1. Tests Supabase connection
2. Validates credentials
3. Checks database status
4. Provides detailed instructions

**Usage:**
```bash
node scripts/setup-supabase.js
```

---

## ✅ Verification Steps

After running scripts:

1. **Check .env.local**
   ```
   - VITE_SUPABASE_URL should be set
   - VITE_SUPABASE_ANON_KEY should be set
   ```

2. **Verify Files**
   ```
   - DATABASE_SCHEMA.sql (500+ lines)
   - SAMPLE_DATA.sql (100+ lines)
   ```

3. **Test Connection**
   - Visit http://localhost:3000
   - Try login with: student@test.com / password123
   - Check browser console (F12) for errors

---

## 🐛 Troubleshooting

### Script Won't Run (Windows)
**Error:** "cannot be loaded because running scripts is disabled"
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Script Won't Run (macOS/Linux)
**Error:** "Permission denied"
**Solution:**
```bash
chmod +x scripts/setup-supabase.sh
bash scripts/setup-supabase.sh
```

### Missing Files
**Error:** "DATABASE_SCHEMA.sql not found"
**Solution:**
1. Verify you're in project root directory
2. List files: `ls` or `dir`
3. Both SQL files should be visible

### Connection Failed
**Error:** "Cannot connect to Supabase"
**Solution:**
1. Check .env.local has correct URL and key
2. Restart dev server: `npm run dev`
3. Verify Supabase project is active

---

## 📞 Support

For detailed instructions, see:
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) - Complete setup guide
- [README.md](../README.md) - Project overview
- [QUICKSTART.md](../QUICKSTART.md) - 5-minute quick start

---

**Status:** ✅ All scripts ready for use
