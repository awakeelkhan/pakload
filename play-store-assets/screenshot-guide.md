# Screenshot Guide for Google Play Store

## Required Screenshots

### Phone Screenshots (1080x1920 or 1440x2560)
Take these screenshots from the mobile app or emulator:

1. **Home Screen** 
   - Show the main dashboard with load listings
   - File: `screenshot-1-home.png`

2. **Post Load**
   - Load posting form with date picker visible
   - File: `screenshot-2-post-load.png`

3. **Find Trucks**
   - Available trucks listing page
   - File: `screenshot-3-find-trucks.png`

4. **Load Details**
   - Detailed view of a load with bid button
   - File: `screenshot-4-load-details.png`

5. **Profile**
   - User profile with stats and quick actions
   - File: `screenshot-5-profile.png`

6. **My Loads**
   - User's posted loads with edit/delete options
   - File: `screenshot-6-my-loads.png`

7. **Payment Methods**
   - Payment methods management screen
   - File: `screenshot-7-payments.png`

8. **Settings**
   - Settings page with 2FA and language options
   - File: `screenshot-8-settings.png`

## How to Take Screenshots

### Using Android Emulator:
1. Run the app: `npx expo start`
2. Press `a` to open in Android emulator
3. Navigate to each screen
4. Press `Ctrl+S` or use the camera icon in emulator sidebar

### Using Physical Device:
1. Connect device via USB
2. Enable USB debugging
3. Run: `adb exec-out screencap -p > screenshot.png`

### Using Expo Go:
1. Open app in Expo Go
2. Take screenshot on device (Power + Volume Down)

## Image Requirements

| Asset | Size | Format |
|-------|------|--------|
| Phone Screenshots | 1080x1920 or 1440x2560 | PNG/JPEG |
| Tablet Screenshots | 1920x1200 or 2560x1600 | PNG/JPEG |
| Feature Graphic | 1024x500 | PNG/JPEG |
| App Icon | 512x512 | PNG (32-bit with alpha) |

## Converting SVG to PNG

Use any of these methods:

### Online:
- https://svgtopng.com/
- https://cloudconvert.com/svg-to-png

### Command Line (with Inkscape):
```bash
inkscape -w 512 -h 512 app-icon-512.svg -o app-icon-512.png
inkscape -w 1024 -h 500 feature-graphic-1024x500.svg -o feature-graphic-1024x500.png
```

### Using ImageMagick:
```bash
convert -background none -size 512x512 app-icon-512.svg app-icon-512.png
convert -background none -size 1024x500 feature-graphic-1024x500.svg feature-graphic-1024x500.png
```
