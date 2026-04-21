'use client'

import { useState, useRef } from 'react'
import { FileText, Upload, Trash2, Download, Loader2, File as FileIcon } from 'lucide-react'
import styles from '../contacts.module.css'
import { deleteContactFile } from './file-actions'

interface ContactFile {
  id: string
  file_name: string
  created_at: string
}

export default function ContactFiles({ contactId, files }: { contactId: string, files: ContactFile[] }) {
  const [isUploading, setIsUploading] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('contactId', contactId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }
      
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    setLoadingId(fileId)
    const res = await deleteContactFile(fileId, contactId)
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
          <FileText size={20} className="text-blue-500" />
          Attached Files
        </h3>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${styles.btn}`}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {files.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
            No files attached to this contact yet.
          </p>
        ) : (
          files.map(file => (
            <div key={file.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1rem', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)', color: 'var(--accent-primary)' }}>
                  <FileIcon size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{file.file_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Uploaded {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a 
                  href={`/api/download/${file.id}`}
                  className={`${styles.btn}`}
                  style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <button 
                  onClick={() => handleDelete(file.id)}
                  disabled={loadingId === file.id}
                  className={`${styles.btn}`}
                  style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                  title="Delete"
                >
                  {loadingId === file.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
