package com.example.geosurvey_sdk.network

import com.example.geosurvey_sdk.model.ResponseBatchRequest
import com.example.geosurvey_sdk.model.SurveyDto
import com.example.geosurvey_sdk.model.EngagementEventRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface SurveyApi {

    @GET("surveys/{surveyId}")
    suspend fun getSurvey(
        @Path("surveyId") surveyId: Int
    ): SurveyDto

    @POST("responses/batch")
    suspend fun submitResponses(
        @Body request: ResponseBatchRequest
    )

    @POST("engagement-events")
    suspend fun sendEngagementEvent(
        @Body request: EngagementEventRequest
    )
}