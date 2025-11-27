# Firebase Setup Guide for Al-Hikmah

This guide explains how to set up Firebase Authentication and Firestore for the Al-Hikmah application.

## 1. Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project**.
3.  Enter a project name (e.g., `al-hikmah-ai`) and follow the setup steps.
4.  (Optional) Disable Google Analytics if you don't need it.

## 2. Register Your App

1.  In the Project Overview, click the **Web** icon (`</>`) to add a web app.
2.  Register the app with a nickname (e.g., `Al-Hikmah Web`).
3.  Click **Register app**.
4.  You will see your `firebaseConfig` object. Keep this tab open or copy the values; you will need them for your `.env.local` file.

## 3. Enable Authentication (Critical)

This step fixes the `auth/configuration-not-found` error.

1.  In the left sidebar, click **Build** > **Authentication**.
2.  Click **Get started**.
3.  Select the **Sign-in method** tab.
4.  Click **Google**.
5.  Toggle **Enable** to the ON position.
6.  Set the **Project support email**.
7.  Click **Save**.

**Important**: If you are running the app locally (`localhost`), you usually don't need to add it to authorized domains as it's there by default. However, if you deploy, ensure your domain is listed in **Settings** > **Authorized domains**.

## 4. Enable Firestore Database

This is required for storing chat history.

1.  In the left sidebar, click **Build** > **Firestore Database**.
2.  Click **Create database**.
3.  Choose a location (e.g., `nam5 (us-central)`).
4.  Start in **Test mode** (for development) or **Production mode**.
    *   *Test mode* allows open access for 30 days.
    *   *Production mode* requires security rules.
5.  Click **Create**.

### Firestore Security Rules (Recommended for Production)
If you start in production mode, use these rules to allow authenticated users to read/write their own data.

I have created a `firestore.rules` file in your project root with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

To deploy these rules, you need to be logged in and have the project selected.

1.  **Login to Firebase:**
    ```bash
    npx firebase-tools login
    ```
2.  **Deploy Rules:**
    ```bash
    npx firebase-tools deploy --only firestore:rules
    ```

Or copy the content of `firestore.rules` into the **Rules** tab of the Firestore section in the Firebase Console.

## 5. Configure Environment Variables

1.  Create a file named `.env.local` in the root of your project.
2.  Copy the values from your Firebase config (Step 2) into this file using the following keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

3.  Restart your development server:
    ```bash
    npm run dev
    ```

## Troubleshooting

-   **Error: `auth/configuration-not-found`**: Ensure you have enabled the **Google** sign-in provider in the Authentication tab (Step 3).
-   **Error: `auth/unauthorized-domain`**: Add your domain (e.g., `localhost` or your deployed URL) to the Authorized Domains list in Firebase Console > Authentication > Settings.
