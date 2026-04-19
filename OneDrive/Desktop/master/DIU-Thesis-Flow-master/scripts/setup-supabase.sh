#!/usr/bin/env bash

set -e

echo "=================================================="
echo "Supabase setup guide (macOS/Linux)"
echo "=================================================="

if [ ! -f .env.local ]; then
    echo "Missing .env.local file."
    echo "Create it from .env.example and add Supabase credentials."
    exit 1
fi

echo "1. Open Supabase Dashboard: https://app.supabase.com"
echo "2. Open SQL Editor in your project."
echo "3. Run DATABASE_SCHEMA.sql from this repository."
echo "4. Optionally run SAMPLE_DATA.sql for demo users/data."
echo "5. Verify .env.local has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
echo
echo "Run automatic connectivity check:"
echo "npm run check:supabase"
