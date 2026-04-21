'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { bulkInsertContacts } from './actions'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'
import styles from '../contacts.module.css'
import { useRouter } from 'next/navigation'

export default function ImportClient() {
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [parsedCount, setParsedCount] = useState(0)
  const router = useRouter()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    setParsedCount(0)

    let rowsBatch: any[] = []
    let totalImported = 0
    let hasError = false

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      step: async (row, parser) => {
        rowsBatch.push(row.data)
        
        // When we hit 500 rows, pause parsing and send to the server
        if (rowsBatch.length >= 500) {
          parser.pause()
          const batchToUpload = [...rowsBatch]
          rowsBatch = []
          
          try {
            const res = await bulkInsertContacts(batchToUpload)
            if (!res.success) {
              console.error(res.error)
              setError('Some rows failed to import. Check console for details.')
              hasError = true
            } else {
              totalImported += batchToUpload.length
              setParsedCount(totalImported)
            }
          } catch (err) {
            console.error(err)
          } finally {
            parser.resume()
          }
        }
      },
      complete: async () => {
        // Upload any remaining rows
        if (rowsBatch.length > 0) {
          const res = await bulkInsertContacts(rowsBatch)
          if (!res.success) {
            console.error(res.error)
            setError('Some rows failed to import.')
            hasError = true
          } else {
            totalImported += rowsBatch.length
            setParsedCount(totalImported)
          }
        }

        if (!hasError) {
          setIsSuccess(true)
          setTimeout(() => {
            router.push('/dashboard/contacts')
          }, 2000)
        }
        setIsUploading(false)
      },
      error: (error) => {
        setError(error.message)
        setIsUploading(false)
      }
    })
  }

  return (
    <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: 'var(--border-radius-lg)' }}>
      {isSuccess ? (
        <div style={{ color: 'var(--success)' }}>
          <CheckCircle2 size={48} className="mx-auto mb-4" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Import Successful!</h2>
          <p>Successfully imported {parsedCount} contacts. Redirecting...</p>
        </div>
      ) : (
        <>
          <Upload size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Upload CSV File</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Ensure your CSV has header columns like "Name", "Email", "Phone", and "Address".
          </p>
          
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <button 
              type="button" 
              className={`${styles.btn} ${styles.primaryBtn}`}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isUploading ? 'Importing...' : 'Select CSV File'}
            </button>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
          </div>
          
          {isUploading && (
            <p style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>
              Imported {parsedCount} rows so far...
            </p>
          )}

          {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}
        </>
      )}
    </div>
  )
}
