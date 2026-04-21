'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bulkDeleteContacts(ids: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Chunk the deletion to avoid payload size or timeout issues with large sets
  const chunkSize = 200
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const { error } = await supabase
      .from('contacts')
      .delete()
      .in('id', chunk)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error in bulk delete chunk:', error)
      return { error: error.message }
    }
  }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}

export async function bulkAddTag(contactIds: string[], tagId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Chunk the tagging to avoid payload size or timeout issues
  const chunkSize = 500
  for (let i = 0; i < contactIds.length; i += chunkSize) {
    const chunk = contactIds.slice(i, i + chunkSize)
    const contactTags = chunk.map(cid => ({
      contact_id: cid,
      tag_id: tagId
    }))

    const { error } = await supabase
      .from('contact_tags')
      .upsert(contactTags, { onConflict: 'contact_id,tag_id' })

    if (error) {
      console.error('Error in bulk tagging chunk:', error)
      return { error: error.message }
    }
  }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}
