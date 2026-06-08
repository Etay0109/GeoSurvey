package com.example.geosurvey_sdk.ui

import android.app.Dialog
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import androidx.core.content.ContextCompat
import androidx.fragment.app.DialogFragment
import com.example.geosurvey_sdk.R
import com.example.geosurvey_sdk.databinding.DialogSurveyBinding
import com.example.geosurvey_sdk.databinding.ItemSurveyOptionBinding
import com.example.geosurvey_sdk.model.QuestionDto
import com.example.geosurvey_sdk.model.SurveyDto
import com.example.geosurvey_sdk.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.example.geosurvey_sdk.model.ResponseAnswerDto
import com.example.geosurvey_sdk.model.ResponseBatchRequest
import com.example.geosurvey_sdk.storage.LocalResponseStorage
import com.example.geosurvey_sdk.model.EngagementEventRequest
import com.example.geosurvey_sdk.SurveySdk
import com.example.geosurvey_sdk.location.GeoSurveyLocationManager
import android.Manifest
import androidx.activity.result.contract.ActivityResultContracts
class SurveyDialog : DialogFragment() {

    private var surveyId: Int = 0
    private var baseUrl: String = ""

    private var survey: SurveyDto? = null
    private var currentQuestionIndex = 0
    private var surveyCompleted = false
    private var currentRegion: String? = null

    private val selectedAnswers = mutableMapOf<Int, MutableSet<Int>>()

