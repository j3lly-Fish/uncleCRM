'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function bulkInsertContacts(contacts: any[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Log headers of the first row to help debug in server logs
  if (contacts.length > 0) {
    console.log('Importing batch. Detected CSV headers:', Object.keys(contacts[0]))
  }

  // Map the imported CSV rows to the database schema with fuzzy header matching
  const mappedContacts = contacts.map(c => {
    // Helper to find value by any of the keys
    const findValue = (aliases: string[]) => {
      // Normalize key by removing all non-alphanumeric characters and lowercase
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      const normalizedAliases = aliases.map(normalize)
      const key = Object.keys(c).find(k => 
        normalizedAliases.includes(normalize(k))
      )
      
      const val = key ? c[key] : null
      return val === '' ? null : val
    }

    return {
      user_id: user.id,
      name: findValue(['name', 'firstname', 'lastname', 'fullname', 'contactname', 'displayname', 'debtorname']) || 'Unknown',
      email: findValue(['email', 'emailaddress', 'mail', 'primaryemail', 'debtoremail']),
      phone: findValue(['phone', 'phonenumber', 'tel', 'telephone', 'mobile', 'cell', 'debtorphone']),
      address: findValue(['address', 'streetaddress', 'homeaddress', 'location', 'street', 'debtoraddress']),
      birthday: findValue(['birthday', 'dob', 'dateofbirth']),
      mobile_carrier: findValue(['mobilecarrier', 'carrier', 'network', 'provider'])
    }
  })

  const { error } = await supabase.from('contacts').insert(mappedContacts)

  if (error) {
    console.error('Error importing contacts:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/contacts')
  return { success: true }
}
