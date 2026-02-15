'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Brain, Zap, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { TheorySection } from '@/components/ui/theory-section';

export default function ReinforcementLearningPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative z-10 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/modules?tab=aiml"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Reinforcement Learning</h1>
              <p className="text-neutral-400 text-sm mt-1">Agent-Based Learning • Q-Learning • Policy Gradient</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/20">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">Agent-Based Learning</span>
          </div>
        </motion.div>

        <div className="mb-8">
          <TheorySection title="Theory: Reinforcement Learning" defaultOpen={true}>
            <p>
              <strong>Reinforcement Learning (RL)</strong> is a type of machine learning where an agent learns to make decisions by performing actions in an environment and receiving rewards or penalties. The goal is to maximize cumulative reward over time.
            </p>
            <p>
              <strong>Key concepts:</strong> <em>State</em> (current situation), <em>Action</em> (choices the agent can make), <em>Reward</em> (feedback signal), <em>Policy</em> (strategy mapping states to actions), and <em>Value function</em> (expected long-term return).
            </p>
            <p>
              <strong>Q-Learning:</strong> A model-free, off-policy algorithm that learns the value of state-action pairs (Q-values) and converges to an optimal policy under certain conditions. Uses temporal-difference learning.
            </p>
            <p>
              <strong>Policy Gradient:</strong> Methods that directly optimize the policy (e.g. REINFORCE, PPO) by gradient ascent on the expected return. Well-suited for continuous action spaces and deep RL.
            </p>
            <p>
              <strong>Applications:</strong> Game playing (AlphaGo, DQN), robotics, recommendation systems, autonomous driving, and resource scheduling.
            </p>
          </TheorySection>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
              <Brain size={64} className="text-indigo-400" />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Interactive RL Visualizer</h2>
          <p className="text-neutral-400 max-w-lg mx-auto mb-6">
            A grid-world or Q-learning visualizer will be added here so you can see how an agent explores the environment and updates Q-values step by step.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/modules?tab=aiml"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <ChevronLeft size={18} />
              Back to AI/ML Modules
            </Link>
            <Link
              href="/aiml/kmeans"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/30 transition-colors text-sm font-medium"
            >
              <Target size={18} />
              Try K-Means
            </Link>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <span className="text-neutral-500 flex items-center gap-2">
            <BookOpen size={14} />
            More RL content and a full visualizer are planned for a future update.
          </span>
        </div>
      </div>
    </div>
  );
}
