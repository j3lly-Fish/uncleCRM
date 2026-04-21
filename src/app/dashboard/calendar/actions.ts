'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const event_date = formData.get('event_date') as string
  const contact_id = formData.get('contact_id') as string

  const { error } = await supabase.from('events').insert({
    user_id: user.id,
    contact_id: contact_id || null, // Optional if we allow global events
    title,
    event_date: new Date(event_date).toISOString(),
    is_recurring: false
  })

  if (error) {
    console.error('Error creating event:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/calendar')
  if (contact_id) revalidatePath(`/dashboard/contacts/${contact_id}`)
  return { success: true }
}

export async function deleteEvent(id: string, contactId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/calendar')
  if (contactId) revalidatePath(`/dashboard/contacts/${contactId}`)
  return { success: true }
}
