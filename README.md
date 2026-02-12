Habitual - Habit Tracking App
A web-based habit tracking application built with Node.js, Express, and Firebase.
Table of Contents

Features
Tech Stack
Getting Started
Project Structure
Environment Variables
Firebase Setup
Running the Application
Team Roles


Tech Stack
Frontend:

HTML5
CSS3
Vanilla JavaScript

Backend:

Node.js
Express.js
Firebase Admin SDK

Database:

Firebase Firestore
Firebase Authentication


Getting Started
Follow these steps to get the project running on your local machine.
Prerequisites
You need the following installed on your computer:

Node.js (v16 or higher)
npm (comes with Node.js)
A Firebase account


Installation Steps
1. Clone the Repository
bashgit clone https://github.com/your-username/habitable.git
cd habitable
2. Install Dependencies
Navigate to the Backend folder and install all required packages:
bashcd Backend
npm install
This will install:

express - Web server framework
cors - Cross-origin resource sharing
firebase-admin - Firebase Admin SDK
dotenv - Environment variable management
bcrypt - Password hashing
jsonwebtoken - JWT token generation

3. Set Up Firebase Project
You need to create your own Firebase project and get credentials:
Step 3.1: Create a Firebase Project

Go to Firebase Console
Click "Add project"
Enter a project name (e.g., "Habitual-YourName")
Follow the setup wizard (you can disable Google Analytics for development)
Click "Create project"

Step 3.2: Enable Firebase Authentication

In your Firebase project, click "Authentication" in the left sidebar
Click "Get started"
Click on "Email/Password" in the Sign-in providers list
Toggle "Enable" to ON
Click "Save"

Step 3.3: Enable Firestore Database

Click "Firestore Database" in the left sidebar
Click "Create database"
Choose "Start in test mode" (for development)

Note: This allows read/write access. Change to production mode later!


Select your preferred region (choose closest to you)
Click "Enable"

Step 3.4: Get Your Service Account Credentials

Click the gear icon (⚙️) next to "Project Overview" → "Project settings"
Go to the "Service accounts" tab
Click "Generate new private key"
Click "Generate key" in the confirmation dialog
A JSON file will download - SAVE THIS FILE SECURELY
⚠️ NEVER commit this file to Git or share it publicly!


4. Create Your .env File
The .env file stores your Firebase credentials securely. This file is NOT included in the repository for security reasons.
Step 4.1: Create the file
In the Backend folder, create a new file named .env:
bash# Make sure you're in the Backend folder
touch .env
Or create it manually:

Right-click in the Backend folder → New File → Name it .env

Step 4.2: Open the downloaded JSON file
Open the Firebase service account JSON file you downloaded. It looks like this:
json{
  "type": "service_account",
  "project_id": "habitual-abc123",
  "private_key_id": "xyz789...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc@habitual-abc123.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
Step 4.3: Copy values to .env
Copy ONLY these three values from the JSON file into your .env file:
envFIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
Example with real values:
envFIREBASE_PROJECT_ID=habitual-abc123
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJT...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@habitual-abc123.iam.gserviceaccount.com
```

**⚠️ Important Notes:**
- Replace the example values with YOUR actual values from the JSON file
- Keep the **double quotes** around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters - they're supposed to be there!
- Put the entire private key on **ONE line** (even though it's very long)
- **NO spaces** around the `=` signs
- **NO empty lines** at the top of the file

##### Step 4.4: Verify your `.env` file

Your `.env` file should have exactly 3 lines that look like this:
```
FIREBASE_PROJECT_ID=something
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...long string...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=something@something.iam.gserviceaccount.com

5. Verify .gitignore Protection
CRITICAL: Make sure your .env file is protected from being committed to Git!
Check if .env is in the .gitignore file:
bashcat Backend/.gitignore
```

You should see:
```
# Env
.env
If .env is NOT there, add it immediately!

Running the Application
Start the Backend Server

Navigate to the Backend folder:

bash   cd Backend

Start the server:

bash   node server.js
```

3. You should see:
```
   SERVER FILE STARTED
   Checking environment variables...
   Project ID: ✓ Found
   Private Key: ✓ Found
   Client Email: ✓ Found
   ✓ Firebase initialized successfully
   Backend running on http://localhost:3000
   Frontend available at http://localhost:3000
```

### Access the Application

Open your browser and go to:
- **Signup:** http://localhost:3000/registry.html
- **Login:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000/dashboard.html (after login)

---

## Project Structure
```
Habitable/
├── Backend/
│   ├── .env                 # ⚠️ NOT in Git - create this yourself
│   ├── .gitignore           # Protects .env from being committed
│   ├── firebase.js          # Firebase initialization
│   ├── server.js            # Express server and API endpoints
│   ├── package.json         # Dependencies
│   └── node_modules/        # Installed packages (not in Git)
│
└── Frontend/
    ├── login.html           # Login page
    ├── registry.html        # Signup page
    ├── dashboard.html       # User dashboard
    ├── registry.js          # Frontend JavaScript
    └── registry.css         # Styling

Environment Variables
The .env file contains sensitive credentials. Never commit this file to Git!
VariableDescriptionExampleFIREBASE_PROJECT_IDYour Firebase project IDhabitual-abc123FIREBASE_PRIVATE_KEYService account private key"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"FIREBASE_CLIENT_EMAILService account emailfirebase-adminsdk-xyz@project.iam.gserviceaccount.com

Common Issues & Troubleshooting
Issue: "Firebase initialization error"
Solution:

Check your .env file exists in the Backend folder
Verify all 3 environment variables are set correctly
Make sure there are no typos or extra spaces

Issue: "auth/configuration-not-found"
Solution:

Enable Authentication in Firebase Console
Make sure Email/Password is enabled

Issue: "Cannot find module 'firebase-admin'"
Solution:
bashcd Backend
npm install
Issue: Login shows "Invalid email or password" for correct credentials
Explanation:

Firebase Admin SDK cannot verify passwords directly
The current implementation only checks if the email exists
Full password verification requires Firebase Client SDK (coming soon)


Security Best Practices

Never commit .env to Git

The .gitignore file protects this
Always verify before pushing


Use different Firebase projects for dev/production

Development: Test mode Firestore
Production: Locked-down security rules


Change Firestore rules before going live

Current rules allow all read/write (development only)
Update to proper authentication-based rules


Rotate your service account keys periodically

Generate new keys every few months
Revoke old keys in Firebase Console




Team Roles
RoleResponsibilitiesBackend DeveloperAPI endpoints, database, Firebase setupFrontend DeveloperUI implementation, client-side logicUI/UX DesignerDesign, mockups, user experienceFeature DeveloperCore habit tracking featuresProject Manager/QATesting, documentation, coordination

Contributing

Create a new branch for your feature:

bash   git checkout -b feature/your-feature-name

Make your changes and commit:

bash   git add .
   git commit -m "Add: description of your feature"

Push your branch:

bash   git push origin feature/your-feature-name

Create a Pull Request on GitHub


License
This project is licensed under the ISC License.

Contact
For questions or issues, contact the team lead or create an issue in the GitHub repository.

Additional Resources

Firebase Documentation
Express.js Documentation
Node.js Documentation
Firestore Security Rules


