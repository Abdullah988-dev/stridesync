# 🏃 StrideSync — Production-Grade Step Tracker Mobile App

> **StrideSync** is a modern, offline-first mobile application designed to track daily steps, monitor biometric metrics (distance, active time, weight-adjusted calorie burn), build streaks, unlock milestone achievements, and motivate users through smart reminders and multi-language support (English & Urdu with bidirectional RTL).

---

## 📱 Features Overview

### 1. 🎯 Dynamic Live Step Tracking & Circular Progress Ring
- **Smooth SVG Circular Gauge**: Displays real-time steps vs. daily goal with gradient strokes, percentage badges, and adaptive colors.
- **Sensor & Fallback Management**: Integrates hardware motion sensor (`expo-sensors` Pedometer) with graceful fallback handling for simulators and devices without hardware sensors.
- **Goal Celebration & Confetti**: Interactive 60fps particle burst celebration modal triggers automatically upon hitting the daily target.

### 2. 🧮 Biometric Engine & Accurate Formulas
- **Personalized Stride Calculation**:
  $$\text{Stride Length (cm)} = \begin{cases} \text{Height (cm)} \times 0.415 & \text{if male} \\ \text{Height (cm)} \times 0.413 & \text{if female} \end{cases}$$
- **Distance**:
  $$\text{Distance (km)} = \frac{\text{Steps} \times \text{Stride Length (cm)}}{100,000}$$
- **Weight-Adjusted Calorie Burn**:
  $$\text{Calories (kcal)} = \text{Steps} \times 0.04 \times \left(\frac{\text{Weight (kg)}}{70}\right)$$
- **Active Time Estimation**:
  $$\text{Active Minutes} = \text{Round}\left(\frac{\text{Steps}}{100}\right)$$

### 3. 📊 Analytics & Interactive Charts
- **Day View**: 24-hour distribution breakdown with peak activity detection.
- **Week View**: 7-day bar chart with daily target threshold line, weekly total, daily average, and best performance day.
- **Month View**: 30-day activity trends and consistency metrics.
- **Historical Log**: Complete chronological records with goal achievement indicators.

### 4. 🏆 Streaks, Milestones & Badges
- **Consecutive Streak Tracking**: Computes active streak records and historical longest streaks.
- **Achievement Badges**:
  - `First Step`: Recorded the very first step.
  - `5,000 Step Walker`: Hit 5,000 steps in a day.
  - `10,000 Goal Crusher`: Gold standard 10,000 steps achieved.
  - `15,000 Step Master`: Ultra walking milestone.
  - `20,000 Ultra Walker`: Peak endurance badge.
  - `3-Day Momentum`: 3-day consecutive goal streak.
  - `Week on Fire 🔥`: 7-day uninterrupted streak.
  - `Monthly Legend`: 30-day streak conqueror.
  - `Marathon Distance`: 42+ km cumulative distance.

### 5. ⏰ Smart Scheduled Notifications
- **Morning Motivation (8:00 AM)**: Daily greeting and prompt to kickstart movement.
- **Evening Goal Check (7:00 PM)**: Check-in displaying remaining steps to complete before midnight.
- **Instant Goal Alert**: Immediate push notification celebrating daily target completion.

### 6. 💾 Offline-First Storage & Data Portability
- **SQLite Database (`expo-sqlite`)**: High-performance local database storing daily steps, hourly activity distributions, and achievement timestamps.
- **AsyncStorage**: User biometrics, theme, language, and system preferences.
- **CSV Data Export**: One-tap export to CSV file shared via native share sheet (`expo-file-system` + `expo-sharing`).

### 7. 🌐 Bilingual & Full RTL Support
- Full localization in **English** and **اردو (Urdu)**.
- Native Right-to-Left (RTL) layout switching with flipped icons, padding, and alignments.

---

## 📂 Project Architecture

