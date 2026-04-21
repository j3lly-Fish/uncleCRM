'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyMFA(formData: FormData) {
  const code = formData.get('code') as string
  const supabase = await createClient()

  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  
  if (factorsError || !factors.totp || factors.totp.length === 0) {
    return redirect('/mfa?error=No TOTP factor found')
  }

  const factorId = factors.totp[0].id

  const challenge = await supabase.auth.mfa.challenge({ factorId })
  if (challenge.error) {
    return redirect('/mfa?error=Could not create challenge')
  }

  const challengeId = challenge.data.id

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code
  })

  if (verify.error) {
    return redirect('/mfa?error=Invalid code')
  }

  redirect('/dashboard')
}
