package com.example.geosurvey_sdk.model

//Dto = Data Transfer Object
data class SurveyDto(
    val id: Int,
    val title: String,
    val status: String,
    val questions: List<QuestionDto>
)