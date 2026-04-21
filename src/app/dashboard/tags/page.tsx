import { createClient } from '@/utils/supabase/server'
import TagList from './TagList'

export default async function TagsPage() {
  const supabase = await createClient()
  
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6" style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem' }}>Manage Tags</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Create and manage tags to organize your contacts. You can assign these tags to any contact.
        </p>
        
        <TagList initialTags={tags || []} />
      </div>
    </div>
  )
}
