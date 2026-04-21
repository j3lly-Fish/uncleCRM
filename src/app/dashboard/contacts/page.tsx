import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import styles from './contacts.module.css'
import ContactList from './ContactList'

export default async function ContactsPage() {
  const supabase = await createClient()

  // Fetch contacts with their tags
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, contact_tags(tags(*))')
    .order('name', { ascending: true })

  // Fetch all tags for the user (for bulk tagging dropdown)
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  const typedContacts = contacts?.map((c: any) => ({
    ...c,
    tags: c.contact_tags?.map((ct: any) => ct.tags).filter(Boolean) || []
  })) || []

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Contacts</h1>
        <div className={styles.actions}>
          <Link href="/dashboard/contacts/labels" className={`${styles.btn} glass-panel`} style={{ color: 'var(--text-primary)' }}>
            Print Labels
          </Link>
          <Link href="/dashboard/contacts/import" className={`${styles.btn} glass-panel`} style={{ color: 'var(--text-primary)' }}>
            <Upload size={18} />
            Import CSV
          </Link>
          <Link href="/dashboard/contacts/new" className={`${styles.btn} ${styles.primaryBtn}`}>
            <Plus size={18} />
            Add Contact
          </Link>
        </div>
      </div>

      <ContactList initialContacts={typedContacts} allTags={tags || []} />
    </div>
  )
}
