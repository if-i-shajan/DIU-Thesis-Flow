# Thesis Management System - Supabase Setup Script (Windows)
# Run this script to get Supabase setup instructions

Write-Host "🚀 Thesis Management System - Supabase Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with Supabase credentials"
    exit 1
}

# Read Supabase URL from .env.local
$envContent = Get-Content ".env.local"
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=").ToString().Split("=")[1]

Write-Host "✓ Supabase URL: $supabaseUrl" -ForegroundColor Green

# Check if DATABASE_SCHEMA.sql exists
if (-not (Test-Path "DATABASE_SCHEMA.sql")) {
    Write-Host "❌ Error: DATABASE_SCHEMA.sql not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 DATABASE_SCHEMA.sql found" -ForegroundColor Green
Write-Host "   Schemas to create: 6 tables, 30+ RLS policies"
Write-Host ""

# Check if SAMPLE_DATA.sql exists
if (-not (Test-Path "SAMPLE_DATA.sql")) {
    Write-Host "❌ Error: SAMPLE_DATA.sql not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ SAMPLE_DATA.sql found" -ForegroundColor Green
Write-Host "   Sample users: Student, Supervisor, Admin"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📖 Setup Instructions:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Open Supabase Dashboard" -ForegroundColor Yellow
Write-Host "    https://app.supabase.com" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Select your project" -ForegroundColor Yellow
Write-Host ""

Write-Host "3️⃣  Go to SQL Editor → New Query" -ForegroundColor Yellow
Write-Host ""

Write-Host "4️⃣  Copy DATABASE_SCHEMA.sql content" -ForegroundColor Yellow
Write-Host "    Path: .\DATABASE_SCHEMA.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  Paste into Supabase SQL Editor and click Run" -ForegroundColor Yellow
Write-Host ""

Write-Host "6️⃣  Create another query and run SAMPLE_DATA.sql" -ForegroundColor Yellow
Write-Host "    Path: .\SAMPLE_DATA.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "7️⃣  Test login at http://localhost:3000" -ForegroundColor Yellow
Write-Host "    Email: student@test.com" -ForegroundColor Gray
Write-Host "    Password: password123" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Setup instructions complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Optional: Display file contents
$showFiles = Read-Host "Display DATABASE_SCHEMA.sql preview? (y/n)"
if ($showFiles -eq "y") {
    Write-Host ""
    Write-Host "📄 DATABASE_SCHEMA.sql Preview (first 50 lines):" -ForegroundColor Cyan
    Get-Content "DATABASE_SCHEMA.sql" -TotalCount 50 | Write-Host
    Write-Host "... (file continues)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 For detailed instructions, see: SUPABASE_SETUP.md" -ForegroundColor Cyan
