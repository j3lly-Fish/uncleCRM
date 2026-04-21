'use client'

import styles from './layout.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calendar, Shield, LogOut, LayoutDashboard, Tag } from 'lucide-react'
import { signout } from '../login/actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Tags', href: '/dashboard/tags', icon: Tag },
    { name: 'Security', href: '/dashboard/security', icon: Shield },
  ]

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Users size={24} className="text-blue-500" />
          CRM
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <form action={signout}>
          <button className={styles.logout} type="submit">
            <LogOut size={20} />
            Sign Out
          </button>
        </form>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
