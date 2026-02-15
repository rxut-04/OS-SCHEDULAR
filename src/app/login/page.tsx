"use client"

import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'
import Image from 'next/image'
export default function LoginPage() {
  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{ background: 'var(--alg-primary)' }}
    >
      <header className="relative z-20 p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Image
            src="/assets/logos/logo2.png"
            alt="AlgoLogic"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-semibold text-lg text-white tracking-tight">AlgoLogic</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-20 px-4 pb-20">
        <AuthForm view="login" />
      </main>
    </div>
  )
}
