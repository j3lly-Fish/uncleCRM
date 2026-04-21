'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Trash2, Tag as TagIcon, X } from 'lucide-react'
import styles from './contacts.module.css'
import { bulkDeleteContacts, bulkAddTag } from './bulk-actions'

interface Tag {
  id: string
  name: string
  color: string
}

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  last_contact: string | null
  tags: Tag[]
}

export default function ContactList({ initialContacts, allTags }: { initialContacts: Contact[], allTags: Tag[] }) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkTagging, setIsBulkTagging] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fuzzy search logic
  const filteredContacts = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return initialContacts

    return initialContacts.filter(c => {
      const nameMatch = c.name?.toLowerCase().includes(query)
      const emailMatch = c.email?.toLowerCase().includes(query)
      const phoneMatch = c.phone?.toLowerCase().includes(query)
      const tagMatch = c.tags?.some(t => t.name.toLowerCase().includes(query))
      return nameMatch || emailMatch || phoneMatch || tagMatch
    })
  }, [search, initialContacts])

  // Selection logic
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredContacts.map(c => c.id))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} contacts?`)) return
    setLoading(true)
    const res = await bulkDeleteContacts(selectedIds)
    if (res.success) {
      setSelectedIds([])
      window.location.reload()
    } else {
      alert('Delete failed: ' + res.error)
    }
    setLoading(false)
  }

  const handleBulkTag = async (tagId: string) => {
    setLoading(true)
    const res = await bulkAddTag(selectedIds, tagId)
    if (res.success) {
      setSelectedIds([])
      setIsBulkTagging(false)
      window.location.reload()
    } else {
      alert('Tagging failed: ' + res.error)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Actions Bar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search by name, email, phone, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="animate-fade-in" style={{ 
          background: 'var(--accent-primary)', 
          color: 'white', 
          padding: '0.75rem 1.5rem', 
          borderRadius: 'var(--border-radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>{selectedIds.length} selected</span>
            <button onClick={() => setSelectedIds([])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsBulkTagging(!isBulkTagging)}
                className={styles.btn} 
                style={{ background: 'white', color: 'var(--accent-primary)', padding: '0.4rem 1rem' }}
              >
                <TagIcon size={16} />
                Tag Selected
              </button>
              {isBulkTagging && (
                <div className="glass-panel" style={{ 
                  position: 'absolute', 
                  top: '120%', 
                  right: 0, 
                  minWidth: '200px', 
                  background: 'var(--bg-secondary)', 
                  padding: '0.5rem', 
                  zIndex: 100,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '0.5rem' }}>Select tag to apply:</p>
                  {allTags.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', padding: '0.5rem', fontSize: '0.875rem' }}>No tags found. Go to Tags page first.</p>
                  ) : (
                    allTags.map(tag => (
                      <button 
                        key={tag.id}
                        onClick={() => handleBulkTag(tag.id)}
                        style={{ 
                          width: '100%', 
                          textAlign: 'left', 
                          padding: '0.5rem', 
                          borderRadius: 'var(--border-radius-sm)', 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: tag.color }}></div>
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={handleBulkDelete}
              className={styles.btn} 
              style={{ background: 'var(--danger)', color: 'white', padding: '0.4rem 1rem' }}
              disabled={loading}
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`glass-panel ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Tags</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>No contacts matching your search.</td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className={styles.tr}>
                  <td className={styles.td}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>
                  <td className={styles.td}>
                    <Link href={`/dashboard/contacts/${contact.id}`} className="font-medium hover:text-blue-500 transition-colors" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
                      {contact.name}
                    </Link>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {contact.tags.map(tag => (
                        <span 
                          key={tag.id} 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.1rem 0.5rem', 
                            borderRadius: '10px', 
                            backgroundColor: `${tag.color}20`, 
                            color: tag.color,
                            border: `1px solid ${tag.color}40`,
                            fontWeight: 600
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.td}>{contact.email || '-'}</td>
                  <td className={styles.td}>{contact.phone || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
