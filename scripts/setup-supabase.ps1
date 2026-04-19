Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Supabase setup guide (Windows)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    Write-Host "Missing .env.local file." -ForegroundColor Red
    Write-Host "Create it from .env.example and add Supabase credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Open Supabase Dashboard: https://app.supabase.com" -ForegroundColor Yellow
Write-Host "2. Open SQL Editor in your project." -ForegroundColor Yellow
Write-Host "3. Run DATABASE_SCHEMA.sql from this repository." -ForegroundColor Yellow
Write-Host "4. Optionally run SAMPLE_DATA.sql for demo users/data." -ForegroundColor Yellow
Write-Host "5. Verify .env.local has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." -ForegroundColor Yellow
Write-Host "" 
Write-Host "Run automatic connectivity check:" -ForegroundColor Cyan
Write-Host "npm run check:supabase" -ForegroundColor White
