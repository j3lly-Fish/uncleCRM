'use client'

import { useState } from 'react'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-overrides.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CRMEvent {
  id: string
  title: string
  event_date: string
  contact_id?: string
  contacts?: { name: string }
}

import { useRouter } from 'next/navigation'

export default function CalendarClient({ events }: { events: CRMEvent[] }) {
  const [view, setView] = useState<any>('month')
  const [date, setDate] = useState(new Date())
  const router = useRouter()

  // Convert our DB events to react-big-calendar Event objects
  const calendarEvents = events.map(e => {
    const start = new Date(e.event_date)
    // Assume 1 hour duration if we only have one date
    const end = new Date(start.getTime() + 60 * 60 * 1000) 
    
    return {
      id: e.id,
      title: e.contacts ? `${e.title} (${e.contacts.name})` : e.title,
      start,
      end,
      resource: e
    }
  })

  return (
    <div className="glass-panel" style={{ padding: '1rem', height: 'calc(100vh - 150px)', minHeight: '600px' }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={(event) => {
          if (event.resource && event.resource.contact_id) {
            router.push(`/dashboard/contacts/${event.resource.contact_id}`)
          }
        }}
        views={['month', 'week', 'day', 'agenda']}
        popup
        tooltipAccessor={(e) => e.title}
      />
    </div>
  )
}
