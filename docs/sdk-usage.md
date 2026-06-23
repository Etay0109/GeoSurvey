# SDK Usage

This page explains how to integrate and use the GeoSurvey Android SDK.

## Android Permissions

If location collection is enabled, add the following permission to your AndroidManifest.xml file:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

This permission is only required when the SDK is configured with:

```kotlin
enableLocation = true
```

## Initialize the SDK

Before displaying surveys, initialize the SDK.

```kotlin
SurveySdk.initialize(
    baseUrl = "http://YOUR_SERVER_IP:8000",
    enableLocation = true
)
```

### Parameters

| Parameter | Description |
|------------|------------|
| baseUrl | Backend server URL |
| enableLocation | Enables optional location collection |

---

## Display a Survey

Display a survey inside your Android application.

```kotlin
SurveySdk.showSurvey(
    context = this,
    surveyId = YOUR_SURVEY_ID
)
```

Replace `YOUR_SURVEY_ID` with the ID of a published survey created through the Developer Portal.

### Parameters

| Parameter | Description |
|------------|------------|
| context | Current Android Activity |
| surveyId | Survey identifier |

---

## Check Location Status

Developers can verify whether location collection is enabled.

```kotlin
SurveySdk.isLocationEnabled()
```

Returns:

```kotlin
Boolean
```


## Public SDK Functions

| Function | Description |
|---|---|
| `SurveySdk.initialize()` | Initializes the SDK and configures the backend connection |
| `SurveySdk.showSurvey()` | Displays a survey inside the Android application |
| `SurveySdk.isLocationEnabled()` | Returns whether location collection is enabled |

## Supported Question Types

GeoSurvey currently supports:

### Single Choice

Users can select one option.

```text
Radio Button Survey
```

### Multiple Choice

Users can select multiple options.

```text
Checkbox Survey
```

---

## Location Collection

Location collection is optional.

When enabled:

- The SDK requests location permission.
- The user's district is collected.
- Regional analytics become available.

When disabled:

- No location permission is requested.
- Regional analytics are not collected.

---

## Offline Support

If network connectivity is unavailable:

1. Responses are stored locally on the device.
2. Responses remain available even when network connectivity is unavailable.
3. Responses remain stored until the SDK successfully connects to the backend.
4. Data is automatically synchronized once connectivity is restored.

---

## Survey Lifecycle

```text
Initialize SDK
      ↓
Fetch Survey
      ↓
Display Survey
      ↓
Collect Responses
      ↓
Store Locally (Optional)
      ↓
Sync To Backend
      ↓
Analytics Dashboard
```