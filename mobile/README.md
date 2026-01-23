# PakLoad Mobile App

React Native mobile application for PakLoad logistics platform.

## Features

- 🔐 Authentication (Phone OTP, Email/Password)
- 📦 Find Loads with advanced filters
- 🚛 My Bookings with real-time tracking
- 👤 User Profile management
- 📍 GPS location tracking
- 🔔 Push notifications
- 🌐 Multi-language support (EN, UR, ZH)

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **State Management:** TanStack Query
- **API:** Axios
- **Maps:** React Native Maps
- **Notifications:** Expo Notifications

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
mobile/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Home screen
│   │   ├── loads.tsx    # Find Loads
│   │   ├── bookings.tsx # My Bookings
│   │   └── profile.tsx  # User Profile
│   ├── auth/            # Authentication screens
│   └── _layout.tsx      # Root layout
├── assets/              # Images, fonts, etc.
└── app.json            # Expo configuration
```

## API Configuration

Update the API URL in `app.json`:

```json
{
  "extra": {
    "apiUrl": "http://your-api-url/api/v1"
  }
}
```

## Building for Production

### iOS

```bash
# Build for App Store
eas build --platform ios
```

### Android

```bash
# Build for Play Store
eas build --platform android
```

## Environment Variables

Create `.env` file:

```
API_URL=http://localhost:5000/api/v1
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

See [MOBILE_DEPLOYMENT.md](../docs/MOBILE_DEPLOYMENT.md) for complete deployment guide.
