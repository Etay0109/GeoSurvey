package com.example.geosurvey_sdk.storage

import android.content.Context
import com.example.geosurvey_sdk.model.ResponseBatchRequest
import com.google.gson.Gson

class LocalResponseStorage(
    context: Context
) {
    private val sharedPreferences =
        context.getSharedPreferences("geosurvey_pending_responses", Context.MODE_PRIVATE)

    private val gson = Gson()

    // Saves pending survey responses locally as JSON.
    fun savePendingResponses(request: ResponseBatchRequest) {
        val json = gson.toJson(request)

        sharedPreferences.edit()
            .putString("pending_responses", json)
            .apply()
    }

    // Loads pending survey responses from local storage.
    fun getPendingResponses(): ResponseBatchRequest? {
        val json = sharedPreferences.getString("pending_responses", null)
            ?: return null

        return gson.fromJson(json, ResponseBatchRequest::class.java)
    }

    // Removes pending responses after successful sync.
    fun clearPendingResponses() {
        sharedPreferences.edit()
            .remove("pending_responses")
            .apply()
    }
}