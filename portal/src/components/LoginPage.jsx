import { useState } from 'react'
import './LoginPage.css'
import GeoSurveyLogo from './GeoSurveyLogo'
import { API_URL } from '../config'

function LoginPage({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter email and password')
      return
    }

    fetch(`${API_URL}/developers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
    }),

    })
      .then(async r => {
        const data = await r.json()

        if (!r.ok) {
          const message = Array.isArray(data.detail)
          ? data.detail.map(error => error.msg).join('\n')
          : data.detail || 'Login failed'

          alert(message)
          return
        }

    localStorage.setItem('developer', JSON.stringify(data))
    onLogin(data)
    })
      .catch(console.error)
  }

  return (
    <div className="login-page">

      <div className="login-top-bar">
        <div className="login-logo-bar">
          <GeoSurveyLogo size={22} />
          <span>GeoSurvey</span>
        </div>
      </div>  

      <div className="login-center">
        <div className="login-card">
          <h2 className="login-card-title">Welcome</h2>
          <p className="login-card-sub">Login to manage your surveys</p>

          <label className="login-label">Email</label>
          <div className="login-input-wrapper">
            <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              className="login-input"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <label className="login-label">Password</label>
          <div className="login-input-wrapper">
            <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              className="login-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button className="login-btn" onClick={handleLogin}>Login</button>

          <p className="login-register">
            Don't have an account? <span className="login-register-link" onClick={onGoRegister}>Create new account</span>
          </p>
        </div>
      </div>

      <div className="login-footer">
        <span className="login-footer-brand">GeoSurvey</span>
        <span>© 2026 GeoSurvey Data Systems</span>
      </div>

    </div>
  )
}

export default LoginPage