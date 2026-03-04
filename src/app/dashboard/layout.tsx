"use client"

import { TwoLevelSidebar } from '@/components/ui/sidebar-component'
import { LocalAuthGuard } from '@/components/auth/local-auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LocalAuthGuard>
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--alg-bg)', color: 'var(--alg-text)' }}
    >
      <div className="h-full shrink-0 z-50">
        <TwoLevelSidebar />
      </div>

      <div className="flex-1 h-full overflow-y-auto relative z-0" style={{ background: 'var(--alg-bg)', color: 'var(--alg-text)' }}>
        <main className="p-6 min-h-full">
          {children}
        </main>
      </div>
    </div>
    </LocalAuthGuard>
  )
}
