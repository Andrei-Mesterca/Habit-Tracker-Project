# Firebase Deployment Guide for Habitual

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. A Firebase account and project (habitual-2d22c)
3. Node.js installed

## Deployment Steps

### Step 1: Build the Frontend

```bash
cd Frontend
npm run build
cd ..
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Deploy to Firebase Hosting

For **frontend only** (if keeping backend running separately):

```bash
firebase deploy --only hosting
```

### Step 4: Update Backend API URL (If Deployed)

If your backend is hosted on a different URL (not localhost), update:

- `Frontend/.env.production` - Set `VITE_API_BASE_URL` to your backend URL
- Rebuild and redeploy

---

## OPTION A: Firebase Hosting Only (Simple)

Backend runs separately (local machine or external server)

**Pros:**

- Simple setup
- Easy to debug locally
- Works with existing backend

**Cons:**

- Backend must be running separately
- Need cross-origin configuration

**Backend Setup:**

1. Ensure `Backend/server.js` is running on your machine/server
2. Backend must be publicly accessible or on same origin
3. Update CORS in `Backend/server.js` to allow your Firebase domain

---

## OPTION B: Firebase Cloud Functions (Advanced)

Backend runs in Firebase cloud

**Requires:**

1. Install Firebase Functions dependencies:

```bash
cd Backend
npm install firebase-functions
```

2. Create `Backend/index.js`:

```javascript
const functions = require("firebase-functions");
const app = require("./server");

exports.api = functions.https.onRequest(app);
```

3. Modify `Backend/server.js`:
   - Remove `app.listen()` call
   - Export `app` instead: `module.exports = app;`

4. Deploy:

```bash
firebase deploy
```

---

## Environment Variables

Your frontend is configured with:

- **Development:** `.env` uses `http://localhost:3000`
- **Production:** `.env.production` uses Firebase Hosting domain

## Troubleshooting

1. **API calls failing after deployment:**
   - Check `VITE_API_BASE_URL` in `.env.production`
   - Ensure backend is accessible from Firebase domain
   - Check CORS settings in Backend

2. **Build failures:**
   - Clear node_modules: `rm -r node_modules` (or delete folder on Windows)
   - Reinstall: `npm install`

3. **Firebase CLI not found:**
   - `npm install -g firebase-tools`
   - Restart terminal

## Accessing Your App

After deployment:

```
https://habitual-2d22c.firebaseapp.com
```

## Current Configuration

Your app is already configured with:

- Project ID: `habitual-2d22c`
- Firebase config in `Frontend/.env` files
- Hosting rules in `firebase.json`
