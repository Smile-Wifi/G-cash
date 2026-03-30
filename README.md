# G-Wallet - Digital Wallet App

A mobile-first digital wallet application built with React, Firebase, and Express.

## Features
- 🔐 **Authentication**: Secure login and registration with Firebase Auth.
- 💰 **Wallet System**: Real-time balance updates, P2P transfers, and Cash In.
- 📱 **Mobile UI**: Responsive, native-like experience with bottom navigation.
- 📊 **Transactions**: Detailed history with filtering and status tracking.
- QR **Payments**: Generate and scan QR codes for instant transfers.
- 🔑 **Admin Panel**: Manage users, monitor transactions, and adjust balances.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Express.js (Vite Middleware).
- **Database**: Firebase Firestore.
- **Auth**: Firebase Authentication.

## Setup Instructions
1. **Firebase Setup**:
   - The app is pre-configured with Firebase.
   - Ensure `firebase-applet-config.json` is present in the root.
2. **Environment Variables**:
   - `GEMINI_API_KEY`: For AI features (if any).
   - `APP_URL`: The hosted URL of the application.
3. **Run Development**:
   ```bash
   npm run dev
   ```
4. **Admin Access**:
   - The user `kaptenlanaja2024@gmail.com` is pre-configured as a default admin in `firestore.rules`.
   - You can manually set the `role` field to `admin` in the `users` collection for any user.

## Deployment
- **GitHub**: Push the code to a repository.
- **Vercel**: Connect your GitHub repo to Vercel. Ensure you add the Firebase config as environment variables or keep the config file.
