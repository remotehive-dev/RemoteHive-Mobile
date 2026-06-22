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

Or download: [RemoteHive APK (latest build)](https://expo.dev/artifacts/eas/D78pzoC3m1IFsLCjcPgv-7j0yWT4oKgw4T6wPaYUCWU.apk)

> **Auto-build:** Every push to `main` triggers a new APK build via GitHub Actions + EAS. The QR and link above are updated automatically after each build (build #fbac36f0).

> **For live development:** Run `npx expo start` and scan the QR from the terminal with **Expo Go**.

## Automatic Builds

Every push to `main` auto-builds a new APK via GitHub Actions + EAS:

1. Push code to `main`
2. GitHub Actions runs `eas build` in the cloud
3. On success, a GitHub Release is created with the APK
4. Scan the QR above to download the latest version

**Requires one-time setup:** Add your Expo token as a repository secret:
- Go to repo → Settings → Secrets and variables → Actions
- Add `EXPO_TOKEN` = your Expo access token

## Without Android Studio (Physical Phone)

| Method | How |
|--------|-----|
| **APK download** (easiest) | Scan QR above or grab from GitHub Releases |
| **Expo Go** (live dev) | `npx expo start` → scan QR from terminal |
| **EAS Build** | `eas build --platform android --profile preview` |
| **Android Studio** | `npx expo run:android` (requires full Android SDK) |

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


---
*Last build trigger: 2026-06-22 16:43*