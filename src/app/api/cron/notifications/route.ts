import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// We use the service role key to bypass RLS since this is a system cron job
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Find events happening in the next 24 hours
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data: upcomingEvents, error } = await supabase
      .from('events')
      .select('*, contacts(name, email, phone, mobile_carrier)')
      .gte('event_date', now.toISOString())
      .lte('event_date', tomorrow.toISOString())

    if (error) {
      console.error('Error fetching events for cron:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return NextResponse.json({ message: 'No upcoming events found.' })
    }

    // 3. Process each event and send notifications
    const results = []

    for (const event of upcomingEvents) {
      const contact = event.contacts as any
      if (!contact) continue

      const eventDateStr = new Date(event.event_date).toLocaleString()
      const subject = `Upcoming Event: ${event.title}`
      const text = `Reminder: You have an upcoming event "${event.title}" with ${contact.name} scheduled for ${eventDateStr}.`

      // 3a. Send Email Notification if email exists
      if (contact.email) {
        try {
          await resend.emails.send({
            from: 'CRM Notifications <onboarding@resend.dev>', // Replace with your verified domain later
            to: contact.email,
            subject: subject,
            text: text
          })
          results.push({ type: 'email', to: contact.email, event: event.title, status: 'sent' })
        } catch (e: any) {
          results.push({ type: 'email', to: contact.email, event: event.title, status: 'error', error: e.message })
        }
      }

      // 3b. Send SMS Notification (via Email-to-SMS) if phone and carrier exist
      if (contact.phone && contact.mobile_carrier) {
        // Clean phone number (digits only)
        const digits = contact.phone.replace(/\\D/g, '')
        if (digits.length >= 10) {
          const smsEmail = `${digits.slice(-10)}@${contact.mobile_carrier}`
          try {
            await resend.emails.send({
              from: 'CRM Notifications <onboarding@resend.dev>', // Replace with your verified domain
              to: smsEmail,
              subject: 'Reminder',
              text: text
            })
            results.push({ type: 'sms', to: smsEmail, event: event.title, status: 'sent' })
          } catch (e: any) {
            results.push({ type: 'sms', to: smsEmail, event: event.title, status: 'error', error: e.message })
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: upcomingEvents.length,
      results 
    })

  } catch (error: any) {
    console.error('Cron job failed:', error)
    return NextResponse.json({ error: error.message || 'Cron job failed' }, { status: 500 })
  }
}
