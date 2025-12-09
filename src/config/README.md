# NYC Live Events - Configuration Guide

## Environment Variables

This application uses environment variables to securely store API keys and configuration settings.

### Setup Instructions

1. Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual credentials:

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key with billing enabled | `AIzaSy...` |
| `VITE_API_URL` | Backend API endpoint URL | `http://192.168.1.116:8000` |

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Enable **Billing** (required for Maps API)
5. Create credentials (API Key)
6. Copy the API key to your `.env` file

### Security Notes

- **NEVER** commit the `.env` file to version control
- The `.env` file is listed in `.gitignore` to prevent accidental commits
- Use `.env.example` as a template for other developers
- For production, use your hosting platform's environment variable settings

### Accessing Environment Variables in Code

```typescript
// ✅ Correct way to access environment variables
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL;
```

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the browser.
