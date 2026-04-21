import { createClient } from '@/utils/supabase/server'
import MfaSettings from './MfaSettings'

export default async function SecurityPage() {
  const supabase = await createClient()

  // Get current user and MFA status
  const { data: { user } } = await supabase.auth.getUser()
  const { data: factors } = await supabase.auth.mfa.listFactors()
  
  const hasTotp = factors?.totp && factors.totp.length > 0
  const factorId = hasTotp ? factors.totp[0].id : null

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Security Settings</h1>
      <div className="glass-panel p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication (2FA)</h2>
        <p className="text-gray-500 mb-6">
          Protect your account by requiring an authentication code when logging in.
        </p>
        
        <MfaSettings isEnabled={hasTotp} factorId={factorId} />
      </div>
    </div>
  )
}
