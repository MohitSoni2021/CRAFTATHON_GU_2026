# Android Expo App Features

This document summarizes the Android Expo app functionality implemented in the project.

## Core Screens

- `HomeScreen`:
  - Quick daily status overview.
  - Shows pending dose count and healthy streak message.
  - Includes sign-out confirmation with streak encouragement.

- `TodayMedsScreen`:
  - Displays today's medication schedule.
  - Real-time dose status updates (taken/pending/missed).
  - Tap to mark doses as taken (optimistic UI + API update).
  - Pull-to-refresh for live data.
  - Dynamic adherence percentage and stats (taken/pending/missed).
  - Dynamic streak text from backend `currentStreak` instead of static value.

- `CaregiverScreen`:
  - Role-based UI: Patients see caregiver connections and invite flow; caregivers see monitored patients.
  - `Connect a Caregiver` form (patient role) to send an email invite.
  - Fetch and render linked caregiver list (patient role): name, email, relationship, status, unlink action.
  - Fetch and render monitored patient list (caregiver role).
  - Link/unlink operations with confirmation dialogs.

- `InsightsScreen`:
  - Fetch adherence score, risk, weekly breakdown, and patterns.
  - Dynamic risk/score cards with color indicator.
  - Weekly trend and patterns-based guidance.
  - Error-resilient handling for missing `patterns` or API shape changes.

## Services

- `medicationService`:
  - `getTodayDosesService`
  - `markDoseAsTakenService`

- `adherenceService`:
  - `getAdherenceScoreService`
  - `getAdherenceRiskService`
  - `getAdherenceWeeklyService`
  - `getAdherencePatternsService`
  - `getDailyAdherenceService`

- `caregiverService`:
  - `getPatientsService`
  - `getMyCaregiversService`
  - `linkCaregiverService`
  - `unlinkCaregiverService`

## Backend Support (API endpoints)

- `GET /adherence/score` (with `currentStreak`)
- `GET /adherence/risk`
- `GET /adherence/weekly`
- `GET /adherence/patterns`
- `GET /adherence/daily`
- `POST /caregiver/invite`
- `POST /caregiver/respond`
- `GET /caregiver/invites`
- `GET /caregiver/my-caregivers`
- `GET /caregiver/patients`
- `DELETE /caregiver/link/:id`

## Real-time and reliability

- Moved `TodayMedsScreen` and `CaregiverScreen` to use pull-to-refresh and safe checks.
- `InsightsScreen` now handles both array and object responses for `patterns`.
- Updated `TodayMedsScreen` streak to dynamic value from API.

## Notes

- All UI changes are in `androidVersion/src/screens/home/*`.
- API helper functions are in `androidVersion/src/services/*`.
- This file is a living source of truth for Android Expo feature coverage and can be expanded with new screens and flows.
