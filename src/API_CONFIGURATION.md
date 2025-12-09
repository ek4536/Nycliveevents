# API Configuration Guide

## Overview

The NYC Live Events app supports loading data from a backend API with automatic fallback to sample data for prototyping.

## Current Configuration

- **API Endpoint**: `http://192.168.1.116:8000/events`
- **Timeout**: 3 seconds
- **Fallback**: 300 sample events
- **Error Logging**: Disabled (for clean prototype experience)

## Enabling API Debugging

To see API connection logs and errors, edit `/utils/apiLoader.ts`:

```typescript
// Change this line from false to true
const ENABLE_API_LOGGING = true;
```

With logging enabled, you'll see:
- ✅ API connection attempts
- ✅ Successful data loads
- ⚠️ Connection errors and failures

## Using Environment Variables

You can override the default API URL using environment variables:

1. Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://your-api-url:port
   ```

2. The app will use this URL instead of the default

## API Response Format

The backend API should return events in one of these formats:

**Option 1: Array of events**
```json
[
  {
    "id": "evt-123",
    "title": "Jazz Night",
    "category": "Music",
    "source": "Eventbrite",
    "borough": "Manhattan",
    "timestamp": "2025-12-15T19:30:00Z",
    "address": "123 Main St, Manhattan, NY",
    "lat": 40.7589,
    "lng": -73.9851
  }
]
```

**Option 2: Object with events property**
```json
{
  "events": [ /* array of event objects */ ],
  "total": 300,
  "page": 1
}
```

## Field Mapping

The app maps various API field names to its internal structure:

| Internal Field | API Alternatives |
|---------------|------------------|
| `id` | `id`, `_id` |
| `title` | `title`, `name` |
| `timestamp` | `timestamp`, `date`, `created_at` |
| `borough` | `borough`, `location.borough` |
| `address` | `address`, `location.address` |
| `lat` | `lat`, `latitude`, `location.lat` |
| `lng` | `lng`, `longitude`, `location.lng` |

## Prototype Mode (Current)

- API errors are **silently suppressed**
- App immediately uses **300 sample events**
- **No error messages** in console or UI
- **Clean user experience** for testing and demos

## Production Mode

When your backend is ready:

1. Set `ENABLE_API_LOGGING = true` in `/utils/apiLoader.ts`
2. Verify API connection in console
3. Once stable, set `ENABLE_API_LOGGING = false` for production

## Testing API Integration

1. Start your backend API server
2. Enable API logging (see above)
3. Refresh the app
4. Check console for connection logs
5. If successful, you'll see: `✅ Successfully loaded X events from API`

## Fallback Behavior

The app **always works**, even without a backend:
- Backend online ✅ → Uses real API data
- Backend offline ⚠️ → Uses 300 sample events
- Seamless transition, no user interruption
