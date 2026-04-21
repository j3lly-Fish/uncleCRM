'use client'

import { useState, useRef } from 'react'
import { createContact } from './actions'
import { ScanText, Loader2, Tag as TagIcon } from 'lucide-react'
import Tesseract from 'tesseract.js'
import styles from '../contacts.module.css'

interface Tag {
  id: string
  name: string
  color: string
}

export default function ContactForm({ availableTags }: { availableTags: Tag[] }) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    mobile_carrier: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setError('')

    try {
      const result = await Tesseract.recognize(file, 'eng')
      const text = result.data.text
      
      const newFormData = { ...formData }
      const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
      if (emailMatch) newFormData.email = emailMatch[0]

      const phoneMatch = text.match(/(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})/)
      if (phoneMatch) newFormData.phone = phoneMatch[0]
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      if (lines.length > 0 && !newFormData.name) {
         newFormData.name = lines[0]
      }

      setFormData(newFormData)
    } catch (err: any) {
      setError(err.message || 'Failed to scan image.')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <form action={createContact} className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hidden input for tags */}
      <input type="hidden" name="tags" value={selectedTagIds.join(',')} />

      {/* OCR Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px dashed var(--accent-primary)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ScanText size={20} className="text-blue-500" />
          Scan Business Card
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Upload an image of a business card to auto-fill details.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className={`${styles.btn} ${styles.primaryBtn}`}
            disabled={isScanning}
          >
            {isScanning ? <Loader2 size={18} className="animate-spin" /> : <ScanText size={18} />}
            {isScanning ? 'Scanning...' : 'Upload Image'}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleOcrUpload}
            style={{ display: 'none' }}
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem', fontSize: '0.875rem' }}>{error}</p>}
      </div>

      {/* Tags Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TagIcon size={16} />
          Assign Tags
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
          {availableTags.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              No tags found. Create some in the <a href="/dashboard/tags" style={{ color: 'var(--accent-primary)' }}>Tags page</a>.
            </p>
          ) : (
            availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: `2px solid ${selectedTagIds.includes(tag.id) ? tag.color : 'transparent'}`,
                  backgroundColor: selectedTagIds.includes(tag.id) ? `${tag.color}20` : 'var(--bg-secondary)',
                  color: selectedTagIds.includes(tag.id) ? tag.color : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {tag.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Name *</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Birthday</label>
          <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Address</label>
        <textarea name="address" rows={3} value={formData.address} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Mobile Carrier</label>
        <select name="mobile_carrier" value={formData.mobile_carrier} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <option value="">None / Unknown</option>
          <option value="vtext.com">Verizon (vtext.com)</option>
          <option value="txt.att.net">AT&T (txt.att.net)</option>
          <option value="tmomail.net">T-Mobile (tmomail.net)</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`}>
          Save Contact
        </button>
      </div>
    </form>
  )
}
