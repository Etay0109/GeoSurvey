# Get Started

GeoSurvey is a survey and analytics platform consisting of:

- Android SDK (Kotlin)
- FastAPI Backend
- PostgreSQL Database
- React Developer Portal

## Requirements

- Android Studio
- Python 3.11+
- PostgreSQL
- Node.js

## Database Setup

Create the PostgreSQL database:

```bash
createdb geosurvey
```

Run the database schema:

```bash
psql -d geosurvey -f create_tables.sql
```

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Portal Setup

```bash
cd portal

npm install

npm run dev
```

## Android SDK Setup

Initialize the SDK:

```kotlin
SurveySdk.initialize(
    baseUrl = "http://YOUR_SERVER_IP:8000",
    enableLocation = true
)
```

Display a survey:

```kotlin
SurveySdk.showSurvey(
    context = this,
    surveyId = YOUR_SURVEY_ID
)
```

Replace `YOUR_SURVEY_ID` with the ID of a published survey created through the Developer Portal.


## Quick Start Workflow

Follow the steps below to run the complete GeoSurvey platform.

| Step | Action |
|---|---|
| 1 | Start the PostgreSQL database |
| 2 | Start the FastAPI backend |
| 3 | Start the React Developer Portal |
| 4 | Register a developer account |
| 5 | Log into the Developer Portal |
| 6 | Create a survey |
| 7 | Publish the survey |
| 8 | Initialize the Android SDK |
| 9 | Display the survey in the Android application |
| 10 | Submit responses |
| 11 | View analytics in the dashboard |


## End-to-End Flow

```text
Developer Registration
        ↓
Developer Login
        ↓
Create Survey
        ↓
Publish Survey
        ↓
Android SDK Fetches Survey
        ↓
User Completes Survey
        ↓
Responses Stored In PostgreSQL
        ↓
Analytics Dashboard Updates
```


## Verify Installation

After starting all services:

### Backend

Open:

```text
http://localhost:8000
```

Expected response:

```json
{
  "message": "GeoSurvey API is running"
}
```

### Developer Portal

Open:

```text
http://localhost:5173
```

The Developer Portal login page should be displayed.

### Android SDK

Run the demo application and call:

```kotlin
SurveySdk.showSurvey(
    context = this,
    surveyId = YOUR_SURVEY_ID
)
```

The survey dialog should appear inside the application.