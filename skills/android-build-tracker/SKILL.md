---
name: android-build-tracker
description: Automated Android CI/CD Build Monitor & Quality Gate. Automatically verifies GitHub Actions Android release workflow completion without wasting AI tokens by using background polling in a single execution step and state caching.
---

# Android CI/CD Build Tracker & Quality Gate Skill

## 1. Purpose & Token-Efficiency Philosophy
When modifying or adding Android application code (`android/**`):
- GitHub Actions triggers a cloud build (`Build & Release Android App`) using Ubuntu, JDK 17, and Gradle 8.7 to compile the release APK and publish it to GitHub Releases.
- **Strict Token-Efficiency Rule**: The AI agent **MUST NEVER** repeatedly call tools or loop in conversation to check build status.
- Instead, the build tracker engine (`scripts/check-android-build.cjs`) runs as a **single background process** that internally waits for the terminal status (`success` or `failure`).
- Results are cached in `.android-build-status.json` by commit SHA, guaranteeing zero redundant checks or repeated API queries.

---

## 2. Command Reference

### Standalone Build Check:
```bash
# Check current HEAD commit build status until terminal state:
node scripts/check-android-build.cjs

# Or using npm:
npm run android:build:check

# Check a specific commit SHA:
node scripts/check-android-build.cjs [commit-sha]
```

### Combined Auto-Sync & Build Check:
```bash
# Push changes and immediately wait for Android APK release build:
node scripts/git-auto-sync.cjs "[commit message]" --check-build
```

---

## 3. How It Works
1. **Dynamic Authentication**: Fetches GitHub credentials from NIOOON Token Vault via `niooon-manage-token` (with HTTP fallback).
2. **Terminal State Detection**: Monitors GitHub Actions workflow runs for `Build & Release Android App`.
3. **Smart Internal Polling**: Sleeps 10s between checks within a single process—zero extra AI tool calls or tokens consumed.
4. **Failure Diagnostics**: If a build fails, automatically inspects runner logs to pinpoint exact compilation errors (`e: `, `ERROR:`, `FAILURE:`) and failed task name.
5. **Release Verification**: On success, verifies the GitHub release tag (`latest`), APK file name (`liquid-glass-app.apk`), and asset size.
6. **Result Caching**: Stores terminal outcome in `.android-build-status.json`.
