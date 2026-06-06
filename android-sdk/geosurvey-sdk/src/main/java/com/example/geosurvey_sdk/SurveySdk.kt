package com.example.geosurvey_sdk

import android.content.Context
import android.widget.Toast
import androidx.fragment.app.FragmentActivity
import com.example.geosurvey_sdk.ui.SurveyDialog

object SurveySdk {

    private var baseUrl: String? = null
    private var isInitialized = false
    private var enableLocation = false

    fun initialize(
        baseUrl: String,
        enableLocation: Boolean = false
    ) {
        this.baseUrl = baseUrl
        this.enableLocation = enableLocation
        isInitialized = true
    }

    fun isLocationEnabled(): Boolean {
        return enableLocation
    }

    fun showSurvey(
        context: Context,
        surveyId: Int
    ) {
        if (!isInitialized || baseUrl == null) {
            Toast.makeText(
                context,
                "SurveySdk is not initialized",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        if (context is FragmentActivity) {
            val dialog = SurveyDialog.newInstance(
                surveyId = surveyId,
                baseUrl = baseUrl!!
            )

            dialog.show(
                context.supportFragmentManager,
                "GeoSurveyDialog"
            )
        } else {
            Toast.makeText(
                context,
                "Context must be FragmentActivity",
                Toast.LENGTH_SHORT
            ).show()
        }
    }
}