'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const birthday = formData.get('birthday') as string
  const mobile_carrier = formData.get('mobile_carrier') as string

  const { data: contact, error } = await supabase.from('contacts').insert({
    user_id: user.id,
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    birthday: birthday ? new Date(birthday).toISOString() : null,
    mobile_carrier: mobile_carrier || null,
  }).select().single()

  if (error) {
    console.error('Error creating contact:', error)
    return { error: error.message }
  }

  // Handle Tags
  const tags = formData.get('tags') as string // comma separated ids
  if (tags) {
    const tagIds = tags.split(',')
    const contactTags = tagIds.map(tid => ({
      contact_id: contact.id,
      tag_id: tid
    }))
    await supabase.from('contact_tags').insert(contactTags)
  }

  revalidatePath('/dashboard/contacts')
  redirect('/dashboard/contacts')
}
