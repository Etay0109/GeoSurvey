# Analytics

GeoSurvey provides real-time analytics that help developers understand user engagement and survey performance.

The analytics dashboard is available through the Developer Portal.

## Analytics Dashboard

![Analytics Dashboard](./screenshots/dashboard.png)


## Engagement Metrics

The platform tracks user interaction with surveys using engagement events.

| Metric | Description | Purpose |
|----------|----------|----------|
| Opened Surveys | Number of times a survey was displayed | Measures survey reach |
| Completed Surveys | Number of submitted surveys | Measures successful participation |
| Abandoned Surveys | Number of surveys closed before submission | Identifies user drop-off |
| Completion Rate | Percentage of opened surveys that were completed | Evaluates survey effectiveness |

## Completion Rate Formula

Calculated as:

```text
(completed surveys / opened surveys) × 100
```

This metric helps developers evaluate survey effectiveness.


## Geographic Analytics

When location collection is enabled, GeoSurvey provides regional analytics.

| Example Regions |
|---|
| Center District |
| Northern District |
| Southern District |
| Jerusalem District |

Developers can identify geographic trends and compare survey responses between regions.


## Question Analytics

For each survey question, the dashboard displays detailed answer statistics.

| Capability | Description |
|---|---|
| Answer Counts | Total responses received for each answer option |
| Distribution Percentages | Percentage breakdown of responses |
| Regional Breakdown | Responses grouped by geographic region |

This helps developers understand user preferences and behavior.


## Analytics Workflow

```text
User Opens Survey
        ↓
Engagement Event Recorded
        ↓
User Submits Response
        ↓
Response Stored In PostgreSQL
        ↓
Analytics Summary Updated
        ↓
Dashboard Displays Results
```


## Supported Analytics

| Metric | Description |
|----------|----------|
| Opened Surveys | Number of survey openings |
| Completed Surveys | Number of completed surveys |
| Abandoned Surveys | Number of abandoned surveys |
| Completion Rate | Survey completion percentage |
| Regional Analytics | Geographic response distribution |
| Question Analytics | Answer distribution per question |


## Benefits

| Benefit | Value |
|---|---|
| Survey Engagement | Understand how users interact with surveys |
| Completion Analysis | Measure survey effectiveness |
| Geographic Insights | Compare responses across regions |
| User Preferences | Identify popular answer choices |
| Survey Optimization | Improve future surveys |
| Data-Driven Decisions | Support product decisions using analytics |