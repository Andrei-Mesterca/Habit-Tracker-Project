#!/bin/bash
# Quick Deploy Script for Habitual on Firebase

echo "🚀 Starting Habitual Firebase Deployment..."
echo ""

# Step 1: Build Frontend
echo "📦 Building frontend..."
cd Frontend
npm run build
cd ..

if [ $? -eq 0 ]; then
  echo "✅ Frontend built successfully!"
else
  echo "❌ Frontend build failed. Check for errors above."
  exit 1
fi

echo ""

# Step 2: Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment successful!"
  echo "🌐 Your app is live at: https://habitual-2d22c.firebaseapp.com"
else
  echo "❌ Deployment failed. Check your Firebase credentials."
  exit 1
fi
