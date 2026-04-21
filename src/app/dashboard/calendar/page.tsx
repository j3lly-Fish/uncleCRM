import { createClient } from '@/utils/supabase/server'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const supabase = await createClient()

  // Fetch events with contact info
  const { data: events } = await supabase
    .from('events')
    .select('*, contacts(name)')
    .order('event_date', { ascending: true })

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-bold" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
          Calendar
        </h1>
      </div>
      
      <div style={{ flex: 1 }}>
        <CalendarClient events={events || []} />
      </div>
    </div>
  )
}
