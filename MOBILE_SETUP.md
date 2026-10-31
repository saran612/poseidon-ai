# POSEIDON Mobile Application — Setup & Developer Guide

This guide covers setup prerequisites, environment configuration, dependency installation, build commands, and execution steps for the POSEIDON AI dedicated Flutter mobile application (`apps/mobile`).

---

## 1. Prerequisites

Ensure your development environment satisfies the following requirements:

- **Flutter SDK**: Version `3.44.2` or newer (Dart `3.12.2` or newer).
  - Verify with: `flutter --version`
- **Python**: Version `3.11+` (for running the shared POSEIDON FastAPI backend).
  - Verify with: `python --version`
- **Node.js**: Version `18+` (optional, for building or serving the React web dashboard).
- **Target Platforms Supported**:
  - Android (API Level 26+ / Android 8.0+)
  - Windows Desktop (Windows 10/11 64-bit)
  - Web (Chrome, Edge, Firefox)

---

## 2. Directory Layout & Workspace

The mobile application is self-contained in the `apps/mobile/` subfolder of the main repository:

```
C:\project\poseidon\
├── apps/
│   └── mobile/              # Dedicated Flutter application
│       ├── lib/
│       ├── test/
│       └── pubspec.yaml
├── backend/                 # Shared FastAPI authoritative backend
├── frontend_temp/           # React Web Dashboard (Vite + React)
└── ui/                      # Web distribution directory
```

---

## 3. Backend Setup & Startup

The mobile application connects directly to the POSEIDON FastAPI authoritative backend.

### 3.1 Install Backend Dependencies
From the repository root:
```powershell
pip install -r requirements.txt
```

### 3.2 Start the FastAPI Server
```powershell
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be available at:
- REST API: `http://localhost:8000/api/v1`
- Swagger Documentation: `http://localhost:8000/docs`
- WebSocket Feed: `ws://localhost:8000/api/v1/ws/updates`

---

## 4. Mobile Application Configuration

### 4.1 Environment Configuration
The backend connection parameters are defined in `apps/mobile/lib/config/env.dart`:

```dart
class AppEnv {
  // Use 10.0.2.2 for Android Emulator, or 127.0.0.1 for Windows Desktop/Web
  static const String defaultApiBaseUrl = 'http://127.0.0.1:8000';
  static const String defaultWsUrl = 'ws://127.0.0.1:8000/api/v1/ws/updates';
}
```

> **Android Emulator Tip**: When running on an Android Virtual Device (AVD), update `defaultApiBaseUrl` to `http://10.0.2.2:8000` because `127.0.0.1` refers to the emulator's internal loopback.

---

## 5. Dependency Installation & Code Generation

Navigate to the mobile directory:
```powershell
cd C:\project\poseidon\apps\mobile
```

### 5.1 Fetch Dependencies
```powershell
flutter pub get
```

### 5.2 Run Code Generation (Drift SQLite)
Whenever the Drift database schema in `lib/database/local_database.dart` is modified, run the build runner:
```powershell
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 6. Running the Mobile Application

### 6.1 Run on Windows Desktop
```powershell
cd C:\project\poseidon\apps\mobile
flutter run -d windows
```

### 6.2 Run on Android Emulator / Connected Device
1. Start your Android Emulator via Android Studio or command line:
   ```powershell
   emulator -avd <Your_AVD_Name>
   ```
2. Run Flutter:
   ```powershell
   cd C:\project\poseidon\apps\mobile
   flutter run -d android
   ```

### 6.3 Run on Web (Development)
```powershell
cd C:\project\poseidon\apps\mobile
flutter run -d chrome
```

---

## 7. Testing & Verification

### 7.1 Static Code Analysis
Run the Flutter analyzer to verify syntax, type safety, and lint rules:
```powershell
cd C:\project\poseidon\apps\mobile
flutter analyze
```
Expected output:
```
Analyzing mobile...
No issues found!
```

### 7.2 Automated Test Suite
Execute the full test suite covering database persistence, outbox sync, binary codec, map rendering, and widget interactions:
```powershell
cd C:\project\poseidon\apps\mobile
flutter test
```
Expected output:
```
All tests passed! (16/16)
```

### 7.3 Backend Integration Tests
From the root repository directory:
```powershell
pytest
```
Expected output:
```
32 passed
```

---

## 8. Default Credentials for Field Testing

For rapid testing in field simulations or development, the following default credentials are built into the login screen:

- **Responder / Field Officer**:
  - Username: `field_commander`
  - Password: `emergency_password_2026`
  - Role: Field Responder / Commander
- **Authorized Officer**:
  - Username: `officer_chen`
  - Password: `emergency_password_2026`
  - Role: Authorized Officer / Dispatcher

