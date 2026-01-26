# PakLoad - Play Store Deployment Guide

## Prerequisites

1. **Expo Account** - Create at https://expo.dev
2. **Google Play Console Account** - $25 one-time fee at https://play.google.com/console
3. **EAS CLI** - Install globally

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
eas login
```

## Step 3: Configure Project

```bash
cd mobile
eas build:configure
```

---

## Step 4: Build APK (For Testing)

To create an APK for testing on devices:

```bash
eas build -p android --profile preview
```

This will:
- Build an APK file
- Upload to Expo servers
- Provide a download link when complete

**Build time:** ~10-15 minutes

---

## Step 5: Build AAB (For Play Store)

For Play Store submission, you need an Android App Bundle (AAB):

```bash
eas build -p android --profile production
```

---

## Step 6: Download Your Build

After the build completes:
1. Go to https://expo.dev
2. Navigate to your project
3. Click on "Builds"
4. Download the APK or AAB file

---

## Play Store Submission Guide

### 1. Create Google Play Console Accou

1. Go to https://play.google.com/console
2. Pay the $25 registration fee
3. Complete identity verification (takes 24-48 hours)

### 2. Create Your App

1. Click "Create app"
2. Fill in:
   - **App name:** PakLoad
   - **Default language:** English
   - **App or game:** App
   - **Free or paid:** Free
3. Accept policies and create

### 3. Set Up Store Listing

Navigate to **Store presence > Main store listing**:

#### App Details
- **App name:** PakLoad - CPEC Freight & Logistics
- **Short description:** (80 chars max)
  ```
  Book trucks, track shipments & manage freight on Pakistan-China trade routes
  ```
- **Full description:** (4000 chars max)
  ```
  PakLoad is Pakistan's premier freight and logistics platform connecting shippers with carriers across CPEC (China-Pakistan Economic Corridor) routes.

  KEY FEATURES:
  
  🚚 FIND & BOOK LOADS
  • Browse available freight loads in real-time
  • Filter by origin, destination, cargo type
  • Place competitive bids on shipments
  • Track your bookings from pickup to delivery

  📍 CPEC ROUTE COVERAGE
  • Kashgar to Islamabad
  • Urumqi to Lahore  
  • Kashgar to Gwadar
  • Khunjerab to Karachi
  • And more cross-border routes

  💼 FOR CARRIERS
  • Find loads matching your truck capacity
  • Manage your fleet and vehicles
  • Track earnings and completed jobs
  • Build your reputation with ratings

  📦 FOR SHIPPERS
  • Post loads and receive bids
  • Compare carrier quotes
  • Real-time shipment tracking
  • Secure payment processing

  🔔 STAY UPDATED
  • Push notifications for new loads
  • Bid status updates
  • Delivery milestones
  • Payment confirmations

  Whether you're a truck owner looking for freight or a business needing reliable shipping, PakLoad makes logistics simple, transparent, and efficient.

  Download now and join Pakistan's growing freight community!
  ```

#### Graphics Assets Required

| Asset | Size | Format |
|-------|------|--------|
| App icon | 512x512 px | PNG (32-bit) |
| Feature graphic | 1024x500 px | PNG or JPG |
| Phone screenshots | Min 2, 320-3840 px | PNG or JPG |
| 7-inch tablet screenshots | Optional | PNG or JPG |
| 10-inch tablet screenshots | Optional | PNG or JPG |

### 4. Complete App Content

Navigate to **Policy > App content**:

1. **Privacy policy** - Add URL to your privacy policy
2. **Ads** - Select "No, my app does not contain ads"
3. **App access** - Provide test credentials if needed
4. **Content ratings** - Complete questionnaire
5. **Target audience** - Select 18+ (business app)
6. **News apps** - Select "No"
7. **COVID-19 apps** - Select "No"
8. **Data safety** - Complete data collection form

### 5. Set Up Releases

Navigate to **Release > Production**:

1. Click "Create new release"
2. Upload your AAB file
3. Add release notes:
   ```
   Version 1.0.0 - Initial Release
   
   • Browse and search available loads
   • Place bids on shipments
   • Track your bookings in real-time
   • View CPEC route maps
   • Manage your profile and vehicles
   • Push notifications for updates
   ```
4. Review and roll out

### 6. Pricing & Distribution

Navigate to **Monetization > Pricing**:
- Select countries for distribution
- Set app as Free

---

## Automated Submission (Optional)

### Set Up Service Account

1. Go to Google Cloud Console
2. Create a service account
3. Download JSON key file
4. Save as `google-services.json` in mobile folder
5. Grant access in Play Console under **Users and permissions**

### Submit via EAS

```bash
eas submit -p android --latest
```

---

## Timeline

| Step | Duration |
|------|----------|
| EAS Build | 10-15 minutes |
| Play Console setup | 1-2 hours |
| Identity verification | 24-48 hours |
| App review | 1-7 days |

---

## Quick Commands Reference

```bash
# Login to EAS
eas login

# Build APK for testing
eas build -p android --profile preview

# Build AAB for Play Store
eas build -p android --profile production

# Submit to Play Store
eas submit -p android --latest

# Check build status
eas build:list
```

---

## Troubleshooting

### Build Fails
- Check `app.json` for valid configuration
- Ensure all assets exist in `assets/` folder
- Run `npx expo-doctor` to diagnose issues

### Upload Rejected
- Ensure versionCode is incremented for updates
- Check package name matches Play Console
- Verify AAB is signed correctly

---

## Support

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- Play Console Help: https://support.google.com/googleplay/android-developer

---

*Generated for PakLoad v1.0.0*
