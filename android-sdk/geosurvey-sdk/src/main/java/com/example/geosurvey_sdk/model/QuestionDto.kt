package com.example.geosurvey_sdk.model

//Dto = Data Transfer Object
data class QuestionDto(
    val id: Int,
    val text: String,
    val type: String,
    val order: Int,
    val options: List<OptionDto>
)