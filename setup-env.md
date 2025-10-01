# Environment Setup

To use Google authentication, you need to set up the following environment variables:

## 1. Create a `.env.local` file in the root directory with:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## 2. Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret

## 3. Generate NextAuth Secret:

You can generate a random secret using:
```bash
openssl rand -base64 32
```

Or use any random string generator.

## 4. Start the development server:

```bash
npm run dev
```

The application will now require Google authentication to access the attendance monitoring system.
