# API Reference

GeoSurvey exposes a REST API used by both the Android SDK and the React Developer Portal.

Base URL:

```text
http://YOUR_SERVER_IP:8000
```

## Endpoints Overview

| Method | Endpoint | Used By | Description |
|---|---|---|---|
| `GET` | `/` | Backend | Check if the server is running |
| `GET` | `/db-test` | Backend | Test PostgreSQL database connection |
| `POST` | `/developers/register` | Portal | Register a new developer |
| `POST` | `/developers/login` | Portal | Authenticate developer login |
| `POST` | `/surveys` | Portal | Create a new survey |
| `GET` | `/surveys?developer_id={developer_id}` | Portal | Get all surveys for a specific developer |
| `GET` | `/surveys/{survey_id}` | SDK | Get a specific active survey |
| `PUT` | `/surveys/{survey_id}` | Portal | Update survey title and status |
| `PUT` | `/surveys/{survey_id}/publish` | Portal | Publish a survey |
| `DELETE` | `/surveys/{survey_id}` | Portal | Mark a survey as done |
| `POST` | `/responses/batch` | SDK | Submit survey responses |
| `POST` | `/engagement-events` | SDK | Track opened, completed, and abandoned events |
| `GET` | `/analytics/results/{survey_id}` | Portal | Get answer distribution results |
| `GET` | `/analytics/regions/{survey_id}` | Portal | Get regional analytics |
| `GET` | `/analytics/engagement/{survey_id}` | Portal | Get engagement metrics |
| `GET` | `/analytics/surveys/{survey_id}/dashboard` | Portal | Get full dashboard analytics |

---

## Developer Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/developers/register` | Registers a new developer account |
| `POST` | `/developers/login` | Authenticates an existing developer |

### Register Developer

```http
POST /developers/register
```

Example request:

```json
{
  "name": "Demo Developer",
  "email": "developer@example.com",
  "password": "password123"
}
```

Example response:

```json
{
  "id": 1,
  "name": "Demo Developer",
  "email": "developer@example.com"
}
```

### Login Developer

```http
POST /developers/login
```

Example request:

```json
{
  "email": "developer@example.com",
  "password": "password123"
}
```

Example response:

```json
{
  "id": 1,
  "name": "Demo Developer",
  "email": "developer@example.com"
}
```

---

## Survey Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/surveys` | Creates a new survey with questions and options |
| `GET` | `/surveys?developer_id={developer_id}` | Returns all surveys for a specific developer |
| `GET` | `/surveys/{survey_id}` | Returns a specific active survey for the Android SDK |
| `PUT` | `/surveys/{survey_id}` | Updates survey title and status |
| `PUT` | `/surveys/{survey_id}/publish` | Changes survey status to active |
| `DELETE` | `/surveys/{survey_id}` | Marks survey status as done |

### Create Survey

```http
POST /surveys
```

Example request:

```json
{
  "title": "Travel App Survey",
  "status": "draft",
  "location_enabled": true,
  "developer_id": 1,
  "questions": [
    {
      "text": "What type of destination do you prefer?",
      "type": "radio",
      "options": [
        { "text": "Beach Destinations" },
        { "text": "City Trips" },
        { "text": "Nature and Hiking" }
      ]
    }
  ]
}
```

Example response:

```json
{
  "id": 9,
  "title": "Travel App Survey",
  "status": "draft",
  "location_enabled": true,
  "developer_id": 1,
  "message": "Survey created successfully"
}
```

### Get All Surveys

```http
GET /surveys?developer_id=1
```

Example response:

```json
[
  {
    "id": 9,
    "title": "Travel App Survey",
    "status": "active",
    "location_enabled": true,
    "created_at": "2026-06-23T12:00:00",
    "developer_id": 1
  }
]
```

### Get Survey

```http
GET /surveys/9
```

Returns a survey only if its status is `active`.

### Publish Survey

```http
PUT /surveys/9/publish
```

Example response:

```json
{
  "id": 9,
  "title": "Travel App Survey",
  "status": "active",
  "message": "Survey published successfully"
}
```

### Delete Survey

```http
DELETE /surveys/9
```

This endpoint does not permanently delete the survey.  
It marks the survey status as `done`.

---

## Response Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/responses/batch` | Stores answers submitted from the Android SDK |

### Submit Responses

```http
POST /responses/batch
```

Example request:

```json
{
  "responses": [
    {
      "survey_id": 9,
      "question_id": 21,
      "option_id": 84,
      "region": "Center District"
    }
  ]
}
```

Example response:

```json
{
  "message": "Responses saved successfully",
  "count": 1
}
```

---

## Engagement Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/engagement-events` | Stores survey engagement events |

Supported event types:

| Event Type | Meaning |
|---|---|
| `opened` | Survey was displayed to the user |
| `completed` | User submitted the survey |
| `abandoned` | User closed the survey before submitting |

### Create Engagement Event

```http
POST /engagement-events
```

Example request:

```json
{
  "survey_id": 9,
  "event_type": "opened"
}
```

Example response:

```json
{
  "id": 1,
  "survey_id": 9,
  "event_type": "opened",
  "message": "Engagement event saved successfully"
}
```

---

## Analytics Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/results/{survey_id}` | Returns answer distribution per option |
| `GET` | `/analytics/regions/{survey_id}` | Returns response distribution by region |
| `GET` | `/analytics/engagement/{survey_id}` | Returns opened, completed, abandoned, and completion rate |
| `GET` | `/analytics/surveys/{survey_id}/dashboard` | Returns full dashboard analytics for a survey |

### Answer Results

```http
GET /analytics/results/9
```

Example response:

```json
{
  "survey_id": 9,
  "results": [
    {
      "option_id": 84,
      "option_text": "Beach Destinations",
      "count": 12
    }
  ]
}
```

### Regional Analytics

```http
GET /analytics/regions/9
```

Example response:

```json
{
  "survey_id": 9,
  "regions": [
    {
      "region": "Center District",
      "count": 8
    }
  ]
}
```

### Engagement Analytics

```http
GET /analytics/engagement/9
```

Example response:

```json
{
  "survey_id": 9,
  "opened": 30,
  "completed": 22,
  "abandoned": 8,
  "completion_rate": 73.33
}
```

### Dashboard Analytics

```http
GET /analytics/surveys/9/dashboard
```

The dashboard endpoint returns:

| Field | Description |
|---|---|
| `survey` | Survey metadata |
| `summary` | Total responses and engagement metrics |
| `geo_enabled` | Indicates whether location analytics are enabled |
| `regions` | Response distribution by region |
| `questions` | Per-question answer distribution |

---

## Health Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Checks if the backend server is running |
| `GET` | `/db-test` | Tests PostgreSQL database connectivity |