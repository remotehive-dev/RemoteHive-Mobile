# RemoteHive Mobile — Release Process

## Automatic Release Pipeline

Every push to `main` triggers a complete build + release automatically. No manual steps required.

```
Push to main
    │
    ▼
GitHub Actions (ubuntu-latest)
    ├── npm ci (cached)
    ├── npx expo prebuild (cached android/ dir)
    ├── ./gradlew assembleRelease (cached Gradle deps)
    ├── Upload APK → Cloudflare R2
    ├── Upload version.json → Cloudflare R2
    ├── Regenerate QR code → commit [skip ci]
    └── Update README build number → commit [skip ci]
```

## Build Time

| Scenario | Duration |
|----------|----------|
| Cold build (first ever) | ~20-25 min |
| Warm build (Gradle cached) | ~8-12 min |
| Hot build (android/ + Gradle cached) | ~5-8 min |

## Download Links (Permanent)

These URLs never change. The APK file is overwritten on each build.

| Resource | URL |
|----------|-----|
| **Latest APK** | https://dl.remotehive.in/latest.apk |
| **Version info** | https://dl.remotehive.in/version.json |
| **QR Code** | In README (`assets/qr-download.png`) |

## QR Code Auto-Update Logic

The QR code is **regenerated on every successful build** by the CI workflow:

1. Workflow calls `api.qrserver.com` with the permanent URL `https://dl.remotehive.in/latest.apk`
2. Saves the new QR image to `assets/qr-download.png`
3. Commits with `[skip ci]` to prevent infinite build loops
4. Pushes back to `main`

**Why this is safe:** The `[skip ci]` tag in the commit message tells GitHub Actions to ignore this commit, so only code pushes trigger new builds.

## Version Numbering

| Format | Example | Source |
|--------|---------|--------|
| App version | `1.0.42` | `1.0.${github.run_number}` |
| Version code | `43` | `run_number + 1` (Android internal) |
| Build tag | `build-42` | GitHub Release tag |

## How to Release a New Version

### Option 1: Push code (normal development)
```bash
git add .
git commit -m "feat: new feature"
git push origin main
```
Build triggers automatically. APK updates at `dl.remotehive.in/latest.apk`.

### Option 2: Trigger manually (no code changes)
Go to GitHub → Actions → "Build APK" → "Run workflow" → Branch: `main`.

### Option 3: Empty commit (force rebuild)
```bash
git commit --allow-empty -m "chore: force rebuild"
git push origin main
```

## What Gets Updated on Each Release

1. **APK file** in R2 (overwritten)
2. **version.json** in R2 (new version code)
3. **QR code** image in repo (regenerated)
4. **README** build number badge (updated)
5. **GitHub Release** on private repo (created with APK artifact)

## Architecture

```
┌──────────────────┐
│  React Native App│
│  (Expo SDK 56)   │
└────────┬─────────┘
         │
    ┌────┴────┬──────────────┐
    ▼         ▼              ▼
┌───────┐ ┌────────┐  ┌──────────────┐
│ Clerk │ │Supabase│  │ Django Admin │
│ Auth  │ │  DB    │  │  Panel       │
└───────┘ └────────┘  └──────────────┘
                │
                ▼
        ┌───────────────┐
        │ dl.remotehive │
        │ .in (R2+Worker)│
        └───────────────┘
```

## Secrets Required

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_R2_ENDPOINT` | R2 S3 API endpoint |
| `CLOUDFLARE_R2_ACCESS_KEY` | R2 S3 access key |
| `CLOUDFLARE_R2_SECRET_KEY` | R2 S3 secret key |
| `CLOUDFLARE_R2_BUCKET` | R2 bucket name (`remotehive-apks`) |

## Rollback

If a build is broken, users can:
1. Keep using their current installed APK (version.json shows update only if versionCode is higher)
2. Download an older APK from GitHub Releases on the private repo
3. You can manually upload a previous APK to R2 to restore

## Monitoring Builds

- GitHub Actions tab: https://github.com/remotehive-dev/RemoteHive-Mobile/actions
- Build logs include upload status (HTTP 200 = success)
- R2 objects visible in Cloudflare Dashboard → R2

## Local Development (No Release)

```bash
npm install --legacy-peer-deps
npx expo start
# Scan QR with Expo Go app
```

## Full Native Build (Local)

```bash
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
# APK at: app/build/outputs/apk/release/app-release.apk
```
