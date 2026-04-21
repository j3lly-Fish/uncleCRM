'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { promises as fs } from 'fs'

export async function deleteContactFile(fileId: string, contactId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get file info
  const { data: fileRecord } = await supabase
    .from('contact_files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single()

  if (!fileRecord) return { error: 'File not found' }

  // Delete from DB
  const { error } = await supabase
    .from('contact_files')
    .delete()
    .eq('id', fileId)

  if (error) return { error: error.message }

  // Delete from local disk
  try {
    await fs.unlink(fileRecord.file_path)
  } catch (e) {
    console.error('Failed to delete file from disk, it might be already gone:', e)
  }

  revalidatePath(`/dashboard/contacts/${contactId}`)
  return { success: true }
}
