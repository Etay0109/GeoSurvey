package com.example.geosurvey_sdk.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import android.location.Geocoder
import java.util.Locale
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class GeoSurveyLocationManager(
    private val context: Context
) {

    // Returns true if the app already has location permission.
    fun hasLocationPermission(): Boolean {
        val fineLocationGranted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val coarseLocationGranted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        return fineLocationGranted || coarseLocationGranted
    }

    // Gets the last known location and returns a temporary region value.
    @SuppressLint("MissingPermission")
    fun getCurrentRegion(
        onResult: (String?) -> Unit
    ) {

        if (!hasLocationPermission()) {
            onResult("Unknown")
            return
        }

        val fusedLocationClient =
            LocationServices.getFusedLocationProviderClient(context)

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val geocoder = Geocoder(context, Locale.ENGLISH)

                            val addresses = geocoder.getFromLocation(
                                location.latitude,
                                location.longitude,
                                1
                            )

                            val address = addresses?.firstOrNull()

                            val region =
                                address?.adminArea
                                    ?: address?.subAdminArea
                                    ?: address?.locality

                            onResult(
                                region ?: "Unknown"
                            )

                        } catch (e: Exception) {
                            onResult("Unknown")
                        }
                    }
                } else {
                    onResult("Unknown")
                }
            }
            .addOnFailureListener {
                onResult("Unknown")
            }
    }
}