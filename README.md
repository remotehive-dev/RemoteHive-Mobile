# RemoteHive Mobile

Android app for RemoteHive — remote job board & talent platform. React Native (Expo SDK 56).

## Quick Start

```bash
npm install --legacy-peer-deps
npx expo start
```

## Download APK

[![Download Latest APK](https://img.shields.io/badge/⬇️_Download_Latest_APK-2563EB?style=for-the-badge&logo=android)](https://dl.remotehive.in/latest.apk)

Scan the QR below to download and install the APK directly on your phone (enable "Install from unknown sources" if prompted).

![Download APK](./assets/qr-download.png)

> **Auto-build:** Every push to `main` triggers a new APK build. The badge and QR above always point to the latest version — no manual updates needed.

> **For live development:** Run `npx expo start` and scan the QR from the terminal with **Expo Go**.

## Automatic Builds

Every push to `main` auto-builds a new APK — zero cloud build costs:

1. Push code to `main`
2. GitHub Actions builds the APK locally on the runner via `eas build --local`
3. The APK is uploaded to Cloudflare R2 (global CDN, free tier)
4. The QR above and the badge always point to the latest APK at `dl.remotehive.in`

**Requires one-time setup:** Add these repository secrets:
- `EXPO_TOKEN` — your Expo access token
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token for build
- `CLOUDFLARE_R2_ACCESS_KEY` / `CLOUDFLARE_R2_SECRET_KEY` — R2 S3 credentials
- `CLOUDFLARE_R2_ENDPOINT` — `https://2e25186c83a8468a8c7a408f6527f324.r2.cloudflarestorage.com`
- `CLOUDFLARE_R2_BUCKET` — `remotehive-apks`

## Without Android Studio (Physical Phone)

| Method | How |
|--------|-----|
| **APK download** (easiest) | Scan QR above or click the download badge |
| **Expo Go** (live dev) | `npx expo start` → scan QR from terminal |
| **Local build** | `eas build --local --platform android --profile preview` |
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
