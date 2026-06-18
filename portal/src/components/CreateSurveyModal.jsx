import { useState } from 'react'
import Toggle from './Toggle'


// Allows creating a new survey.
export default function CreateSurveyModal({ onClose, onCreate }) {
  const [step, setStep]                       = useState(1)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [title, setTitle] = useState('')

  const [questions, setQuestions] = useState([
    {
      text: '',
      answerType: 'single',
      options: ['', '']
    }
  ])

const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

const currentQuestion = questions[currentQuestionIndex]

const updateCurrentQuestion = (patch) => {
  const nextQuestions = [...questions]

  nextQuestions[currentQuestionIndex] = {
    ...currentQuestion,
    ...patch
  }

  setQuestions(nextQuestions)
}
  // Adds a new answer option to the current question.
  const addOption = () => {
    updateCurrentQuestion({
      options: [...currentQuestion.options, '']
    })
  }
  // Removes an answer option from the current question.
  const removeOption = (i) => {
  if (currentQuestion.options.length > 2) {
    updateCurrentQuestion({
      options: currentQuestion.options.filter(
        (_, idx) => idx !== i
      )
    })
  }
}
  // Updates the text of an answer option.
  const updateOption = (i, val) => {
    const nextOptions = [...currentQuestion.options]
    nextOptions[i] = val

    updateCurrentQuestion({
      options: nextOptions
    })
  }

  // Adds a new question to the survey.
  const addQuestion = () => {
  const nextQuestions = [
    ...questions,
    {
      text: '',
      answerType: 'single',
      options: ['', '']
    }
  ]

  setQuestions(nextQuestions)
  setCurrentQuestionIndex(nextQuestions.length - 1)
}

// Validates the survey before submission.
const validateSurvey = () => {
  if (!title.trim()) {
    alert('Please enter a survey title')
    return false
  }

  for (const question of questions) {
    if (!question.text.trim()) {
      alert('Please enter text for all questions')
      return false
    }

    const validOptions = question.options.filter(
      option => option.trim() !== ''
    )

    if (validOptions.length < 2) {
      alert('Each question must have at least 2 answer options')
      return false
    }
  }

  return true
}
  // Creates and submits a new survey.
  const handleCreate = () => {
  if (!validateSurvey()) return

  onCreate({
    title,
    questions,
    locationEnabled
  })

  onClose()
}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <button className="modal-back" onClick={step === 2 ? () => setStep(1) : onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <h2 className="modal-title">Create New Survey</h2>
          <div style={{ width: 26 }} />
        </div>

        <div className="modal-step-bar">
          <div className="modal-step-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        {step === 1 && (
          <div className="modal-body">
            <div className="modal-settings-title">Survey Settings</div>
            <p className="modal-settings-subtitle">Customize how data is collected and managed.</p>

            <div className="modal-setting-card">
              <div className="modal-setting-left" style={{ marginLeft: 0, marginRight: 'auto' }}>
                <div className="modal-setting-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="modal-setting-right">
                  <span className="modal-setting-name">Location Permission</span>
                  <span className="modal-setting-desc">Collect GPS data from respondents</span>
                </div>
              </div>
              <Toggle checked={locationEnabled} onChange={setLocationEnabled} />
            </div>

            <div className="modal-setting-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
              <div className="modal-setting-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="modal-setting-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <span className="modal-setting-name">Answer Logic</span>
                </div>
              </div>
              <div className={`modal-radio-row ${currentQuestion.answerType === 'single' ? 'selected' : ''}`} onClick={() => updateCurrentQuestion({ answerType: 'single' })}>
                <span className="modal-radio-label">Single choice</span>
                <div className={`modal-radio ${currentQuestion.answerType === 'single' ? 'modal-radio-on' : ''}`}>
                  {currentQuestion.answerType === 'single' && <div className="modal-radio-dot" />}
                </div>
              </div>
              <div className={`modal-radio-row ${currentQuestion.answerType === 'multiple' ? 'selected' : ''}`} onClick={() => updateCurrentQuestion({ answerType: 'multiple' })}>
                <span className="modal-radio-label">Multiple choice</span>
                <div className={`modal-radio ${currentQuestion.answerType === 'multiple' ? 'modal-radio-on' : ''}`}>
                  {currentQuestion.answerType === 'multiple' && <div className="modal-radio-dot" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            <div className="survey-step-header">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <button className="modal-add-question" onClick={addQuestion}>+ Add Question</button>
            </div>

            <label className="modal-label">Survey title</label>
            <input className="modal-input" type="text" placeholder="Enter title..." value={title} onChange={e => setTitle(e.target.value)} />

            <label className="modal-label">Question</label>
            <textarea className="modal-textarea" placeholder="What would you like to ask?" value={currentQuestion.text} onChange={e => updateCurrentQuestion({ text: e.target.value })} rows={3} />

            <div className="modal-options-header">
              <span className="modal-label" style={{ margin: 0 }}>Answer Options</span>
              <span className="modal-options-type">{currentQuestion.answerType === 'single' ? 'Single choice' : 'Multiple choice'}</span>
            </div>

            <div className="modal-options-list">
              {currentQuestion.options.map((opt, i) => (
                <div key={i} className="modal-option-row">
                  <input className="modal-option-input" type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={e => updateOption(i, e.target.value)} />
                  <button className="modal-option-delete" onClick={() => removeOption(i)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button className="modal-add-option" onClick={addOption}>+ Add Option</button>
          </div>
        )}

        <div className="modal-footer">
          {step === 1 ? (
            <button className="modal-create-btn" onClick={() => setStep(2)}>Next</button>
          ) : (
            <div className="modal-nav-row">
              <button
                className="modal-nav-btn"
                onClick={() => {
                  if (currentQuestionIndex > 0) setCurrentQuestionIndex(i => i - 1)
                  else setStep(1)
                }}
              >
                Previous
              </button>
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  className="modal-create-btn modal-nav-next"
                  onClick={() => setCurrentQuestionIndex(i => i + 1)}
                >
                  Next
                </button>
              ) : (
                <button className="modal-create-btn modal-nav-next" onClick={handleCreate}>
                  Submit
                </button>
              )}
            </div>
          )}
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}