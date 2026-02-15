'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Cpu, Brain, FileText, ChevronLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Operating Systems',
    icon: Cpu,
    links: [
      { label: 'OS Theory (CPU, Memory, Paging)', href: '/theory/os' },
      { label: 'CPU Scheduling', href: '/cpu-scheduling' },
      { label: 'Scheduling Queues', href: '/scheduling-queues' },
      { label: 'Memory Management', href: '/memory-management' },
      { label: 'Page Replacement', href: '/page-replacement' },
      { label: 'Contiguous Memory', href: '/contiguous-memory' },
      { label: 'File Allocation', href: '/file-allocation' },
      { label: 'Disk Scheduling', href: '/disk-scheduling' },
      { label: 'Multithreading', href: '/multithreading' },
    ],
  },
  {
    title: 'AI / Machine Learning',
    icon: Brain,
    links: [
      { label: 'K-Means Clustering', href: '/aiml/kmeans' },
      { label: 'Linear Regression', href: '/aiml/linear-regression' },
      { label: 'Logistic Regression', href: '/aiml/logistic-regression' },
      { label: 'Neural Network', href: '/aiml/neural-network' },
      { label: 'Decision Tree', href: '/aiml/decision-tree' },
      { label: 'KNN', href: '/aiml/knn' },
      { label: 'Reinforcement Learning', href: '/aiml/reinforcement-learning' },
    ],
  },
  {
    title: 'Practice & Dashboard',
    icon: FileText,
    links: [
      { label: 'Learning Modules', href: '/modules' },
      { label: 'Daily Quiz', href: '/dashboard/quiz' },
      { label: 'My Progress', href: '/dashboard/progress' },
      { label: 'Past Results', href: '/dashboard/results' },
    ],
  },
];

export default function ReferencesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--alg-bg)', color: 'var(--alg-text)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href="/"
            className="p-2 rounded-xl border transition-colors hover:bg-[var(--alg-mint)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'var(--alg-mint)', color: 'var(--alg-primary)' }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quick References</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Links to theory, visualizers, and practice
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-2xl border p-6 bg-alg-white"
                style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', color: 'var(--alg-text)' }}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--alg-primary)' }}>
                  <Icon size={22} />
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block py-2 px-3 rounded-lg transition-colors hover:bg-[var(--alg-mint)]"
                        style={{ color: 'var(--alg-text)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </motion.div>

        <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
          Bookmark this page for quick access to all learning resources.
        </p>
      </div>
    </div>
  );
}
