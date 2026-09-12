# Liquid Glass Browser - Android Project (Kotlin & Jetpack Compose)

This Android application provides a liquid glass design interface inspired by modern glassmorphic fluid UI.

## Key Features & Architecture
- **Framework**: Modern Jetpack Compose with Material 3
- **Language**: Kotlin 2.0 (`.kt`)
- **Design System**: Liquid Glass with refractive specular borders, translucent gradients, and caustic drop shadows (`LiquidGlassBox.kt`)
- **Key Modules**:
  - `GoogleLogoHeader.kt`: Multi-color Google branding and liquid glass profile button
  - `LiquidSearchBar.kt`: Translucent search capsule with Google Voice Mic and Google Lens
  - `QuickAccessGrid.kt`: Embossed 3D liquid glass launcher icons for YouTube, Instagram, Facebook, WhatsApp, Google, X, Pinterest, and Add (+)
  - `DiscoverSection.kt`: Translucent glass discover card feed with article previews and travel/tech/space cards
  - `LiquidBottomBar.kt`: Elevated floating liquid glass navigation bar with Back, Forward, Search lens pill, Tab [1] counter, and Menu
  - `LiquidHomeScreen.kt`: Edge-to-edge liquid layout matching the design reference

## Building and Running
1. Open this directory (`android/`) in Android Studio (Giraffe / Iguana / Koala or newer).
2. Sync Gradle files (`./gradlew assembleDebug`).
3. Run on an Android device or emulator with API Level 26+.
