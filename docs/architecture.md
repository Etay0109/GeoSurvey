# System Architecture

GeoSurvey is built as a full-stack mobile survey and analytics platform.

The system consists of four main components:

- Android SDK
- FastAPI Backend
- PostgreSQL Database
- React Developer Portal

## Architecture Diagram

![System Architecture](./diagrams/system-architecture.png)

## Main Components

### Android SDK

The Android SDK is embedded inside a mobile application.

It is responsible for:

- Displaying surveys inside the app
- Supporting single-choice and multiple-choice questions
- Requesting location permission when enabled
- Collecting survey responses
- Saving responses locally if needed
- Sending responses to the backend

### Developer Portal

The React Developer Portal allows developers to:

- Create surveys
- Edit surveys
- Publish surveys
- View analytics
- Track survey performance

### FastAPI Backend

The backend exposes REST API endpoints for:

- Survey management
- Survey responses
- Engagement events
- Analytics dashboard data

### PostgreSQL Database

PostgreSQL stores:

- Developers
- Surveys
- Questions
- Survey options
- Responses
- Engagement events
- Analytics summary data

## System Flow

1. A developer creates a survey in the portal.
2. The survey is published and becomes active.
3. The Android app initializes the GeoSurvey SDK.
4. The SDK fetches the active survey from the backend.
5. The user answers the survey inside the app.
6. The SDK submits the responses to the backend.
7. The backend stores the data in PostgreSQL.
8. The developer views updated analytics in the portal.

## Data Flow

```text
Android App
   ↓
GeoSurvey SDK
   ↓
FastAPI Backend
   ↓
PostgreSQL Database
   ↓
Analytics Dashboard
```

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile SDK | Kotlin |
| Backend | FastAPI |
| Database | PostgreSQL |
| Developer Portal | React |
| Documentation | VitePress |