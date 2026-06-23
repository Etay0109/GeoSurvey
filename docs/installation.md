# Installation

This guide explains how to install and configure the GeoSurvey Android SDK.

## Requirements

| Requirement | Version |
|---|---|
| Android Studio | Latest Version |
| Kotlin | 1.9+ |
| minSdk | 26 |
| compileSdk | 36 |


## Add the SDK

Add the GeoSurvey SDK module to your Android project.

```gradle
implementation(project(":geosurvey-sdk"))
```


## Configure Android Permissions

If location collection is enabled, add the following permission to your AndroidManifest.xml file.

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```


## Initialize the SDK

```kotlin
SurveySdk.initialize(
    baseUrl = "http://YOUR_SERVER_IP:8000",
    enableLocation = true
)
```

## Next Step

Continue to the Get Started guide to display your first survey.
