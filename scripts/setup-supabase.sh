#!/bin/bash

# Thesis Management System - Supabase Setup Script
# This script provides guided setup for Supabase

echo "🚀 Thesis Management System - Supabase Setup"
echo "==========================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with Supabase credentials"
    exit 1
fi

# Read Supabase URL from .env
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
echo "✓ Supabase URL: $SUPABASE_URL"

# Check if DATABASE_SCHEMA.sql exists
if [ ! -f DATABASE_SCHEMA.sql ]; then
    echo "❌ Error: DATABASE_SCHEMA.sql not found!"
    exit 1
fi

echo ""
echo "📋 DATABASE_SCHEMA.sql found"
echo "   Schemas to create: 6 tables, 30+ RLS policies"
echo ""

# Check if SAMPLE_DATA.sql exists
if [ ! -f SAMPLE_DATA.sql ]; then
    echo "❌ Error: SAMPLE_DATA.sql not found!"
    exit 1
fi

echo "✓ SAMPLE_DATA.sql found"
echo "   Sample users: Student, Supervisor, Admin"
echo ""

echo "==========================================="
echo "📖 Setup Instructions:"
echo "==========================================="
echo ""
echo "1️⃣  Open Supabase Dashboard"
echo "    https://app.supabase.com"
echo ""
echo "2️⃣  Select your project"
echo ""
echo "3️⃣  Go to SQL Editor → New Query"
echo ""
echo "4️⃣  Copy DATABASE_SCHEMA.sql content"
echo "    cat DATABASE_SCHEMA.sql"
echo ""
echo "5️⃣  Paste into Supabase SQL Editor and click Run"
echo ""
echo "6️⃣  Create another query and run SAMPLE_DATA.sql"
echo "    cat SAMPLE_DATA.sql"
echo ""
echo "7️⃣  Test login at http://localhost:3000"
echo "    Email: student@test.com"
echo "    Password: password123"
echo ""
echo "==========================================="
echo "✅ Setup instructions complete!"
echo "==========================================="
