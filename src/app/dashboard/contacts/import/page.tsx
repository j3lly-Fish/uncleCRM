import ImportClient from './ImportClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ImportPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/contacts" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} className="hover:text-blue-500">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Import Contacts
        </h1>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <ImportClient />
      </div>
    </div>
  )
}
