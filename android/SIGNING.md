# Android Keystore & Application Signing Guide

This document describes the keystore files, fingerprints, and signing configuration used to maintain a consistent signature across every build.

---

## 1. Keystore Files Included

| File Path | Description | Alias | Password |
| :--- | :--- | :--- | :--- |
| `android/my-upload-key.jks` | Primary Upload Keystore (PKCS12 format) | `upload` | `nutritrack123` |
| `android/debug.keystore` | Debug Keystore (matches upload key) | `upload` | `nutritrack123` |
| `android/app/my-upload-key.jks` | App-module fallback keystore copy | `upload` | `nutritrack123` |
| `android/keystore.properties` | Properties file for local build credentials | - | - |
| `android/upload-certificate.pem` | Public X.509 Certificate (PEM format) | - | - |
| `android/upload-certificate.der` | Public Certificate (DER format for Google Play) | - | - |

---

## 2. Certificate Fingerprints (Fixed & Persistent)

These fingerprints remain identical across every build:

- **SHA-1 Fingerprint:**
  ```text
  64:50:AE:47:2D:0B:9B:4C:5C:EC:3D:DE:7A:CA:A6:5C:39:32:50:A3
  ```

- **SHA-256 Fingerprint:**
  ```text
  5A:67:E9:19:88:A5:5F:57:C5:CD:D4:DA:C3:F5:B7:33:CF:46:3F:06:7D:FB:80:2D:A5:44:7F:FB:12:68:09:3C
  ```

---

## 3. Environment Variables (Optional Overrides)

You can override credentials at build time using environment variables:

```bash
export KEYSTORE_PATH="my-upload-key.jks"
export STORE_PASSWORD="nutritrack123"
export KEY_ALIAS="upload"
export KEY_PASSWORD="nutritrack123"
```

---

## 4. How to Build Signed APK or Android App Bundle (AAB)

### Generate Signed Release APK:
```bash
cd android
./gradlew assembleRelease
```
*Output APK located at: `android/app/build/outputs/apk/release/app-release.apk`*

### Generate Signed Android App Bundle (for Google Play Store):
```bash
cd android
./gradlew bundleRelease
```
*Output Bundle located at: `android/app/build/outputs/bundle/release/app-release.aab`*

### Generate Debug APK with Fixed Signature:
```bash
cd android
./gradlew assembleDebug
```
*Output APK located at: `android/app/build/outputs/apk/debug/app-debug.apk`*
