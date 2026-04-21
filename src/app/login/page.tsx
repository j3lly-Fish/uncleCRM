import styles from './login.module.css'
import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const resolvedParams = await searchParams

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.card} animate-fade-in`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Enter your credentials to access the CRM</p>
        </div>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button formAction={login} className={`${styles.button} ${styles.primary}`}>
              Log In
            </button>
            <button formAction={signup} className={`${styles.button} ${styles.secondary}`}>
              Sign Up
            </button>
          </div>
        </form>

        {resolvedParams?.error && (
          <div className={`${styles.message} ${styles.error}`}>
            {resolvedParams.error}
          </div>
        )}
        {resolvedParams?.message && (
          <div className={`${styles.message} ${styles.success}`}>
            {resolvedParams.message}
          </div>
        )}
      </div>
    </div>
  )
}
