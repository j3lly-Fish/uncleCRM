'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateContact(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const birthday = formData.get('birthday') as string
  const mobile_carrier = formData.get('mobile_carrier') as string

  const { error } = await supabase.from('contacts').update({
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    birthday: birthday ? new Date(birthday).toISOString() : null,
    mobile_carrier: mobile_carrier || null,
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error updating contact:', error)
    return { error: error.message }
  }

  // Handle Tags
  const tags = formData.get('tags') as string // comma separated ids
  // Clear existing tags
  await supabase.from('contact_tags').delete().eq('contact_id', id)
  
  if (tags) {
    const tagIds = tags.split(',')
    const contactTags = tagIds.map(tid => ({
      contact_id: id,
      tag_id: tid
    }))
    await supabase.from('contact_tags').insert(contactTags)
  }

  revalidatePath('/dashboard/contacts')
  revalidatePath(`/dashboard/contacts/${id}`)
  redirect('/dashboard/contacts')
}

export async function deleteContact(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string

  const { error } = await supabase.from('contacts').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error deleting contact:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/contacts')
  redirect('/dashboard/contacts')
}