    private var _binding: DialogSurveyBinding? = null
    private val binding get() = _binding!!
    private val locationPermissionLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) {
                val locationManager = GeoSurveyLocationManager(requireContext())
                locationManager.getCurrentRegion { region ->
                    currentRegion = region
                }
            } else {
                currentRegion = "Unknown"
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        surveyId = arguments?.getInt("survey_id") ?: 0
        baseUrl = arguments?.getString("base_url") ?: ""
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        _binding = DialogSurveyBinding.inflate(layoutInflater)

        val dialog = Dialog(requireContext())
        dialog.setContentView(binding.root)

        binding.btnClose.setOnClickListener {
            if (!surveyCompleted) {
                trackEngagementEvent("abandoned")
            }

            dismiss()
        }

        binding.btnSkip.setOnClickListener {
            goToNextQuestion()
        }

        binding.btnNext.setOnClickListener {
            val currentSurvey = survey ?: return@setOnClickListener
            val question = currentSurvey.questions[currentQuestionIndex]

            // Block next if no answer selected
            if (selectedAnswers[question.id].isNullOrEmpty()) {
                binding.tvQuestion.setTextColor(ContextCompat.getColor(requireContext(), R.color.errorRed))
                return@setOnClickListener
            }

            binding.tvQuestion.setTextColor(ContextCompat.getColor(requireContext(), R.color.questionBlack))
            if (isLastQuestion()) {
                saveResponsesLocally()
                syncPendingResponsesToServer()
            } else {
                goToNextQuestion()
            }
        }

        loadSurvey()

        return dialog
    }

    //Fetches the survey data from the server using the base URL and survey ID
    private fun loadSurvey() {
        val api = RetrofitClient.create(baseUrl)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val loadedSurvey = api.getSurvey(surveyId)

                withContext(Dispatchers.Main) {
                    survey = loadedSurvey
                    currentQuestionIndex = 0

                    trackEngagementEvent("opened")
                    if (SurveySdk.isLocationEnabled()) {
                        val locationManager = GeoSurveyLocationManager(requireContext())

                        if (locationManager.hasLocationPermission()) {
                            locationManager.getCurrentRegion { region ->
                                currentRegion = region
                            }
                        } else {
                            locationPermissionLauncher.launch(
                                Manifest.permission.ACCESS_FINE_LOCATION
                            )
                        }
                    }
                    syncPendingResponsesToServer(
                        showThankYouAfterSync = false,
                        shouldTrackCompleted = false
                    )

                    if (loadedSurvey.questions.isEmpty()) {
                        showEmptySurvey(loadedSurvey.title)
                    } else {
                        showQuestion()
                    }
                }

            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showError()
                }
            }
        }
    }


    // Displays the current question text, progress, buttons and answer options
    private fun showQuestion() {
        val currentSurvey = survey ?: return
        val question = currentSurvey.questions[currentQuestionIndex]

        binding.tvTitle.text = currentSurvey.title
        binding.tvQuestion.text = question.text

        updateProgress(currentSurvey.questions.size)
        updateButtons()
        renderOptions(question)
    }


    // Renders the answer options for the current question and highlights the selected one
    private fun renderOptions(question: QuestionDto) {
        binding.optionsContainer.removeAllViews()

        question.options.forEach { option ->
            val optionBinding = ItemSurveyOptionBinding.inflate(
                LayoutInflater.from(requireContext()),
                binding.optionsContainer,
                false
            )

            optionBinding.tvOptionText.text = option.text

            val selectedSet = selectedAnswers[question.id] ?: mutableSetOf()
            optionBinding.radioBtn.isChecked = selectedSet.contains(option.id)

            optionBinding.root.setOnClickListener {
                if (question.type == "radio") {
                    selectedAnswers[question.id] = mutableSetOf(option.id)
                } else if (question.type == "checkbox") {
                    val currentSelected = selectedAnswers[question.id] ?: mutableSetOf()

                    if (currentSelected.contains(option.id)) {
                        currentSelected.remove(option.id)
                    } else {
                        currentSelected.add(option.id)
                    }

                    selectedAnswers[question.id] = currentSelected
                }

                renderOptions(question)
            }

            binding.optionsContainer.addView(optionBinding.root)
        }
    }

    // Updates the progress bar and the question counter label
    private fun updateProgress(totalQuestions: Int) {
        val currentNumber = currentQuestionIndex + 1

        binding.tvProgressLabel.text = "$currentNumber/$totalQuestions"
        binding.progressBar.progress =
            ((currentNumber.toFloat() / totalQuestions) * 100).toInt()
    }


    // Adjusts the bottom buttons when reaching the last question
    private fun updateButtons() {
        if (isLastQuestion()) {

            binding.btnSkip.visibility = View.GONE
            binding.spacer.visibility = View.GONE

            binding.btnNext.text = "Submit"

            val params =
                binding.btnNext.layoutParams as LinearLayout.LayoutParams

            params.width =
                resources.getDimensionPixelSize(R.dimen.submit_button_width)

            params.height =
                resources.getDimensionPixelSize(R.dimen.submit_button_height)

            binding.btnNext.layoutParams = params

            binding.bottomBar.gravity = Gravity.CENTER
        }
    }

    // Moves to the next question in the survey
    private fun goToNextQuestion() {
        val currentSurvey = survey ?: return

        if (currentQuestionIndex < currentSurvey.questions.size - 1) {
            currentQuestionIndex++
            showQuestion()
        }
    }

    // Returns true if the current question is the last one in the survey
    private fun isLastQuestion(): Boolean {
        val currentSurvey = survey ?: return false
        return currentQuestionIndex == currentSurvey.questions.size - 1
    }

    // Saves selected answers locally before syncing them to the server
    private fun saveResponsesLocally() {
        val currentSurvey = survey ?: return

        val answers = selectedAnswers.flatMap { entry ->
            entry.value.map { optionId ->
                ResponseAnswerDto(
                    survey_id = currentSurvey.id,
                    question_id = entry.key,
                    option_id = optionId,
                    region = currentRegion ?: "Unknown"
                )
            }
        }

        val request = ResponseBatchRequest(
            responses = answers
        )

        val storage = LocalResponseStorage(requireContext())
        storage.savePendingResponses(request)

    }

    // Attempts to send locally saved responses to the server.
    private fun syncPendingResponsesToServer(
        showThankYouAfterSync: Boolean = true,
        shouldTrackCompleted: Boolean = true
    ) {
        val storage = LocalResponseStorage(requireContext())
        val pendingRequest = storage.getPendingResponses()

        if (pendingRequest == null || pendingRequest.responses.isEmpty()) {
            if (showThankYouAfterSync) {
                showThankYouScreen()
            }
            return
        }

        val api = RetrofitClient.create(baseUrl)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                api.submitResponses(pendingRequest)

                if (shouldTrackCompleted) {
                    trackEngagementEvent("completed")
                    surveyCompleted = true
                }

                storage.clearPendingResponses()

                withContext(Dispatchers.Main) {
                    if (showThankYouAfterSync) {
                        showThankYouScreen()
                    }
                }

            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    if (showThankYouAfterSync) {
                        showThankYouScreen()
                    }
                }
            }
        }
    }

    // Sends an engagement event to the server.
    private fun trackEngagementEvent(eventType: String) {

        val request = EngagementEventRequest(
            survey_id = surveyId,
            event_type = eventType
        )

        val api = RetrofitClient.create(baseUrl)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                api.sendEngagementEvent(request)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // Hides the survey content and shows the thank you screen with a Done button
    private fun showThankYouScreen() {
        binding.scrollContent.visibility = View.GONE
        binding.thankYouContainer.visibility = View.VISIBLE
        binding.progressBar.visibility = View.GONE
        binding.tvProgressLabel.visibility = View.GONE
        binding.btnSkip.visibility = View.GONE
        binding.spacer.visibility = View.GONE

        binding.btnNext.text = "Done"
        val params = binding.btnNext.layoutParams as LinearLayout.LayoutParams
        params.width = LinearLayout.LayoutParams.MATCH_PARENT
        binding.btnNext.layoutParams = params

        binding.btnNext.setOnClickListener {
            dismiss()
        }
    }

    // Shows a message when the survey has no questions
    private fun showEmptySurvey(title: String) {
        binding.tvTitle.text = title
        binding.tvQuestion.text = "No questions found"
        binding.optionsContainer.removeAllViews()
        binding.bottomBar.visibility = View.GONE
    }
    // Shows an error message when the survey fails to load
    private fun showError() {
        binding.tvTitle.text = "Error"
        binding.tvQuestion.text = "Failed to load survey"
        binding.optionsContainer.removeAllViews()
        binding.bottomBar.visibility = View.GONE
    }

    override fun onStart() {
        super.onStart()

        dialog?.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.90).toInt(),
            (resources.displayMetrics.heightPixels * 0.65).toInt()
        )
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance(
            surveyId: Int,
            baseUrl: String
        ): SurveyDialog {
            val dialog = SurveyDialog()

            val args = Bundle()
            args.putInt("survey_id", surveyId)
            args.putString("base_url", baseUrl)

            dialog.arguments = args

            return dialog
        }
    }
}