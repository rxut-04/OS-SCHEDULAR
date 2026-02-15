'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ChevronLeft, Key, Lock, Smartphone } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          href="/dashboard"
          className="p-2 rounded-xl border transition-colors hover:bg-[var(--alg-mint)]"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--alg-text)' }} />
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'var(--alg-mint)', color: 'var(--alg-primary)' }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>
              Security
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Password and account security
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border p-6 space-y-6"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-start gap-4 p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--alg-bg)' }}>
          <Key size={22} style={{ color: 'var(--alg-primary)' }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--alg-text)' }}>Change password</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Update your password regularly for better security. Use a strong, unique password.
            </p>
            <button
              type="button"
              className="mt-3 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--alg-mint)]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--alg-text)' }}
            >
              Change password (requires sign-in)
            </button>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--alg-bg)' }}>
          <Lock size={22} style={{ color: 'var(--alg-primary)' }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--alg-text)' }}>Sessions</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              View and manage active sessions. Sign out from other devices if needed.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--alg-bg)' }}>
          <Smartphone size={22} style={{ color: 'var(--alg-primary)' }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--alg-text)' }}>Two-factor authentication</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Add an extra layer of security with 2FA. Available when you sign in with a supported provider.
            </p>
          </div>
        </div>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Full security options are available after signing in with your account.
        </p>
      </motion.div>
    </div>
  );
}
