# Database Design

GeoSurvey uses PostgreSQL as its primary database for storing surveys, questions, responses, engagement events, and analytics summaries.

The database is designed to support:

- Survey management
- Survey responses
- Geographic analytics
- Engagement analytics

## ERD Diagram

![Database ERD](./diagrams/database-erd.png)

The ERD illustrates the relationships between surveys, questions, answer options, user responses, engagement events, and analytics summaries.

## Relationships

| Relationship | Description |
|---|---|
| Developer → Survey | One developer can create multiple surveys |
| Survey → Question | One survey can contain multiple questions |
| Question → SurveyOption | One question can contain multiple answer options |
| Survey → Response | One survey can receive multiple responses |
| Survey → EngagementEvent | One survey can generate multiple engagement events |
| Survey → SurveyAnalyticsSummary | One survey has a single analytics summary record |


## Developer

Stores developer account information.

| Field | Type |
|---|---|
| id | Integer |
| name | String |
| email | String |
| password_hash | String |
| created_at | DateTime |

The Developer entity is responsible for authentication and ownership of surveys created through the Developer Portal.


## Survey

Stores survey metadata.

| Field | Type |
|---|---|
| id | Integer |
| title | String |
| status | String |
| location_enabled | Boolean |
| developer_id | Integer |
| created_at | DateTime |


## Question

Stores survey questions.

| Field | Type |
|---|---|
| id | Integer |
| survey_id | Integer |
| text | String |
| type | String |
| order | Integer |


## SurveyOption

Stores answer options.

| Field | Type |
|---|---|
| id | Integer |
| question_id | Integer |
| text | String |
| order | Integer |


## Response

Stores user answers.

| Field | Type |
|---|---|
| id | Integer |
| survey_id | Integer |
| question_id | Integer |
| option_id | Integer |
| region | String (Nullable) |
| created_at | DateTime |


## EngagementEvent

Stores user interactions.

| Field | Type |
|---|---|
| id | Integer |
| survey_id | Integer |
| event_type | String |
| created_at | DateTime |


## SurveyAnalyticsSummary

Stores aggregated analytics data.

| Field | Type |
|---|---|
| survey_id | Integer |
| opened_count | Integer |
| completed_count | Integer |
| abandoned_count | Integer |
| total_responses | Integer |


## Why This Design?

This design separates survey definitions, user interactions, and analytics data into dedicated tables.

The separation improves maintainability, reduces data duplication, and enables efficient analytics queries even when processing a large number of survey responses.