import { useState } from 'react'

// Displays an ON/OFF toggle switch.
export default function Toggle({ checked, onChange }) {
  return (
    <div
      className={`toggle ${checked ? 'toggle-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="toggle-thumb" />
    </div>
  )
}