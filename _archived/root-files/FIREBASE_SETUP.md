# Firebase Setup Guide for TV Shows Ranked

## 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Add project"
- Name it `tvshows-ranked` (or similar)
- Disable Google Analytics (not needed)
- Click "Create project"

## 2. Enable Authentication
- In the Firebase console sidebar, go to **Build > Authentication**
- Click "Get started"
- Go to the **Sign-in method** tab
- Enable **Google** — set a project support email, save
- Enable **Email/Password** — just toggle it on, save

## 3. Add Your Domain to Authorized Domains
- Still in Authentication > **Settings** tab > **Authorized domains**
- Add whatever domain you're hosting the app on (localhost is already there for dev)

## 4. Create Firestore Database
- In sidebar, go to **Build > Firestore Database**
- Click "Create database"
- Choose **production mode**
- Pick a region close to you (e.g. `us-east1`)
- Click "Enable"

## 5. Set Security Rules
- In Firestore, go to the **Rules** tab
- Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
- Click **Publish**

## 6. Get the Web App Config
- Click the **gear icon** (Project Settings) in the sidebar
- Scroll down to "Your apps" > click the **web icon** (`</>`)
- Register the app (nickname: `tvshows-ranked-web`)
- Copy the `firebaseConfig` object it gives you

## 7. Paste the Config into the Code
- Open `index.html`
- Find the placeholder near the top of the `<script>` tag:

```js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

- Replace it with the real config you copied from Firebase

**Done — the app should now support sign-in and cloud sync.**
