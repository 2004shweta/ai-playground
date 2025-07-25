# Google OAuth Setup

To enable Google login/signup, add the following to your backend/.env file:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

Replace the values with your credentials from the Google Cloud Console. 