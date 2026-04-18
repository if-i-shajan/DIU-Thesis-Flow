# Thesis Management System - Firebase Deployment Script (Windows)
# Automates building and deploying to Firebase Hosting

Write-Host "🚀 Thesis Management System - Firebase Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if dist folder exists
if (Test-Path "dist") {
    Write-Host "✓ dist folder found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Building project..." -ForegroundColor Yellow
    node node_modules/vite/bin/vite.js build
}

# Check if firebase.json exists
if (Test-Path "firebase.json") {
    Write-Host "✓ firebase.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Error: firebase.json not found!" -ForegroundColor Red
    Write-Host "Please run: firebase init hosting" -ForegroundColor Yellow
    exit 1
}

# Check if .firebaserc exists
if (Test-Path ".firebaserc") {
    Write-Host "✓ .firebaserc found" -ForegroundColor Green
} else {
    Write-Host "❌ Error: .firebaserc not found!" -ForegroundColor Red
    Write-Host "Please run: firebase init hosting" -ForegroundColor Yellow
    exit 1
}

# Verify Firebase login
Write-Host ""
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Cyan
firebase projects:list | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase!" -ForegroundColor Red
    Write-Host "Please run: firebase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Firebase authentication OK" -ForegroundColor Green

# Deploy to Firebase
Write-Host ""
Write-Host "📤 Deploying to Firebase Hosting..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
firebase deploy

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your website is now live! 🎉" -ForegroundColor Green
Write-Host ""

# Extract project ID from .firebaserc
$firebaserc = Get-Content ".firebaserc" | ConvertFrom-Json
$projectId = $firebaserc.projects.default

Write-Host "Visit your site at:" -ForegroundColor White
Write-Host "https://$projectId.web.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Alternative URL:" -ForegroundColor White
Write-Host "https://$projectId.firebaseapp.com" -ForegroundColor Cyan
