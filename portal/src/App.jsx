import { useEffect, useState } from 'react'
import './App.css'

const REGION_COLORS = {
  Center:    '#4A80F5',
  North:     '#34C06E',
  South:     '#9B6FE8',
  Jerusalem: '#F5A623',
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Sub-components ───────────────────────────────────────────────────────────

function RegionLegend() {
  return (
    <div className="region-legend">
      {Object.entries(REGION_COLORS).map(([name, color]) => (
        <span key={name} className="legend-item">
          <span className="legend-dot" style={{ background: color }} />
          {name}
        </span>
      ))}
    </div>
  )
}

function BarChart({ byRegion }) {
  const total = Object.values(byRegion).reduce((sum, v) => sum + v, 0)
  return (
    <div className="bar-chart">
      {Object.entries(byRegion).map(([region, count]) => {
        const pct = total === 0 ? 0 : Math.round((count / total) * 100)
        return (
          <div key={region} className="bar-col">
            <span className="bar-label">{pct}%</span>
            <div className="bar" style={{ height: `${pct === 0 ? 4 : pct * 0.6}px`, background: REGION_COLORS[region] }} />
          </div>
        )
      })}
    </div>
  )
}

function OptionCard({ option, showRegion }) {
  return (
    <div className="option-card">
      {showRegion && <BarChart byRegion={option.byRegion} />}

    {!showRegion && (
      <div className="single-bar-chart">
      <span className="bar-label">{option.total}%</span>

      <div
        className="single-bar"
        style={{
          height: `${option.total === 0 ? 4 : option.total * 0.6}px`
        }}
      />
    </div>
  )}
      <p className="option-label">{option.label}</p>
      <strong className="option-pct">{option.total}%</strong>
      <small className="option-respondents">{option.respondents.toLocaleString()} respondents</small>
    </div>
  )
}

function QuestionCard({ question, showRegion }) {
  return (
    <section className="question-card">
      <h3>{question.text}{showRegion ? ' — results by region' : ' — results'}</h3>
      <div className="options-grid">
        {question.options.map(opt => (
          <OptionCard key={opt.label} option={opt} showRegion={showRegion} />
        ))}
      </div>
    </section>
  )
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}

function Toggle({ checked, onChange }) {
  return (
    <div className={`toggle ${checked ? 'toggle-on' : ''}`} onClick={() => onChange(!checked)}>
      <div className="toggle-thumb" />
    </div>
  )
}

// ── Edit Survey Modal ─────────────────────────────────────────────────────────
function EditSurveyModal({ survey, onClose, onSave }) {
  const [title, setTitle]   = useState(survey.name)
  const [status, setStatus] = useState(survey.status.toLowerCase())

  const statuses = [
    { key: 'done',   label: 'Done',   icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )},
    { key: 'active', label: 'Active', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
    )},
    { key: 'draft',  label: 'Draft',  icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    )},
  ]

  const handleSave = () => {
    onSave({ title, status })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <button className="modal-back" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <h2 className="modal-title">Edit Survey</h2>
          <div style={{ width: 26 }} />
        </div>

        {/* Step bar — full since it's a single step */}
        <div className="modal-step-bar">
          <div className="modal-step-fill" style={{ width: '100%' }} />
        </div>

        <div className="modal-body">

          {/* Survey name */}
          <label className="modal-label">Survey Name</label>
          <div className="edit-input-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="edit-input-icon">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <input
              className="modal-input edit-input-with-icon"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Status */}
          <label className="modal-label">Status</label>
          <div className="edit-status-grid">
            {statuses.map(s => (
              <button
                key={s.key}
                className={`edit-status-btn ${status === s.key ? 'edit-status-active' : ''}`}
                onClick={() => setStatus(s.key)}
              >
                <span className="edit-status-icon">{s.icon}</span>
                <span className="edit-status-label">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Survey Details info card */}
          <div className="edit-info-card">
            <div className="edit-info-card-header">
              <span className="modal-setting-name">Survey Details</span>
              <div className="modal-setting-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
            </div>
            <p className="edit-info-card-desc">
              Changes will be applied immediately and will affect all respondents for this survey.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-create-btn" onClick={handleSave}>
            Save Changes
          </button>
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
        </div>

      </div>
    </div>
  )
}