```
tracker/
├── __tests__/                   # Jest Unit Test Suite
│   ├── calculations.test.ts     # Formula verification (stride, calories, distance)
│   └── dateHelpers.test.ts      # Streak and date formatting tests
├── src/
│   ├── components/              # UI Component Library
│   │   ├── common/
│   │   │   ├── Button.tsx       # Reusable button with haptics and loading states
│   │   │   ├── Card.tsx         # Modern elevated and outlined cards
│   │   │   └── Header.tsx       # RTL-aware screen header
│   │   ├── BadgeCard.tsx        # Milestone badge display component
│   │   ├── ChartCard.tsx        # SVG-based bar and line charts
│   │   ├── ConfettiOverlay.tsx  # Native 60fps celebratory confetti particle system
│   │   ├── DailyQuoteCard.tsx   # Inspirational quotes component
│   │   ├── GoalCelebrationModal.tsx # Trophy celebration modal
│   │   ├── ManualStepModal.tsx  # Quick manual step logging bottom-sheet modal
│   │   ├── ProgressRing.tsx     # Animated SVG circular progress ring
│   │   └── StatCard.tsx         # Distance, calories, and active time cards
│   ├── i18n/                    # Localization System
│   │   ├── i18nContext.tsx      # Language Context with RTL helpers
│   │   └── translations.ts      # English & Urdu translation dictionaries
│   ├── navigation/              # Navigation Layer
│   │   ├── AppNavigator.tsx     # Root Stack Navigator (Onboarding, Setup, Tabs)
│   │   ├── BottomTabNavigator.tsx # Bottom tabs (Today, Analytics, Badges, Settings)
│   │   └── types.ts             # Strict TypeScript navigation param types
│   ├── screens/                 # Primary Application Screens
│   │   ├── AchievementsScreen.tsx # Streaks and badge gallery
│   │   ├── HomeScreen.tsx       # Daily dashboard & live counter
│   │   ├── OnboardingScreen.tsx # 3-step introductory walkthrough
│   │   ├── ProfileEditScreen.tsx# Biometric profile editor
│   │   ├── ProfileSetupScreen.tsx # Initial setup flow
│   │   ├── SettingsScreen.tsx   # Preferences, units, theme, CSV export, reset
│   │   └── StatisticsScreen.tsx # Day/Week/Month analytics and charts
│   ├── services/                # Device & Storage Integrations
│   │   ├── database.ts          # SQLite async database service
│   │   ├── exportService.ts     # CSV generation & file sharing service
│   │   ├── notifications.ts     # Expo Push Notifications scheduler
│   │   └── pedometer.ts         # Hardware sensor & fallback listener
│   ├── store/                   # State Management (Zustand)
│   │   ├── useAchievementsStore.ts # Achievement unlock logic & persistence
│   │   ├── useStepsStore.ts     # Step counting, calculations, history, streaks
│   │   └── useUserStore.ts      # Profile, units, theme, and language state
│   ├── theme/                   # Design Tokens
│   │   ├── colors.ts            # Light and Dark mode color palettes
│   │   ├── spacing.ts           # Radii, shadows, and spacing scales
│   │   ├── themeContext.tsx     # Dynamic theme provider
│   │   └── typography.ts        # Typography scales
│   └── utils/                   # Helpers
│       ├── calculations.ts      # Stride length, MET-adjusted calories, distance
│       ├── dateHelpers.ts       # Timezone-safe date strings & streak algorithms
│       ├── quotes.ts            # Curated fitness motivation quotes
│       └── soundHaptics.ts      # Haptic feedback wrapper
├── App.tsx                      # Application Entry Point & Lifecycle Listener
├── app.json                     # Expo configuration, permissions, and icons
└── package.json                 # Project dependencies and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Expo Go** app on your physical device (iOS or Android) or an emulator/simulator.

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install --legacy-peer-deps
```

### 2. Running Locally with Expo
Start the Expo development server:
```bash
npx expo start
```

- Press `a` in the terminal to launch on an **Android emulator** or connected physical device.
- Press `i` to launch on the **iOS simulator** (macOS required).
- Press `w` to run in the **web browser**.
- Scan the QR code using the **Expo Go** app on your physical Android or iOS device.

---

## 🧪 Running Unit Tests

The test suite validates biometric calculation accuracy, unit conversions, and streak algorithms:
```bash
npm test
```

Expected output:
```
PASS __tests__/calculations.test.ts
PASS __tests__/dateHelpers.test.ts

Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        ~8s
```

---

## 📦 Android Production Build Guide (APK / AAB)

### Option A: Cloud Build using EAS (Recommended)
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize the build project:
   ```bash
   eas build:configure
   ```
4. Build a standalone Android APK for testing:
   ```bash
   eas build --platform android --profile preview
   ```
5. Build an Android App Bundle (AAB) for Google Play Store:
   ```bash
   eas build --platform android --profile production
   ```

### Option B: Local Android Build (Prebuild / Bare workflow)
1. Generate the native Android project folder:
   ```bash
   npx expo prebuild --platform android
   ```
2. Build the debug APK with Gradle:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
3. The generated APK will be available in:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔒 Permissions & Security

StrideSync requests the minimum necessary permissions in `app.json`:
- `android.permission.ACTIVITY_RECOGNITION`: Required for step counter sensor access on Android 10+.
- `android.permission.RECEIVE_BOOT_COMPLETED`: Resumes notification schedules on device reboot.
- `android.permission.VIBRATE`: Provides haptic feedback when milestones are achieved.
- `android.permission.POST_NOTIFICATIONS`: Enables timely morning and evening motivation alerts.
- `NSMotionUsageDescription` (iOS): Explains why motion sensor access is needed for step tracking.

---

## 🎨 Theme & Accessibility
- **Light Theme**: Soft slate backgrounds (`#F8FAFC`) with vibrant emerald accents (`#10B981`) and deep slate typography (`#0F172A`).
- **Dark Theme**: Rich midnight contrast (`#0B0F19` / `#151D2F`) with neon emerald accents (`#10B981`) and cyan indicators (`#38BDF8`).
- **Accessible Contrast**: WCAG 2.1 AA compliant color combinations.
- **Dynamic RTL**: Mirrored layouts and icon orientations when Urdu is selected.
