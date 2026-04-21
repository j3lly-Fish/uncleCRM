'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      className="btn primary-btn"
      onClick={() => window.print()}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.5rem', 
        background: 'var(--accent-primary)', color: 'white', 
        padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', 
        border: 'none', cursor: 'pointer', fontWeight: 600
      }}
    >
      <Printer size={18} />
      Print Labels
    </button>
  )
}
