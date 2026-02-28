"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Education,
  Time,
  Checkmark,
  Warning,
  ArrowRight,
  ArrowLeft,
  Play,
  Settings,
  ChartLine,
  Restart,
  Flag,
  Trophy,
  CheckmarkOutline,
  MisuseOutline,
} from '@carbon/icons-react';
import { Code2, BookOpen } from 'lucide-react';
import { Question, QuizSettings, UserAnswer, SavedQuizResult, Difficulty } from './types';
import { cn } from '@/lib/utils';

/* ─── Persistence ─────────────────────────────────────────────── */
function lsKey(subject: string) { return `algologic_quiz_${subject}`; }

export function saveResult(subject: string, result: SavedQuizResult) {
  try {
    const stored: SavedQuizResult[] = JSON.parse(localStorage.getItem(lsKey(subject)) || '[]');
    stored.unshift(result);
    localStorage.setItem(lsKey(subject), JSON.stringify(stored.slice(0, 20)));
    // Also dispatch storage event so the TopNav pill updates
    window.dispatchEvent(new Event('storage'));
  } catch (_) { /* silent */ }
}

export function loadResults(subject: string): SavedQuizResult[] {
  try { return JSON.parse(localStorage.getItem(lsKey(subject)) || '[]'); } catch (_) { return []; }
}

/* ─── Step Dots ───────────────────────────────────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i}
          className={cn("rounded-full transition-all duration-300", i + 1 === current ? "w-6 h-2" : "w-2 h-2")}
          style={{ background: i + 1 <= current ? 'var(--alg-primary)' : 'var(--border-color)' }}
        />
      ))}
    </div>
  );
}

/* ─── Screen 1: Introduction ─────────────────────────────────── */
function Screen1Intro({
  title, subtitle, icon, topics, onStart, previousBest,
}: {
  title: string; subtitle: string; icon: React.ReactNode; topics: string[];
  onStart: () => void; previousBest: SavedQuizResult | null;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center max-w-2xl mx-auto text-center space-y-8 py-8"
    >
      <div className="p-6 rounded-full border-2" style={{ background: 'var(--alg-mint)', borderColor: 'var(--alg-primary)' }}>
        {icon}
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--alg-text)' }}>{title}</h1>
        <p className="text-xl font-light" style={{ color: 'var(--alg-primary)' }}>{subtitle}</p>
        <p className="text-neutral-500 max-w-lg mx-auto text-sm leading-relaxed">
          Test your knowledge with carefully crafted questions across all major topics.
          Questions include detailed explanations so you learn even from mistakes.
        </p>
      </div>

      {/* Previous best */}
      {previousBest && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
          <Trophy size={20} className="text-yellow-500" />
          <div className="text-sm text-left">
            <span className="font-semibold" style={{ color: 'var(--alg-text)' }}>Your best: </span>
            <span className={previousBest.passed ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>
              {previousBest.score}%
            </span>
            <span className="text-neutral-500 ml-2">({previousBest.correct}/{previousBest.total} correct)</span>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="p-4 rounded-2xl border text-left" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: 'var(--alg-text)' }}>
            <BookOpen size={14} /> Topics
          </h3>
          <ul className="text-xs text-neutral-500 space-y-0.5">
            {topics.map(t => <li key={t}>• {t}</li>)}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border text-left" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: 'var(--alg-text)' }}>
            <Time size={14} /> Format
          </h3>
          <ul className="text-xs text-neutral-500 space-y-0.5">
            <li>• Customisable count</li>
            <li>• Optional timer</li>
            <li>• MCQ with explanations</li>
            <li>• Instant detailed results</li>
          </ul>
        </div>
      </div>

      <button onClick={onStart}
        className="px-12 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-xl"
        style={{ background: 'var(--alg-primary)' }}
      >
        Start Quiz <ArrowRight size={22} />
      </button>
    </motion.div>
  );
}

