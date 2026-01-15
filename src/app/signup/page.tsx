"use client"

import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      
      {/* Header */}
      <header className="relative z-20 p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
           <Image 
              src="/assets/logos/logo1.png" 
              alt="AlgoViz OS Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded-lg"
            />
          <span className="text-white font-medium text-lg tracking-tight">AlgoViz</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-20 px-4 pb-20">
        <AuthForm view="signup" />
      </main>
    </div>
  )
}
