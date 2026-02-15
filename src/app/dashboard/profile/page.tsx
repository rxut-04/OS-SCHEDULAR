'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, ChevronLeft, Mail, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
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
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>
              Profile
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Your account information
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ background: 'var(--alg-secondary)' }}
            >
              U
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--alg-text)' }}>
                User
              </h2>
              <p className="text-sm flex items-center gap-2 mt-1" style={{ color: 'var(--text-muted)' }}>
                <Mail size={14} />
                Sign in to see email
              </p>
              <p className="text-sm flex items-center gap-2 mt-1" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={14} />
                Member since 2025
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 grid gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--alg-bg)' }}>
            <Award size={20} style={{ color: 'var(--alg-primary)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--alg-text)' }}>Learning level</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Explorer — keep completing modules and quizzes to level up.</p>
            </div>
          </div>
        </div>
        <p className="text-sm p-6 pt-0 text-center" style={{ color: 'var(--text-muted)' }}>
          Connect your account in Settings to sync profile across devices.
        </p>
      </motion.div>
    </div>
  );
}
