'use client'

import { useState } from 'react'
import { createTag, deleteTag, updateTag } from './actions'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import styles from '../contacts/contacts.module.css'

interface Tag {
  id: string
  name: string
  color: string
}

export default function TagList({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    setLoading(true)
    const res = await createTag(newName, newColor)
    if (res.success) {
      setNewName('')
      window.location.reload()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove this tag from all contacts.')) return
    setLoading(true)
    const res = await deleteTag(id)
    if (res.success) {
      window.location.reload()
    }
    setLoading(false)
  }

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleUpdate = async (id: string) => {
    setLoading(true)
    const res = await updateTag(id, editName, editColor)
    if (res.success) {
      setEditingId(null)
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>New Tag Name</label>
          <input 
            type="text" 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Prospect"
            style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Color</label>
          <input 
            type="color" 
            value={newColor} 
            onChange={e => setNewColor(e.target.value)}
            style={{ width: '50px', height: '38px', padding: '2px', border: 'none', background: 'none', cursor: 'pointer' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !newName}
          className={`${styles.btn} ${styles.primaryBtn}`}
          style={{ height: '38px' }}
        >
          <Plus size={18} />
          Add
        </button>
      </form>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tags.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No tags created yet.</p>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
              {editingId === tag.id ? (
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    style={{ flex: 1, padding: '0.25rem 0.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--accent-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                  <input 
                    type="color" 
                    value={editColor} 
                    onChange={e => setEditColor(e.target.value)}
                    style={{ width: '40px', height: '30px', border: 'none', background: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleUpdate(tag.id)} style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', padding: '0.25rem 0.5rem' }}>
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'var(--text-tertiary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', padding: '0.25rem 0.5rem' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: tag.color }}></div>
                    <span style={{ fontWeight: 600 }}>{tag.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(tag)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(tag.id)} style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
