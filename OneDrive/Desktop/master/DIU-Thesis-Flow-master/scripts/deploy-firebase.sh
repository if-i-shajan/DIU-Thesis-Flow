#!/bin/bash

# Thesis Management System - Firebase Deployment Script
# Automates building and deploying to Firebase Hosting

echo "🚀 Thesis Management System - Firebase Deployment"
echo "=================================================="

# Check if dist folder exists
if [ -d "dist" ]; then
    echo "✓ dist folder found"
else
    echo "⚠️  Building project..."
    npm run build
fi

# Check if firebase.json exists
if [ -f "firebase.json" ]; then
    echo "✓ firebase.json found"
else
    echo "❌ Error: firebase.json not found!"
    echo "Please run: firebase init hosting"
    exit 1
fi

# Check if .firebaserc exists
if [ -f ".firebaserc" ]; then
    echo "✓ .firebaserc found"
else
    echo "❌ Error: .firebaserc not found!"
    echo "Please run: firebase init hosting"
    exit 1
fi

# Deploy to Firebase
echo ""
echo "📤 Deploying to Firebase Hosting..."
echo "=================================================="
firebase deploy

echo ""
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "Your website is now live! 🎉"
echo ""
echo "Visit your site at:"
echo "https://$(grep -oP '(?<="default": ")[^"]+' .firebaserc).web.app"
