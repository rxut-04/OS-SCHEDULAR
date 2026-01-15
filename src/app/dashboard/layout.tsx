"use client"

import { TwoLevelSidebar } from '@/components/ui/sidebar-component'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full bg-transparent text-white overflow-hidden">
      {/* New Two-Level Sidebar */}
      <div className="h-full shrink-0 z-50">
        <TwoLevelSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto bg-[#0B0F14] relative z-0">
        <main className="p-6 min-h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
