import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditContactForm from './EditContactForm'
import ContactFiles from './ContactFiles'
import ContactEvents from './ContactEvents'
import { Contact } from '@/types/database'

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*, contact_tags(tag_id), contact_files(*), events(*)')
    .eq('id', resolvedParams.id)
    .single()

  const { data: allTags } = await supabase.from('tags').select('*').order('name')

  if (error || !contact) {
    notFound()
  }

  const typedContact = {
    ...contact,
    selectedTagIds: contact.contact_tags?.map((ct: any) => ct.tag_id) || []
  } as any

  const files = contact.contact_files?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || []

  const events = contact.events?.sort((a: any, b: any) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  ) || []

  return (
    <div>
      <div className="flex items-center gap-4 mb-6" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/contacts" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} className="hover:text-blue-500">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {typedContact.name}
        </h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <EditContactForm contact={typedContact} allTags={allTags || []} />
      </div>

      <ContactEvents contactId={typedContact.id} events={events} />

      <ContactFiles contactId={typedContact.id} files={files} />
    </div>
  )
}
