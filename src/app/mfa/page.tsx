import styles from '../login/login.module.css'
import { verifyMFA } from './actions'

export default async function MFAPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.card} animate-fade-in`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Two-Factor Authentication</h1>
          <p className={styles.subtitle}>Enter the code from your authenticator app.</p>
        </div>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="code">
              Authentication Code
            </label>
            <input
              className={styles.input}
              id="code"
              name="code"
              type="text"
              required
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button formAction={verifyMFA} className={`${styles.button} ${styles.primary}`}>
              Verify
            </button>
          </div>
        </form>

        {resolvedParams?.error && (
          <div className={`${styles.message} ${styles.error}`}>
            {resolvedParams.error}
          </div>
        )}
      </div>
    </div>
  )
}
