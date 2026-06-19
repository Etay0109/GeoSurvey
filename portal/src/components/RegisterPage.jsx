import { useState } from 'react'
import './RegisterPage.css'
import GeoSurveyLogo from './GeoSurveyLogo'
import { API_URL } from '../config'

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    fetch(`${API_URL}/developers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password
}),
    })
      .then(async r => {
        const data = await r.json()

        if (!r.ok) {
          const message = Array.isArray(data.detail)
          ? data.detail.map(error => error.msg).join('\n')
          : data.detail || 'Register failed'

        alert(message)
        return
      }

        localStorage.setItem('developer', JSON.stringify(data))
        onRegister(data)
    })
    .catch(console.error)
  }

  return (
    <div className="register-page">

      <div className="register-top-bar">
        <span className="register-top-title">Create Account</span>
      </div>

      <div className="register-center">
        <div className="register-card">

          <div className="register-logo-wrap">
            <GeoSurveyLogo size={36} />
          </div>

          <h2 className="register-title">Join GeoSurvey</h2>
          <p className="register-sub">Start collecting and analyzing data with professional-grade tools.</p>

          <label className="register-label">Full Name</label>
          <div className="register-input-wrapper">
            <svg className="register-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              className="register-input"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <label className="register-label">Email Address</label>
          <div className="register-input-wrapper">
            <svg className="register-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
            <input
              className="register-input"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <label className="register-label">Password</label>
          <div className="register-input-wrapper">
            <svg className="register-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              className="register-input register-input-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="register-eye" onClick={() => setShowPassword(p => !p)}>
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <button className="register-btn" onClick={handleSubmit}>
            Sign Up →
          </button>

          <p className="register-login-link">
            Already have an account?{' '}
            <span className="register-link" onClick={onGoLogin}>Log in</span>
          </p>

        </div>
      </div>
    </div>
  )
}