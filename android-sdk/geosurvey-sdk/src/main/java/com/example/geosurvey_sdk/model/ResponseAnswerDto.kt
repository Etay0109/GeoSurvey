package com.example.geosurvey_sdk.model

data class ResponseAnswerDto(
    val survey_id: Int,
    val question_id: Int,
    val option_id: Int,
    val region: String? = null
)