'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

export default function MfaSettings({ isEnabled, factorId }: { isEnabled: boolean, factorId: string | null }) {
  const [loading, setLoading] = useState(false)
  const [qrCodeStr, setQrCodeStr] = useState<string | null>(null)
  const [newFactorId, setNewFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  
  const supabase = createClient()

  const handleEnable = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      setError(error.message)
    } else {
      setQrCodeStr(data.totp.qr_code)
      setNewFactorId(data.id)
    }
    setLoading(false)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFactorId) return
    setLoading(true)
    setError('')

    const challenge = await supabase.auth.mfa.challenge({ factorId: newFactorId })
    if (challenge.error) {
      setError(challenge.error.message)
      setLoading(false)
      return
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: newFactorId,
      challengeId: challenge.data.id,
      code: verifyCode,
    })

    if (verify.error) {
      setError(verify.error.message)
    } else {
      // Reload page to show it's enabled
      window.location.reload()
    }
    setLoading(false)
  }

  const handleDisable = async () => {
    if (!factorId) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) {
      setError(error.message)
    } else {
      window.location.reload()
    }
    setLoading(false)
  }

  if (isEnabled) {
    return (
      <div className="p-4 bg-green-50 text-green-900 border border-green-200 rounded-md mb-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <p className="font-semibold mb-4">2FA is currently enabled.</p>
        <button 
          onClick={handleDisable}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
          style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', cursor: 'pointer' }}
        >
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </button>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div>
    )
  }

  if (qrCodeStr) {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="font-medium">1. Scan this QR code with your authenticator app</p>
        <div className="bg-white p-4 rounded-md inline-block">
           <QRCodeSVG value={qrCodeStr} size={200} />
        </div>
        <p className="font-medium">2. Enter the 6-digit code</p>
        <div>
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
            className="px-3 py-2 border rounded-md"
            style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', cursor: 'pointer' }}
          >
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </button>
          <button 
            type="button" 
            onClick={() => setQrCodeStr(null)}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{error}</p>}
      </form>
    )
  }

  return (
    <div>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>2FA is currently disabled.</p>
      <button 
        onClick={handleEnable}
        disabled={loading}
        style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)', cursor: 'pointer' }}
      >
        {loading ? 'Setting up...' : 'Set up 2FA'}
      </button>
      {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  )
}
