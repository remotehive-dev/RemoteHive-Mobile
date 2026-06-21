# RemoteHive Mobile

Android app for RemoteHive — remote job board & talent platform. React Native (Expo SDK 56).

## Quick Start

```bash
npm install --legacy-peer-deps
npx expo start
```

## Download APK

Scan the QR below to download and install the APK directly on your phone (enable "Install from unknown sources" if prompted).

![Download APK](./assets/qr-download.png)

Or download from the link: [RemoteHive APK](https://expo.dev/artifacts/eas/0YVReNWcRAXLDIcOOU5n5FaglaOw9xw7UWYuiIei_68.apk)

> **For live development:** Run `npx expo start` and scan the QR from the terminal with **Expo Go** (install from Play Store).

## Without Android Studio (Physical Phone)

| Method | How |
|--------|-----|
| **Expo Go** (easiest) | `npx expo start` → scan QR from terminal with Expo Go app |
| **EAS APK** | `eas build --platform android --profile preview` → download + install |
| **Android Studio** | `npx expo run:android` (requires full Android SDK setup) |

## Env Variables

All set in `.env`. Uses the same Clerk + Supabase credentials as the web frontend:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=...
EXPO_PUBLIC_SUPABASE_URL=https://kvpgsbnwzsqflkeihnyo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_DJANGO_API_URL=https://admin.remotehive.in
```

## Stack

- **Framework:** React Native (Expo SDK 56)
- **Auth:** Clerk (`@clerk/clerk-expo`)
- **DB:** Supabase (reads), Django REST API (writes with validation)
- **Routing:** Expo Router (file-based)
- **State:** TanStack React Query
