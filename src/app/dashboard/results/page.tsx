'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ListChecks, ChevronLeft, Calendar, Check, CircleAlert } from 'lucide-react';

const PLACEHOLDER_RESULTS = [
  { id: '1', date: '2025-01-28', topic: 'Memory & Scheduling', score: 85, total: 100, passed: true },
  { id: '2', date: '2025-01-25', topic: 'CPU Scheduling', score: 72, total: 100, passed: true },
  { id: '3', date: '2025-01-22', topic: 'Process Management', score: 58, total: 100, passed: false },
];

export default function PastResultsPage() {
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
            <ListChecks size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>
              Past Results
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Your quiz attempt history
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border p-6"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--alg-text)' }}>
            Quiz history
          </h2>
          <Link
            href="/dashboard/quiz"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--alg-secondary)' }}
          >
            Take new quiz
          </Link>
        </div>
        <ul className="space-y-4">
          {PLACEHOLDER_RESULTS.map((r, i) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border"
              style={{ borderColor: 'var(--border-color)', background: 'var(--alg-bg)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: r.passed ? 'var(--alg-mint)' : 'var(--alg-pink)', color: 'var(--alg-primary)' }}
                >
                  {r.passed ? <Check size={20} /> : <CircleAlert size={20} />}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--alg-text)' }}>
                    {r.topic}
                  </p>
                  <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    {r.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: 'var(--alg-primary)' }}>
                  {r.score} / {r.total}
                </p>
                <p className="text-xs uppercase tracking-wider" style={{ color: r.passed ? 'var(--alg-secondary)' : 'var(--error)' }}>
                  {r.passed ? 'Passed' : 'Review'}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
          Results are stored locally. Sign in and sync to save progress across devices.
        </p>
      </motion.div>
    </div>
  );
}
