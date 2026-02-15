'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, ChevronLeft, Trophy, Zap, BookOpen, Target } from 'lucide-react';

const BADGES = [
  { id: '1', name: 'First Quiz', desc: 'Complete your first quiz', icon: Zap, earned: true, color: 'var(--alg-secondary)' },
  { id: '2', name: 'Theory Reader', desc: 'Read an OS theory section', icon: BookOpen, earned: true, color: 'var(--alg-primary)' },
  { id: '3', name: 'Module Explorer', desc: 'Try 3 different modules', icon: Target, earned: true, color: '#8B5CF6' },
  { id: '4', name: 'High Scorer', desc: 'Score 90%+ on a quiz', icon: Trophy, earned: false, color: 'var(--alg-yellow)' },
  { id: '5', name: 'Completionist', desc: 'Complete all OS modules', icon: Star, earned: false, color: 'var(--alg-ai-accent)' },
];

export default function AchievementsPage() {
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
            style={{ background: 'var(--alg-yellow)', color: 'var(--alg-primary)' }}
          >
            <Star size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>
              Achievements
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Unlock badges as you learn
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
        <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--alg-text)' }}>
          Your badges
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  b.earned ? '' : 'opacity-60'
                }`}
                style={{ borderColor: 'var(--border-color)', background: 'var(--alg-bg)' }}
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                  style={{ background: b.earned ? b.color + '30' : 'var(--alg-bg)', color: b.earned ? b.color : 'var(--text-muted)' }}
                >
                  <Icon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--alg-text)' }}>
                    {b.name}
                  </p>
                  <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                    {b.desc}
                  </p>
                  {b.earned && (
                    <span className="text-xs font-semibold" style={{ color: 'var(--alg-secondary)' }}>
                      Earned
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-sm mt-6 text-center" style={{ color: 'var(--text-muted)' }}>
          Keep learning to unlock more achievements.
        </p>
      </motion.div>
    </div>
  );
}
