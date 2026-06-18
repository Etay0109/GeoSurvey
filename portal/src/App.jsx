import { useEffect, useState } from 'react'
import './App.css'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import EditSurveyModal from './components/EditSurveyModal'
import CreateSurveyModal from './components/CreateSurveyModal'
import { API_URL } from './config'

const REGION_COLORS = {
  Center:    '#4A80F5',
  North:     '#34C06E',
  South:     '#9B6FE8',
  Jerusalem: '#F5A623',
}

// Formats a date string into a readable format.
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Sub-components ───────────────────────────────────────────────────────────

// Displays the region color legend.
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

// Displays a bar chart for region statistics.
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

// Displays a single answer option and its results.
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

// Displays a survey question with all its options.
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

// Displays the survey status badge.
function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}

// ── Main App ─────────────────────────────────────────────────────────────────

// Main component that manages the portal.
export default function App() {
  const [developer, setDeveloper] = useState(() => {
    const savedDeveloper = localStorage.getItem('developer')
    return savedDeveloper ? JSON.parse(savedDeveloper) : null
  })

  const [selectedId, setSelectedId] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Loads the list of surveys for the logged-in developer.
  useEffect(() => {
  if (!developer) {
    setLoading(false)
    return
  }

  setLoading(true)

  fetch(`${API_URL}/surveys?developer_id=${developer.id}`)
    .then(r => r.json())
    .then(data => {
      const formatted = data.map(s => ({
        id: s.id,
        name: s.title,
        status: s.status,
        responses: 0,
        created: formatDate(s.created_at),
        stats: { opened: 0, completed: 0, abandoned: 0, rate: 0 },
        hasLocation: s.location_enabled,
        questions: [],
      }))

      setSurveys(formatted)
      if (formatted.length > 0) setSelectedId(formatted[0].id)
      setLoading(false)
    })
    .catch(() => setLoading(false))
}, [developer])

  // Loads dashboard analytics for the selected survey.
  useEffect(() => {
    if (!selectedId) return
    fetch(`${API_URL}/analytics/surveys/${selectedId}/dashboard`)
      .then(r => r.json())
      .then(data => {
        const formattedQuestions = data.questions.map(q => {
        const questionTotal = q.options.reduce(
          (sum, opt) => sum + opt.count,
          0
      )

      return {
        id: q.question_id,
        text: q.question_text,
        options: q.options.map(opt => ({
        label: opt.option_text,
        total: questionTotal === 0
          ? 0
          : Math.round((opt.count / questionTotal) * 100),
        respondents: opt.count,
        byRegion: opt.by_region || {
          Center: 0,
          North: 0,
          South: 0,
          Jerusalem: 0
        }
      }))
    }
  })
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

  // Sends a new survey to the backend.
  const handleCreate = ({ title, questions, locationEnabled }) => {
    fetch(`${API_URL}/surveys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        status: 'draft',
        location_enabled: locationEnabled,
        developer_id: developer.id,
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

  // Saves changes to an existing survey.
  const handleSave = ({ title, status }) => {
    if (!selectedId) return

    fetch(`${API_URL}/surveys/${selectedId}`, {
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

  const [showRegister, setShowRegister] = useState(false)

  if (!developer) {
    if (showRegister) {
      return <RegisterPage onRegister={setDeveloper} onGoLogin={() => setShowRegister(false)} />
    }
    return <LoginPage onLogin={setDeveloper} onGoRegister={() => setShowRegister(true)} />
  }

if (loading) return <div className="empty-state">Loading surveys...</div>

return (
  <div className="app-wrapper">

    <div className="top-bar">
      <div className="top-bar-user">
        <div className="top-bar-avatar">
          {developer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="top-bar-info">
          <span className="top-bar-name">{developer.name}</span>
          <span className="top-bar-role">Admin</span>
        </div>
        <div className="top-bar-divider" />
        <button className="top-bar-logout" onClick={() => {
          localStorage.removeItem('developer')
          setDeveloper(null)
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>

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
                <p className="meta">
                  Created {survey.created} ·{' '}
                  <span className={`status-inline status-${survey.status.toLowerCase()}`}>
                    {survey.status}
                  </span>
                </p>
              </div>
              <button className="btn-edit" onClick={() => setShowEditModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Survey
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
  </div>
  )
}