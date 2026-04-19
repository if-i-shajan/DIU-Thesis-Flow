# Quick Start - 5 Minute Setup

Get the Thesis Management System up and running in just 5 minutes!

## Prerequisites (1 minute)
- Node.js 16+ installed
- npm or yarn
- Supabase account (free at supabase.com)

## Step 1: Copy Environment File (30 seconds)

```bash
cp .env.example .env.local
```

## Step 2: Get Supabase Keys (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or sign in
3. Go to **Project Settings > API**
4. Copy your project URL and anon key
5. Edit `.env.local`:

```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_API_URL=http://localhost:3000
```

## Step 3: Setup Database (1 minute)

1. In Supabase, go to **SQL Editor > New Query**
2. Copy entire content from `DATABASE_SCHEMA.sql`
3. Paste and click **Run**
4. (Optional) Repeat with `SAMPLE_DATA.sql` for demo data

## Step 4: Install & Run (1 minute)

```bash
npm install
npm run dev
```

That's it! 🎉 Your app is now running at http://localhost:3000

## Demo Credentials (If using sample data)

```
Student: student@example.com / password123
Supervisor: supervisor@example.com / password123
Admin: admin@example.com / password123
```

## Next Steps

- Explore the app interface
- Read [SETUP.md](SETUP.md) for detailed instructions
- Check [README.md](README.md) for complete features
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

## Troubleshooting

### "Cannot find module" error
```bash
rm -rf node_modules package-lock.json
npm install
```

### "VITE_SUPABASE_URL not defined"
- Check `.env.local` file exists
- Verify variable names are exact
- Restart dev server

### Database errors
- Verify SQL script executed without errors
- Check Supabase dashboard for issues
- Try running schema again

## Support

- See [SETUP.md](SETUP.md) for detailed setup
- Check [README.md](README.md) for full documentation
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for dev guidelines

---

**Everything working? Start building! 🚀**
