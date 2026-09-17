# GyannPortal — Product Requirements Document (PRD)

## 1. Overview

**GyannPortal** is a comprehensive School Management System / School Management Software designed for schools in Nepal and internationally.

- **Tagline (Nepali):** स्मार्ट विद्यालय, सरल व्यवस्थापन
- **Tagline (English):** One platform to manage your entire school.
- **Company:** GyannPortal — Ownalgy Sampanna Tech

## 2. Problem Statement

Schools struggle with:
- Excessive paperwork and manual record keeping
- Scattered student records across registers and spreadsheets
- Time-consuming manual attendance tracking
- Difficult fee tracking and collection
- Communication gaps between school, parents, and students
- Slow, error-prone report generation

## 3. Product Goals

1. Digitize every school management workflow into one platform.
2. Connect all stakeholders: administrators, teachers, students, and parents.
3. Provide real-time insights through dashboards and analytics.
4. Remain simple, fast, and accessible from web and mobile.

## 4. Core Modules

| Module              | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| Student Management  | Profiles, enrollment, academic records, documents                        |
| Teacher Management  | Profiles, subjects, classes, schedules, performance                      |
| Attendance          | Daily tracking with real-time reports and parent notifications           |
| Classes & Sections  | Class organization and section management                                |
| Courses & Subjects  | Curriculum mapping across grades                                         |
| Assignments         | Creation, submission, and grading                                        |
| Examinations        | Exam creation, marks, grading, results, report cards                     |
| Fees & Payments     | Fee structure, payments, outstanding balances, invoices                  |
| Timetable           | Class and teacher scheduling with conflict detection                     |
| Library             | Books, borrowing, returns, and records                                   |
| Transport           | Routes, vehicles, and student tracking                                   |
| Hostel              | Rooms, allocations, and attendance                                       |
| Notifications       | Announcements and push notifications                                     |
| Certificates        | Generate and manage academic certificates                                |
| Reports & Analytics | Dashboards and actionable insights                                       |

## 5. User Roles

| Role         | Access                                                          |
| ------------ | --------------------------------------------------------------- |
| School Admin | Full control over school operations and configuration           |
| Teacher      | Manage classes, attendance, assignments, exams, and students    |
| Student      | Access classes, assignments, exams, results, and announcements  |
| Parent       | Monitor attendance, performance, fees, notices, and activities  |

## 6. Multi-Tenancy

- One **School** can have multiple **Branches**.
- Each **User** belongs to a school (optional branch) and has exactly one **Role**.
- Users are isolated to their school via `schoolId`.

## 7. Functional Requirements

### 7.1 School Registration

- A super-admin flow (`POST /auth/register-school`) creates:
  - A **School** (code must be unique, uppercase, `[A-Za-z0-9_-]`)
  - An optional **Branch**
  - A **School Admin** user with the `SCHOOL_ADMIN` role
  - An **Academic Year** (future phase)
- Passwords hashed with bcrypt (cost factor 12).
- Duplicate school codes or admin emails must be rejected (409 Conflict).

### 7.2 Authentication

- JWT-based bearer auth (`7d` expiry by default).
- Login validates password, user status, and school status.
- `GET /auth/me` returns the current user with role, school, and branch.

### 7.3 Validation

- All inputs validated server-side using `class-validator`.
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform`.

## 8. Non-Functional Requirements

| Requirement | Target                                                     |
| ----------- | ---------------------------------------------------------- |
| Performance | Fast page loads (static marketing site)                    |
| Security    | Encrypted data, role-based access, audit logs, backups     |
| Availability| 99.9% uptime target                                        |
| Responsive  | Mobile-first across all devices                            |
| Accessibility| Semantic HTML, ARIA attributes, keyboard-navigable         |

## 9. Success Metrics

- Schools onboarded and active weekly
- Daily active users across roles
- Reduction in manual administrative work
- Parent satisfaction / engagement rate
- System uptime and API latency

## 10. Out of Scope (v1)

- Online payments gateway integration
- SMS/email marketing
- AI-powered insights
- Multi-language UI (only brand tagline in Nepali; product UI English)