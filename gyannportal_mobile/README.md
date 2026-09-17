# GyannPortal Mobile

Flutter application for GyannPortal — the School Management System.

This is the mobile client for students, teachers, parents, and administrators to stay connected with their school from anywhere.

## Status

**Initial scaffold.** The project is a fresh Flutter app; feature screens are not yet implemented.

## Getting Started

```bash
flutter pub get
flutter run              # default device
flutter run -d chrome    # run on web
flutter run -d <device>  # specific device
```

## Checks

```bash
flutter analyze
flutter test
```

## Platforms

Android, iOS, Web, Linux, macOS, Windows (per `flutter create` scaffolding).

## Planned Screens

- Login / Register
- Role-specific home dashboards (Admin / Teacher / Student / Parent)
- Attendance, Results, Assignments, Fees, Announcements, Timetable
- Push notifications

## API Integration (planned)

Connects to the NestJS backend at `/api/v1` with JWT bearer auth:

- `POST /auth/login`
- `GET  /auth/me`
- Future module endpoints (students, attendance, fees, exams, etc.)

## Useful Resources

- [Flutter documentation](https://docs.flutter.dev/)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [State management approaches](https://docs.flutter.dev/data-and-backend/state-mgmt/intro)