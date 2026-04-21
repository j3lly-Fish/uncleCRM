'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Contact, Event } from '@/types/database'

export default function DashboardCharts({ contacts, events }: { contacts: Contact[], events: Event[] }) {
  // Process contacts by month created
  const contactsByMonth = contacts.reduce((acc, contact) => {
    const date = new Date(contact.created_at)
    const month = date.toLocaleString('default', { month: 'short' })
    if (!acc[month]) acc[month] = 0
    acc[month]++
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.keys(contactsByMonth).map(month => ({
    name: month,
    Contacts: contactsByMonth[month]
  }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
      
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Contacts Added</h3>
        <div style={{ height: '300px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 'var(--border-radius-md)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Contacts" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              Not enough data yet
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
