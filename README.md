<p align="center">
  <img src="./assets/logo-yamin%20shmel.png" alt="Yamin Shmel Logo" width="140" />
</p>

<h1 align="center">Yamin Shmel (يمين شمال)</h1>

<p align="center">
  A high-performance, gesture-driven photo gallery cleaner and storage management application built with React Native and Expo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-54-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?style=flat-square" alt="Platform" />
</p>

---

## Overview

Modern smartphone galleries accumulate thousands of duplicate, blurred, or transient images that waste gigabytes of device storage. Standard gallery apps make photo curation tedious, requiring repetitive taps and multi-step menus.

**Yamin Shmel** ("Right / Left") streamlines photo cleanup into an intuitive, rapid-fire card-swiping experience. Swiping right keeps a memory; swiping left stages it for deletion. Built with performance, privacy, and safety as top priorities, the app processes everything strictly offline on-device and integrates directly with the native operating system's 30-day trash mechanism.

---

## Key Features

### Fluid Card Deck Interface
- Smooth 60/120 FPS card physics powered by React Native Reanimated and React Native Gesture Handler.
- Intuitive card rotation, responsive swipe thresholds, and dynamic directional overlays.
- Integrated haptic feedback on swipe triggers via Expo Haptics.
- Instant undo capability to recover accidental swipes during a session.

### Two-Step Safe Deletion Flow
- Non-destructive staging: Swiping left does not delete files immediately.
- Comprehensive Trash Review modal displaying file size, dimensions, capture date, and thumbnail previews.
- Granular selection control: Unselecting any item in the review list instantly restores it from the deletion queue.
- Native OS Trash integration: On confirmation, items are moved to the device's system trash with standard recovery windows.

### Smart Gallery Organization & Scopes
- **Quick Clean**: Dive directly into a unified deck of all media assets.
- **Album Filtering**: Target specific directories such as Camera, Screenshots, Downloads, or custom user albums.
- **Timeline Filtering**: Curation segmented month-by-month and year-by-year with real-time asset counters.
- **Deck Completion Navigation**: Seamless transition back to the dashboard to select another album or date range once a deck is finished.

### Persistent Storage Metrics
- Real-time tracking of total storage freed (KB, MB, GB) and total photos decluttered.
- Data persistence across app restarts using Zustand store hydration with AsyncStorage.

### 100% Offline & Private
- Zero remote telemetry, analytics, or network dependencies.
- Photos never leave the device; all processing occurs strictly within local device memory.

### Compact & Optimized Production Footprint
- Production builds leverage Android R8 code minification, dead resource shrinking, and native ABI splitting.
- APK size reduced from an initial 108 MB down to 35 MB (arm64-v8a) and 28 MB (armeabi-v7a).

---

## Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React Native 0.81 (React 19) | Cross-platform native mobile foundation |
| **Tooling** | Expo SDK 54 / Prebuild | Native build tooling, configuration, and plugins |
| **Language** | TypeScript | Strict type safety and compile-time correctness |
| **Animations** | React Native Reanimated (v4) | Hardware-accelerated UI thread animations |
| **Gestures** | React Native Gesture Handler (v2) | Low-latency touch and pan gesture recognition |
| **State Management** | Zustand + AsyncStorage | Lightweight modular global state with persistence |
| **Media Access** | Expo Media Library & Expo Image | Native Android/iOS scoped storage photo access |
| **Icons** | Lucide React Native | Clean, lightweight SVG vector icons |

---

## Project Structure

```
YaminShmel/
├── assets/                  # App icons, splash screens, and brand imagery
├── android/                 # Android native project and Gradle configurations
├── src/
│   ├── components/          # Reusable presentation components (Header, Background, Modals)
│   ├── features/
│   │   ├── deck/            # Swipe deck engine, card gestures, and overlays
│   │   ├── media/           # Media querying services, permissions, and hooks
│   │   └── review/          # Trash review screen and batch deletion handlers
│   ├── screens/
│   │   ├── HomeDashboardScreen.tsx  # Main hub: stats, quick clean, albums, months
│   │   └── DeckScreen.tsx           # Active photo-swiping workspace
│   ├── store/               # Zustand state stores (deck store, media store)
│   └── types/               # TypeScript interfaces and data models
├── App.tsx                  # Root application component and navigation state
├── app.json                 # Expo project configuration and native permissions
└── package.json             # Project dependencies and development scripts
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Android Studio with Android SDK (API 34+) and command-line tools
- JDK 17 or JDK 21

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mortada-Houmani/YaminShmel.git
   cd YaminShmel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run on an Android device or emulator:
   ```bash
   npx expo run:android
   ```

---

## Production Release Build

To build the standalone, optimized Android release APK:

```bash
cd android
./gradlew assembleRelease
```

The resulting optimized APKs will be generated in:
```
android/app/build/outputs/apk/release/
├── app-arm64-v8a-release.apk     # Optimized for modern Android smartphones (~35 MB)
├── app-armeabi-v7a-release.apk   # Optimized for 32-bit Android smartphones (~28 MB)
└── app-universal-release.apk     # Universal package containing all architectures
```

---

## Privacy & Permissions

Yamin Shmel requests the following native Android permissions solely to display and organize local files:
- `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO`: To index photos and videos within the app deck.
- `ACCESS_MEDIA_LOCATION`: To preserve metadata when reviewing media information.
- `WRITE_EXTERNAL_STORAGE`: To execute user-confirmed deletions via the native system trash API on supported Android versions.

No camera, network, contact, location tracking, or microphone permissions are requested.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