// ── Create Survey Modal ───────────────────────────────────────────────────────
function CreateSurveyModal({ onClose, onCreate }) {
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

  const addOption = () => {
    updateCurrentQuestion({
      options: [...currentQuestion.options, '']
    })
  }
  const removeOption = (i) => {
  if (currentQuestion.options.length > 2) {
    updateCurrentQuestion({
      options: currentQuestion.options.filter(
        (_, idx) => idx !== i
      )
    })
  }
}
  const updateOption = (i, val) => {
    const nextOptions = [...currentQuestion.options]
    nextOptions[i] = val

    updateCurrentQuestion({
      options: nextOptions
    })
  }

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

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedId, setSelectedId]           = useState(null)
  const [surveys, setSurveys]                 = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal]     = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/surveys')
      .then(r => r.json())
      .then(data => {
        const formatted = data.map(s => ({
          id: s.id, name: s.title, status: s.status, responses: 0,
          created: formatDate(s.created_at),
          stats: { opened: 0, completed: 0, abandoned: 0, rate: 0 },
          hasLocation: s.location_enabled, questions: [],
        }))
        setSurveys(formatted)
        if (formatted.length > 0) setSelectedId(formatted[0].id)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetch(`http://127.0.0.1:8000/analytics/surveys/${selectedId}/dashboard`)
      .then(r => r.json())
      .then(data => {
        const totalResponses = data.summary.total_responses || 0
        const formattedQuestions = data.questions.map(q => ({
          id: q.question_id,
          text: q.question_text,
          options: q.options.map(opt => ({
            label: opt.option_text,
            total: totalResponses === 0 ? 0 : Math.round((opt.count / totalResponses) * 100),
            respondents: opt.count,
            byRegion: opt.by_region || { Center: 0, North: 0, South: 0, Jerusalem: 0 }
          }))
        }))
        setSurveys(prev => prev.map(s =>
          s.id === selectedId ? {
            ...s,
            name: data.survey.title, status: data.survey.status,
            responses: data.summary.total_responses,
            stats: {
              opened: data.summary.opened, completed: data.summary.completed,
              abandoned: data.summary.abandoned,
              rate: Math.round(data.summary.completion_rate)
            },
            hasLocation: data.geo_enabled, questions: formattedQuestions
          } : s
        ))
      })
      .catch(console.error)
  }, [selectedId])

  const survey = surveys.find(s => s.id === selectedId)

  const handleCreate = ({ title, questions, locationEnabled }) => {
    fetch('http://127.0.0.1:8000/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        status: 'draft',
        location_enabled: locationEnabled,
        questions: questions.map(q => ({
          text: q.text,
          type: q.answerType === 'single' ? 'radio' : 'checkbox',
          options: q.options
            .filter(o => o.trim() !== '')
            .map(o => ({ text: o }))
        }))
      }),
    })
      .then(r => r.json())
      .then(created => {
        const newSurvey = {
          id: created.id,
          name: created.title,
          status: created.status,
          responses: 0,
          created: '',
          stats: { opened: 0, completed: 0, abandoned: 0, rate: 0 },
          hasLocation: created.location_enabled,
          questions: [],
        }

        setSurveys(prev => [...prev, newSurvey])
        setSelectedId(newSurvey.id)
      })
      .catch(console.error)
  }

  const handleSave = ({ title, status }) => {
    if (!selectedId) return

    fetch(`http://127.0.0.1:8000/surveys/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status }),
    })
      .then(r => r.json())
      .then(updated => {
        setSurveys(prev => prev.map(s =>
          s.id === selectedId
            ? { ...s, name: updated.title, status: updated.status }
            : s
        ))
      })
      .catch(console.error)
  }

  if (loading) return <div className="empty-state">Loading surveys...</div>

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="logo">
          <svg className="logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12" stroke="#4A80F5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 3L9 7H15L12 3Z" fill="#4A80F5"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12" stroke="#4A80F5" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 21L15 17H9L12 21Z" fill="#4A80F5"/>
          </svg>
          GeoSurvey
        </div>

        <p className="section-title">MY SURVEYS</p>

        <div className="survey-list">
          {surveys.map(s => (
            <button
              key={s.id}
              className={`survey-item ${s.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(s.id)}
            >
              <div className="survey-item-top">
                <span className="survey-item-name">{s.name}</span>
                <StatusBadge status={s.status} />
              </div>
              <small>{s.responses.toLocaleString()} responses</small>
            </button>
          ))}
        </div>

        <button className="new-survey-btn" onClick={() => setShowCreateModal(true)}>
          + New Survey
        </button>
      </aside>

      <main className="dashboard">
        {survey ? (
          <>
            <header className="dashboard-header">
              <div>
                <h2>{survey.name}</h2>
                <p className="meta">Created {survey.created} · {survey.status}</p>
              </div>
              <button className="btn-edit" onClick={() => setShowEditModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            </header>

            <section className="summary-grid">
              {[
                { label: 'Opened',          value: survey.stats.opened.toLocaleString() },
                { label: 'Completed',       value: survey.stats.completed.toLocaleString() },
                { label: 'Abandoned',       value: survey.stats.abandoned.toLocaleString() },
                { label: 'Completion rate', value: `${survey.stats.rate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="summary-card">
                  <span className="summary-label">{label}</span>
                  <strong className="summary-value">{value}</strong>
                </div>
              ))}
            </section>

            {survey.hasLocation && <RegionLegend />}

            {survey.questions.length === 0 ? (
              <div className="empty-state">No responses yet.</div>
            ) : (
              survey.questions.map(q => (
                <QuestionCard key={q.id} question={q} showRegion={survey.hasLocation} />
              ))
            )}
          </>
        ) : (
          <div className="empty-state">No surveys found.</div>
        )}
      </main>

      {showCreateModal && (
        <CreateSurveyModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}

      {showEditModal && survey && (
        <EditSurveyModal
          survey={survey}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}