/* ─── Screen 2: Settings ─────────────────────────────────────── */
function Screen2Settings({
  topics, onBegin,
}: { topics: string[]; onBegin: (s: QuizSettings) => void }) {
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All');
  const [count, setCount] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics);
  const [timer, setTimer] = useState(true);

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      if (selectedTopics.length > 1) setSelectedTopics(p => p.filter(x => x !== t));
    } else {
      setSelectedTopics(p => [...p, t]);
    }
  };

  const difficultyColors: Record<string, string> = {
    All: 'bg-blue-500/20 border-blue-500 text-blue-700',
    Easy: 'bg-green-500/20 border-green-500 text-green-700',
    Medium: 'bg-yellow-500/20 border-yellow-500 text-yellow-700',
    Hard: 'bg-red-500/20 border-red-500 text-red-700',
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="max-w-3xl mx-auto p-8 rounded-3xl border"
      style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
    >
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--alg-text)' }}>
        <Settings size={30} className="text-purple-500" /> Quiz Settings
      </h2>

      <div className="space-y-8">
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--alg-text)' }}>Difficulty</label>
          <div className="flex gap-3 flex-wrap">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(level => (
              <button key={level} onClick={() => setDifficulty(level)}
                className={cn(
                  "px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all",
                  difficulty === level ? difficultyColors[level] : 'border-[var(--border-color)] text-neutral-500 hover:border-neutral-400'
                )}
                style={difficulty !== level ? { background: 'var(--alg-mint)' } : {}}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--alg-text)' }}>
              Questions
            </label>
            <span className="text-2xl font-bold" style={{ color: 'var(--alg-primary)' }}>{count}</span>
          </div>
          <input type="range" min="5" max="20" step="5" value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--alg-primary)]"
            style={{ background: 'var(--border-color)' }}
          />
          <div className="flex justify-between text-xs text-neutral-400">
            {[5, 10, 15, 20].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <label className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--alg-text)' }}>Topics</label>
          <div className="grid grid-cols-2 gap-2">
            {topics.map(topic => {
              const selected = selectedTopics.includes(topic);
              return (
                <div key={topic} onClick={() => toggleTopic(topic)}
                  className={cn(
                    "p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2 transition-all text-sm",
                    selected ? 'border-[var(--alg-primary)] bg-[var(--alg-mint)]' : 'border-[var(--border-color)] text-neutral-500 hover:border-neutral-400'
                  )}
                  style={!selected ? { background: 'var(--alg-bg)' } : {}}
                >
                  <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0 border",
                    selected ? 'border-[var(--alg-primary)]' : 'border-neutral-400'
                  )} style={selected ? { background: 'var(--alg-primary)' } : {}}>
                    {selected && <Checkmark size={10} className="text-white" />}
                  </div>
                  <span className={selected ? 'font-medium' : ''} style={selected ? { color: 'var(--alg-text)' } : {}}>
                    {topic}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between p-4 rounded-2xl border"
          style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <Time size={20} className="text-orange-500" />
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--alg-text)' }}>Enable Timer</p>
              <p className="text-xs text-neutral-500">Track how long each quiz takes</p>
            </div>
          </div>
          <button onClick={() => setTimer(!timer)}
            className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", timer ? "bg-green-500" : "bg-neutral-300")}
          >
            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300", timer ? "left-7" : "left-1")} />
          </button>
        </div>

        <button
          onClick={() => onBegin({ difficulty, questionCount: count, selectedTopics, timerEnabled: timer })}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--alg-primary), var(--alg-secondary))' }}
        >
          <Play size={20} /> Begin Quiz
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Screen 3: Active Question ────────────────────────────────── */
function Screen3Quiz({
  questions, settings, onFinish,
}: { questions: Question[]; settings: QuizSettings; onFinish: (a: UserAnswer[], t: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [flagged, setFlagged] = useState<number[]>([]);

  useEffect(() => {
    if (!settings.timerEnabled) return;
    const id = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [settings.timerEnabled]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSelect = (idx: number) => {
    setAnswers(prev => {
      const updated = [...prev];
      const existing = updated.findIndex(a => a.questionId === currentQ.id);
      if (existing >= 0) updated[existing].selectedOption = idx;
      else updated.push({ questionId: currentQ.id, selectedOption: idx, isMarked: false });
      return updated;
    });
  };

  const toggleFlag = () => {
    const id = currentQ.id;
    setFlagged(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id)?.selectedOption;
  const overallProgress = ((currentIndex) / questions.length) * 100;
  const answeredCount = answers.length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-400">Question</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>{currentIndex + 1}</span>
          <span className="text-neutral-400">/ {questions.length}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border"
            style={{
              background: currentQ.difficulty === 'Easy' ? '#dcfce7' : currentQ.difficulty === 'Medium' ? '#fef9c3' : '#fee2e2',
              color: currentQ.difficulty === 'Easy' ? '#16a34a' : currentQ.difficulty === 'Medium' ? '#ca8a04' : '#dc2626',
              borderColor: currentQ.difficulty === 'Easy' ? '#86efac' : currentQ.difficulty === 'Medium' ? '#fde047' : '#fca5a5',
            }}
          >
            {currentQ.difficulty}
          </span>
          <span className="hidden sm:block px-2 py-0.5 rounded-full text-xs border text-neutral-500"
            style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
            {currentQ.category}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-500">{answeredCount}/{questions.length} answered</span>
          {settings.timerEnabled && (
            <div className="px-3 py-1.5 rounded-lg font-mono text-sm flex items-center gap-1.5 border"
              style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)', color: 'var(--alg-text)' }}>
              <Time size={14} className="text-orange-500" /> {fmt(elapsed)}
            </div>
          )}
        </div>
      </div>

      {/* Dual progress bars */}
      <div className="space-y-1">
        {/* Overall progress */}
        <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
          <span>Progress</span><span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: 'var(--alg-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Answered progress */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
          <motion.div className="h-full rounded-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span className="text-green-600">{answeredCount} answered</span>
          <span className="text-orange-500">{questions.length - answeredCount} remaining</span>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="p-6 rounded-2xl border"
          style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
        >
          <h2 className="text-xl font-semibold mb-6 leading-relaxed" style={{ color: 'var(--alg-text)' }}>
            {currentQ.text}
          </h2>
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button key={idx} onClick={() => handleSelect(idx)}
                className={cn("w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all group font-medium")}
                style={currentAnswer === idx
                  ? { background: 'var(--alg-primary)', borderColor: 'var(--alg-primary)', color: '#fff' }
                  : { background: 'var(--alg-bg)', borderColor: 'var(--border-color)', color: 'var(--alg-text)' }
                }
              >
                <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold",
                  currentAnswer === idx ? "border-white bg-white/20 text-white" : "border-neutral-400 text-neutral-400"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm leading-snug">{option}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button onClick={toggleFlag}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
            flagged.includes(currentQ.id)
              ? "text-yellow-700 bg-yellow-100 border-yellow-300"
              : "text-neutral-500 border-[var(--border-color)] hover:bg-[var(--alg-mint)]"
          )}
        >
          <Flag size={15} /> {flagged.includes(currentQ.id) ? 'Flagged' : 'Flag'}
        </button>

        <div className="flex gap-3">
          <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-30 flex items-center gap-1.5 transition-all"
            style={{ background: 'var(--alg-secondary)' }}
          >
            <ArrowLeft size={15} /> Prev
          </button>
          {currentIndex < questions.length - 1 ? (
            <button onClick={() => setCurrentIndex(p => p + 1)}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 transition-all hover:opacity-90"
              style={{ background: 'var(--alg-primary)' }}
            >
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={() => onFinish(answers, fmt(elapsed))}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-all"
            >
              Finish Quiz ✓
            </button>
          )}
        </div>
      </div>

      {/* Question navigator dots */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {questions.map((q, i) => {
          const answered = answers.some(a => a.questionId === q.id);
          const isFlagged = flagged.includes(q.id);
          return (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={cn("w-7 h-7 rounded-lg text-xs font-bold transition-all border",
                i === currentIndex
                  ? "border-[var(--alg-primary)] text-white"
                  : isFlagged
                  ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                  : answered
                  ? "bg-green-100 border-green-400 text-green-700"
                  : "text-neutral-400 border-[var(--border-color)] hover:border-neutral-400"
              )}
              style={i === currentIndex ? { background: 'var(--alg-primary)' } : !answered && !isFlagged ? { background: 'var(--alg-bg)' } : {}}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Screen 4: Confirm Submit ──────────────────────────────────── */
function Screen4Confirmation({ total, attempted, onConfirm, onBack }:
  { total: number; attempted: number; onConfirm: () => void; onBack: () => void }) {
  return (
    <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center min-h-[55vh] justify-center text-center space-y-8"
    >
      <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-yellow-400 bg-yellow-50">
        <Warning size={48} className="text-yellow-500" />
      </div>
      <div>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--alg-text)' }}>Submit Quiz?</h2>
        <p className="text-neutral-500 mt-1">Review your progress before submitting</p>
      </div>
      <div className="p-6 rounded-2xl border w-full max-w-xs space-y-3"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <div className="flex justify-between text-sm"><span className="text-neutral-500">Total</span><span className="font-bold">{total}</span></div>
        <div className="flex justify-between text-sm"><span className="text-green-600 font-medium">Answered</span><span className="font-bold text-green-600">{attempted}</span></div>
        <div className="flex justify-between text-sm"><span className="text-orange-500 font-medium">Skipped</span><span className="font-bold text-orange-500">{total - attempted}</span></div>
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(attempted / total) * 100}%` }} />
          </div>
          <p className="text-xs text-neutral-400 mt-1">{Math.round((attempted / total) * 100)}% attempted</p>
        </div>
      </div>
      <div className="flex gap-4 w-full max-w-xs">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ background: 'var(--alg-secondary)' }}>
          Go Back
        </button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all">
          Submit
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Screen 5: Score Card ────────────────────────────────────── */
function Screen5Result({ questions, answers, timeTaken, onAnalysis }:
  { questions: Question[]; answers: UserAnswer[]; timeTaken: string; onAnalysis: () => void }) {
  const correct = answers.filter(a => questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 60;

  // Per-category breakdown
  const categories = [...new Set(questions.map(q => q.category))];
  const catStats = categories.map(cat => {
    const qs = questions.filter(q => q.category === cat);
    const c = qs.filter(q => {
      const a = answers.find(a => a.questionId === q.id);
      return a && a.selectedOption === q.correctAnswer;
    }).length;
    return { cat, correct: c, total: qs.length, pct: Math.round((c / qs.length) * 100) };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto flex flex-col items-center space-y-8"
    >
      <div className="text-center">
        <h2 className="text-4xl font-bold" style={{ color: 'var(--alg-text)' }}>Quiz Complete!</h2>
        <p className="text-neutral-500 mt-1">Here's how you did</p>
      </div>

      {/* Score circle */}
      <div className={cn("w-full p-8 rounded-3xl border-2 flex flex-col items-center gap-4",
        passed ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
      )}>
        <div className={cn("w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center",
          passed ? "border-green-500" : "border-red-400"
        )}>
          <span className={cn("text-4xl font-black", passed ? "text-green-600" : "text-red-500")}>{score}%</span>
          <span className="text-xs font-medium text-neutral-500 mt-0.5">{correct}/{questions.length}</span>
        </div>
        <div className="text-center">
          <h3 className={cn("text-2xl font-bold", passed ? "text-green-700" : "text-red-600")}>
            {passed ? '🎉 Excellent Work!' : '📚 Keep Studying!'}
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {passed ? 'You passed with a great score.' : 'Score ≥60% to pass. Review the analysis to improve.'}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { label: 'Correct', value: correct, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Wrong', value: answers.length - correct, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Time', value: timeTaken, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={cn("p-4 rounded-2xl border text-center", bg, border)}>
            <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">{label}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Per-category mini bars */}
      <div className="w-full p-5 rounded-2xl border space-y-3" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--alg-text)' }}>Topic Breakdown</h3>
        {catStats.map(({ cat, correct: c, total, pct }) => (
          <div key={cat}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-600 truncate max-w-[200px]">{cat}</span>
              <span className="font-semibold" style={{ color: pct >= 60 ? '#16a34a' : '#f97316' }}>{c}/{total} ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 60 ? '#22c55e' : '#f97316' }} />
            </div>
          </div>
        ))}
      </div>

      <button onClick={onAnalysis}
        className="w-full py-4 rounded-2xl font-bold text-lg text-white flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: 'var(--alg-primary)' }}
      >
        <ChartLine size={20} /> View Detailed Analysis
      </button>
    </motion.div>
  );
}

/* ─── Screen 6: Analysis ────────────────────────────────────────── */
function Screen6Analysis({ questions, answers, onNext }:
  { questions: Question[]; answers: UserAnswer[]; onNext: () => void }) {
  const correct = answers.filter(a => questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption).length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex justify-between items-center sticky top-[68px] z-10 py-3 px-4 rounded-2xl border"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--alg-text)' }}>Detailed Analysis</h2>
          <p className="text-xs text-neutral-500">{correct} correct out of {questions.length}</p>
        </div>
        <button onClick={onNext}
          className="px-5 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2"
          style={{ background: 'var(--alg-primary)' }}
        >
          Final Report <ArrowRight size={15} />
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const ua = answers.find(a => a.questionId === q.id);
          const isCorrect = ua?.selectedOption === q.correctAnswer;
          const skipped = !ua;

          return (
            <div key={q.id} className="p-5 rounded-2xl border"
              style={{ background: 'var(--alg-white)', borderColor: isCorrect ? '#86efac' : skipped ? 'var(--border-color)' : '#fca5a5' }}>
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <span className={cn("w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5",
                    isCorrect ? "bg-green-100" : skipped ? "bg-neutral-100" : "bg-red-100"
                  )}>
                    {isCorrect
                      ? <CheckmarkOutline size={14} className="text-green-600" />
                      : skipped
                      ? <span className="text-neutral-500 text-xs">–</span>
                      : <MisuseOutline size={14} className="text-red-500" />
                    }
                  </span>
                  <h4 className="font-medium text-sm leading-snug" style={{ color: 'var(--alg-text)' }}>
                    <span className="text-neutral-400 mr-1">{idx + 1}.</span>{q.text}
                  </h4>
                </div>
                <div className="flex gap-1 shrink-0">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold",
                    isCorrect ? "bg-green-100 text-green-700" : skipped ? "bg-neutral-100 text-neutral-500" : "bg-red-100 text-red-600"
                  )}>
                    {isCorrect ? 'Correct' : skipped ? 'Skipped' : 'Wrong'}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {q.options.map((opt, i) => {
                  const isUserChoice = ua?.selectedOption === i;
                  const isCorrectOpt = q.correctAnswer === i;
                  return (
                    <div key={i} className={cn("px-3 py-2 rounded-lg border text-xs flex items-center gap-2",
                      isCorrectOpt ? "bg-green-50 border-green-300 text-green-800" :
                        isUserChoice ? "bg-red-50 border-red-300 text-red-700" :
                          "border-[var(--border-color)] text-neutral-500"
                    )} style={!isCorrectOpt && !isUserChoice ? { background: 'var(--alg-bg)' } : {}}>
                      <span className="w-4 h-4 rounded-full border border-current shrink-0 flex items-center justify-center font-bold text-[10px]">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                      {isCorrectOpt && <Checkmark size={12} className="ml-auto text-green-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="p-3 rounded-xl text-xs leading-relaxed"
                style={{ background: 'var(--alg-mint)', color: 'var(--alg-text)' }}>
                <span className="font-bold text-[var(--alg-primary)]">Explanation: </span>
                {q.explanation}
              </div>

              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">{q.category}</span>
                <span className={cn("px-2 py-0.5 rounded text-[10px] border",
                  q.difficulty === 'Easy' ? "bg-green-50 text-green-700 border-green-200" :
                    q.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-red-50 text-red-700 border-red-200"
                )}>{q.difficulty}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onNext}
        className="w-full py-3 rounded-2xl text-white font-bold flex justify-center items-center gap-2 mt-4"
        style={{ background: 'var(--alg-primary)' }}
      >
        View Final Report <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ─── Screen 7: Final Report ────────────────────────────────────── */
function Screen7Final({ questions, answers, timeTaken, backHref, backLabel, onRetake }:
  { questions: Question[]; answers: UserAnswer[]; timeTaken: string; backHref: string; backLabel: string; onRetake: () => void }) {
  const correct = answers.filter(a => questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 60;
  const level = score >= 80 ? 'Expert' : score >= 60 ? 'Intermediate' : 'Beginner';
  const levelPct = score >= 80 ? 88 : score >= 60 ? 55 : 18;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, var(--alg-primary), var(--alg-secondary))' }}>
            {score >= 80 ? '🏆' : score >= 60 ? '⭐' : '📚'}
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>Final Report</h2>
            <p className="text-neutral-400 text-sm">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-neutral-400 text-xs">Score</p>
            <p className="text-4xl font-black" style={{ color: passed ? '#16a34a' : '#f97316' }}>{score}%</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Correct', v: correct, c: 'text-green-600', bg: '#f0fdf4' },
            { label: 'Wrong', v: answers.length - correct, c: 'text-red-500', bg: '#fff1f2' },
            { label: 'Skipped', v: questions.length - answers.length, c: 'text-orange-500', bg: '#fff7ed' },
            { label: 'Time', v: timeTaken, c: 'text-blue-600', bg: '#eff6ff' },
          ].map(({ label, v, c, bg }) => (
            <div key={label} className="rounded-xl p-3 text-center border" style={{ background: bg, borderColor: 'var(--border-color)' }}>
              <p className="text-neutral-400 text-[10px] uppercase">{label}</p>
              <p className={cn("text-lg font-bold", c)}>{v}</p>
            </div>
          ))}
        </div>

        {/* Level bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>Beginner</span><span>Intermediate</span><span>Expert</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${levelPct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--alg-secondary), var(--alg-primary))' }}
            />
          </div>
          <p className="mt-1.5 text-sm font-bold" style={{ color: 'var(--alg-primary)' }}>Level: {level}</p>
        </div>

        {/* Recommendation */}
        <div className="p-4 rounded-2xl border mb-6"
          style={{ background: passed ? '#f0fdf4' : '#fff7ed', borderColor: passed ? '#86efac' : '#fed7aa' }}>
          <h4 className="font-bold text-sm mb-1" style={{ color: passed ? '#15803d' : '#c2410c' }}>
            {passed ? '✅ Recommendation' : '💡 Improvement Plan'}
          </h4>
          <p className="text-sm text-neutral-600">
            {score >= 80
              ? 'Outstanding! You have mastered the core concepts. Challenge yourself with the next difficulty level or explore adjacent topics.'
              : score >= 60
              ? 'Good performance! Focus on topics where your accuracy was below 60% — re-read those sections and attempt the quiz again.'
              : 'Keep learning! Review the explanations for each question you got wrong, then revisit the modules before trying again.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link href={backHref}
            className="flex-1 py-3 rounded-2xl font-bold text-center no-underline text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--alg-secondary)' }}
          >
            {backLabel}
          </Link>
          <button onClick={onRetake}
            className="flex-1 py-3 rounded-2xl font-bold border transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', color: 'var(--alg-text)' }}
          >
            <Restart size={16} /> Retake
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Engine ────────────────────────────────────────────── */
interface QuizEngineProps {
  subject: 'os' | 'aiml';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  topics: string[];
  allQuestions: Question[];
  backHref: string;
  backLabel: string;
  accentColor?: string;
}

export default function QuizEngine({
  subject, title, subtitle, icon, topics, allQuestions, backHref, backLabel,
}: QuizEngineProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState('0:00');
  const [previousBest, setPreviousBest] = useState<SavedQuizResult | null>(null);

  useEffect(() => {
    const results = loadResults(subject);
    if (results.length > 0) {
      const best = [...results].sort((a, b) => b.score - a.score)[0];
      setPreviousBest(best);
    }
  }, [subject]);

  const handleBegin = (s: QuizSettings) => {
    setSettings(s);
    let pool = allQuestions.filter(q => s.selectedTopics.includes(q.category));
    if (s.difficulty !== 'All') pool = pool.filter(q => q.difficulty === s.difficulty);
    // Shuffle
    pool = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(pool.slice(0, s.questionCount));
    setStep(3);
  };

  const handleConfirmSubmit = () => {
    const correct = answers.filter(a =>
      questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption
    ).length;
    const score = Math.round((correct / questions.length) * 100);
    const result: SavedQuizResult = {
      date: new Date().toISOString(),
      score,
      correct,
      total: questions.length,
      timeTaken,
      passed: score >= 60,
      subject,
    };
    saveResult(subject, result);
    if (!previousBest || score > previousBest.score) setPreviousBest(result);
    setStep(5);
  };

  const handleRetake = () => {
    setStep(1); setSettings(null); setAnswers([]); setTimeTaken('0:00'); setQuestions([]);
  };

  const score = questions.length > 0
    ? Math.round((answers.filter(a =>
        questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption
      ).length / questions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--alg-bg)', color: 'var(--alg-text)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b shadow-sm"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <Link href="/" className="flex items-center gap-2 font-black text-xl no-underline" style={{ color: 'var(--alg-primary)' }}>
          <Code2 className="h-6 w-6" /> AlgoLogic
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-neutral-400 font-medium uppercase tracking-wider">{title} Quiz</span>
          <StepDots current={step} total={7} />
        </div>
        <Link href={backHref}
          className="text-sm font-semibold no-underline px-4 py-2 rounded-full transition-all hover:bg-[var(--alg-mint)]"
          style={{ color: 'var(--alg-primary)' }}>
          ← {backLabel}
        </Link>
      </nav>

      {/* Content */}
      <main className="flex-1 px-4 py-10 md:px-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Screen1Intro key="s1" title={title} subtitle={subtitle} icon={icon}
              topics={topics} onStart={() => setStep(2)} previousBest={previousBest} />
          )}
          {step === 2 && (
            <Screen2Settings key="s2" topics={topics} onBegin={handleBegin} />
          )}
          {step === 3 && settings && (
            <Screen3Quiz key="s3" questions={questions} settings={settings}
              onFinish={(a, t) => { setAnswers(a); setTimeTaken(t); setStep(4); }} />
          )}
          {step === 4 && (
            <Screen4Confirmation key="s4" total={questions.length} attempted={answers.length}
              onConfirm={handleConfirmSubmit} onBack={() => setStep(3)} />
          )}
          {step === 5 && (
            <Screen5Result key="s5" questions={questions} answers={answers}
              timeTaken={timeTaken} onAnalysis={() => setStep(6)} />
          )}
          {step === 6 && (
            <Screen6Analysis key="s6" questions={questions} answers={answers} onNext={() => setStep(7)} />
          )}
          {step === 7 && (
            <Screen7Final key="s7" questions={questions} answers={answers}
              timeTaken={timeTaken} backHref={backHref} backLabel={`← ${backLabel}`} onRetake={handleRetake} />
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-4 text-xs text-neutral-400 border-t" style={{ borderColor: 'var(--border-color)' }}>
        AlgoLogic · Interactive Learning Platform
      </footer>
    </div>
  );
}
