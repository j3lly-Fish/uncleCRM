'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react'
import styles from '../contacts.module.css'
import { createEvent, deleteEvent } from '../../calendar/actions'

interface CRMEvent {
  id: string
  title: string
  event_date: string
}

export default function ContactEvents({ contactId, events }: { contactId: string, events: CRMEvent[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !eventDate || !eventTime) return

    setLoading(true)
    const dateTime = new Date(`${eventDate}T${eventTime}`).toISOString()

    const formData = new FormData()
    formData.append('title', title)
    formData.append('event_date', dateTime)
    formData.append('contact_id', contactId)

    const res = await createEvent(formData)
    if (res.success) {
      setTitle('')
      setEventDate('')
      setEventTime('')
      setIsAdding(false)
      window.location.reload()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    setLoadingId(eventId)
    const res = await deleteEvent(eventId, contactId)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.error)
      setLoadingId(null)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={20} className="text-blue-500" />
          Scheduled Events
        </h3>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`${styles.btn}`}
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
        >
          <Plus size={16} />
          {isAdding ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Event Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date *</label>
              <input 
                type="date" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                required 
                style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Time *</label>
              <input 
                type="time" 
                value={eventTime} 
                onChange={(e) => setEventTime(e.target.value)} 
                required 
                style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className={`${styles.btn} ${styles.primaryBtn}`} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Event'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {events.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
            No events scheduled for this contact.
          </p>
        ) : (
          events.map(event => {
            const date = new Date(event.event_date)
            return (
              <div key={event.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--accent-primary)'
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={14} />
                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(event.id)}
                  disabled={loadingId === event.id}
                  className={`${styles.btn}`}
                  style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                  title="Delete"
                >
                  {loadingId === event.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
