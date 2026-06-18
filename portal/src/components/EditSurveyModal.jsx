import { useState } from 'react'

// Allows editing an existing survey.
export default function EditSurveyModal({ survey, onClose, onSave }) {
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