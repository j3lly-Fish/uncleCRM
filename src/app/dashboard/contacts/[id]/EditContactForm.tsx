'use client'

import { useState } from 'react'
import { updateContact, deleteContact } from './actions'
import styles from '../contacts.module.css'
import { Tag as TagIcon } from 'lucide-react'

interface Tag {
  id: string
  name: string
  color: string
}

export default function EditContactForm({ contact, allTags }: { contact: any, allTags: Tag[] }) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(contact.selectedTagIds || [])
  const [formData, setFormData] = useState({
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    address: contact.address || '',
    birthday: contact.birthday ? contact.birthday.split('T')[0] : '',
    mobile_carrier: contact.mobile_carrier || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <form action={updateContact} className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <input type="hidden" name="id" value={contact.id} />
        <input type="hidden" name="tags" value={selectedTagIds.join(',')} />

        {/* Tags Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TagIcon size={16} />
            Assign Tags
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            {allTags.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                No tags found. Create some in the <a href="/dashboard/tags" style={{ color: 'var(--accent-primary)' }}>Tags page</a>.
              </p>
            ) : (
              allTags.map(tag => (
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button formAction={updateContact} className={`${styles.btn} ${styles.primaryBtn}`}>
            Save Changes
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a 
               href={`/api/contacts/${contact.id}/vcard`}
               className={styles.btn} 
               style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', textDecoration: 'none' }}
            >
               Export vCard
            </a>
            <button formAction={deleteContact} className={styles.btn} style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={(e) => { if(!confirm('Are you sure you want to delete this contact?')) e.preventDefault(); }}>
               Delete Contact
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
