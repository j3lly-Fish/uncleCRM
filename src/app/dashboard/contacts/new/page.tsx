import ContactForm from './ContactForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function NewContactPage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tags').select('*').order('name')

  return (
    <div>
      <div className="flex items-center gap-4 mb-6" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/contacts" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} className="hover:text-blue-500">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Add New Contact
        </h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <ContactForm availableTags={tags || []} />
      </div>
    </div>
  )
}
