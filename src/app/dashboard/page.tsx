import { createClient } from '@/utils/supabase/server'
import DashboardCharts from './DashboardCharts'
import { Contact, Event } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [contactsRes, eventsRes] = await Promise.all([
    supabase.from('contacts').select('*'),
    supabase.from('events').select('*')
  ])

  const contacts = (contactsRes.data || []) as Contact[]
  const events = (eventsRes.data || []) as Event[]

  // Count upcoming events within next 30 days
  const now = new Date()
  const next30Days = new Date(now)
  next30Days.setDate(now.getDate() + 30)

  const upcomingCount = events.filter(e => {
     const edate = new Date(e.event_date)
     return edate >= now && edate <= next30Days
  }).length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard Overview</h1>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Welcome back, <strong>{user?.email}</strong>!</p>
        
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Contacts</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-primary)' }}>{contacts.length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upcoming Events (30 days)</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-secondary)' }}>{upcomingCount}</p>
        </div>
      </div>

      <DashboardCharts contacts={contacts} events={events} />

    </div>
  )
}
