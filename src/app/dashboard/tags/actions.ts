'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTag(name: string, color: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('tags').insert({
    user_id: user.id,
    name,
    color
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tags')
  return { success: true }
}

export async function deleteTag(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('tags').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tags')
  revalidatePath('/dashboard/contacts')
  return { success: true }
}

export async function updateTag(id: string, name: string, color: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('tags').update({ name, color }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tags')
  return { success: true }
}
