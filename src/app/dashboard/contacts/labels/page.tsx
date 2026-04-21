import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PrintButton from './PrintButton'
import './labels.css'

export default async function LabelsPage() {
  const supabase = await createClient()

  // Fetch all contacts that have an address
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .not('address', 'is', null)
    .not('address', 'eq', '')
    .order('name', { ascending: true })

  return (
    <div className="labels-page-container">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/contacts" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} className="hover:text-blue-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
            Shipping Labels
          </h1>
        </div>
        
        <PrintButton />
      </div>

      <div className="no-print" style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          This page is formatted for standard Avery 5160 labels (30 per page: 3 columns x 10 rows). 
          Make sure to set your printer margins to "None" or "Minimum" and disable headers/footers in the print dialog.
        </p>
      </div>

      {/* The Printable Area */}
      <div className="label-sheet">
        {contacts?.map(contact => (
          <div key={contact.id} className="label">
            <div className="label-content">
              <strong>{contact.name}</strong><br/>
              {contact.address?.split('\n').map((line: string, i: number) => (
                <span key={i}>{line}<br/></span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
