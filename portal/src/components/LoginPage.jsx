import { useState } from 'react'
import './LoginPage.css'
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
        alert(data.detail || 'Login failed')
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#4A80F5" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#4A80F5" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#4A80F5" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#4A80F5" strokeWidth="2"/>
          </svg>
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

          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">Or login with</span>
            <span className="login-divider-line" />
          </div>

          <button className="login-google-btn">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>

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