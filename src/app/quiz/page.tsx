"use client";

import React, { useState, useEffect } from 'react';
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
  Result,
  ChartLine,
  Download,
  Restart,
  Flag,
  Close,
} from '@carbon/icons-react';
import { Code2 } from 'lucide-react';
import { QUESTIONS, TOPICS } from '../dashboard/quiz/data';
import { Difficulty, QuizSettings, UserAnswer, Question } from '../dashboard/quiz/types';
import { cn } from '@/lib/utils';

/* ─── localStorage key & result shape ─── */
const LS_KEY = 'algologic_quiz_results';

export interface SavedQuizResult {
  date: string;         // ISO string
  score: number;        // 0-100
  correct: number;
  total: number;
  timeTaken: string;
  passed: boolean;
}

function saveResult(result: SavedQuizResult) {
  try {
    const existing: SavedQuizResult[] = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    existing.unshift(result);
    // Keep last 20 results
    localStorage.setItem(LS_KEY, JSON.stringify(existing.slice(0, 20)));
  } catch (_) { /* silent */ }
}

/* ─── Screen 1: Introduction ─── */
const Screen1Intro = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-8"
  >
    <div className="bg-blue-500/10 p-6 rounded-full border border-blue-500/20">
      <Education size={64} className="text-blue-500" />
    </div>
    <div className="space-y-4">
      <h1 className="text-4xl font-bold" style={{ color: 'var(--alg-text)' }}>Operating Systems</h1>
      <h2 className="text-2xl font-light text-blue-500">Memory &amp; Scheduling Quiz</h2>
      <p className="text-neutral-500 max-w-lg mx-auto">
        Test your knowledge on core OS concepts. This quiz covers key topics to prepare you for exams and interviews.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <div className="p-4 rounded-xl border text-left" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm" style={{ color: 'var(--alg-text)' }}>
          <Checkmark size={16} className="text-green-500" /> Topics Covered
        </h3>
        <ul className="text-sm text-neutral-600 space-y-1">
          {TOPICS.map(t => <li key={t}>• {t}</li>)}
        </ul>
      </div>
      <div className="p-4 rounded-xl border text-left" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm" style={{ color: 'var(--alg-text)' }}>
          <Time size={16} className="text-yellow-600" /> Quiz Details
        </h3>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• Total Questions: Customizable</li>
          <li>• Time Limit: Optional</li>
          <li>• Format: MCQ</li>
          <li>• Instant Results</li>
        </ul>
      </div>
    </div>

    <button
      onClick={onStart}
      className="px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ background: 'var(--alg-primary)', color: '#fff' }}
    >
      Start Quiz <ArrowRight size={20} />
    </button>
  </motion.div>
);

/* ─── Screen 2: Settings ─── */
const Screen2Settings = ({ onBegin }: { onBegin: (s: QuizSettings) => void }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [count, setCount] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(TOPICS);
  const [timer, setTimer] = useState(true);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) setSelectedTopics(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedTopics(prev => [...prev, topic]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto p-8 rounded-3xl border"
      style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
    >
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--alg-text)' }}>
        <Settings size={32} className="text-purple-500" /> Quiz Configuration
      </h2>

      <div className="space-y-8">
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="font-medium" style={{ color: 'var(--alg-text)' }}>Difficulty Level</label>
          <div className="flex gap-4">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={cn(
                  "flex-1 py-3 rounded-xl border transition-all font-medium",
                  difficulty === level
                    ? "bg-purple-500/20 border-purple-500 text-purple-700 shadow-md"
                    : "border-[var(--border-color)] text-neutral-600 hover:bg-purple-50"
                )}
                style={difficulty !== level ? { background: 'var(--alg-mint)' } : {}}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="font-medium" style={{ color: 'var(--alg-text)' }}>Number of Questions</label>
            <span className="text-purple-600 font-bold">{count}</span>
          </div>
          <input
            type="range" min="3" max="10" value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
            style={{ background: 'var(--border-color)' }}
          />
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <label className="font-medium" style={{ color: 'var(--alg-text)' }}>Topics Covered</label>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map(topic => (
              <div
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all",
                  selectedTopics.includes(topic)
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-700"
                    : "text-neutral-600"
                )}
                style={!selectedTopics.includes(topic) ? { background: 'var(--alg-mint)', borderColor: 'var(--border-color)' } : {}}
              >
                {selectedTopics.includes(topic) ? <Checkmark size={16} /> : <div className="w-4 h-4" />}
                <span className="text-sm">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timer toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <Time size={20} className="text-orange-500" />
            <span className="font-medium" style={{ color: 'var(--alg-text)' }}>Enable Timer</span>
          </div>
          <button
            onClick={() => setTimer(!timer)}
            className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", timer ? "bg-green-500" : "bg-neutral-300")}
          >
            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300", timer ? "left-7" : "left-1")} />
          </button>
        </div>

        <button
          onClick={() => onBegin({ difficulty, questionCount: count, selectedTopics, timerEnabled: timer })}
          className="w-full py-4 rounded-xl font-bold text-lg text-white flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--alg-primary), var(--alg-secondary))' }}
        >
          <Play size={20} /> Begin Quiz
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Screen 3: Active Question ─── */
const Screen3Quiz = ({
  questions,
  settings,
  onFinish,
}: {
  questions: Question[];
  settings: QuizSettings;
  onFinish: (answers: UserAnswer[], timeTaken: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timer, setTimer] = useState(0);
  const [flagged, setFlagged] = useState<number[]>([]);

  useEffect(() => {
    if (!settings.timerEnabled) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [settings.timerEnabled]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === questions[currentIndex].id);
    if (existingIndex >= 0) {
      newAnswers[existingIndex].selectedOption = optionIndex;
    } else {
      newAnswers.push({ questionId: questions[currentIndex].id, selectedOption: optionIndex, isMarked: false });
    }
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const qId = questions[currentIndex].id;
    setFlagged(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id)?.selectedOption;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <span className="text-neutral-500 text-sm">
          Question <strong className="text-xl" style={{ color: 'var(--alg-text)' }}>{currentIndex + 1}</strong> of {questions.length}
        </span>
        {settings.timerEnabled && (
          <div className="px-4 py-2 rounded-lg font-mono text-orange-600 flex items-center gap-2 border"
            style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
            <Time size={16} /> {formatTime(timer)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full" style={{ background: 'var(--border-color)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--alg-primary)' }} />
      </div>

      {/* Question */}
      <motion.div key={currentIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
        <h2 className="text-2xl font-semibold mb-6 leading-relaxed" style={{ color: 'var(--alg-text)' }}>{currentQ.text}</h2>
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                "w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all",
                currentAnswer === idx
                  ? "border-2 font-semibold"
                  : "text-neutral-700 hover:border-opacity-60"
              )}
              style={currentAnswer === idx
                ? { background: 'var(--alg-primary)', borderColor: 'var(--alg-primary)', color: '#fff' }
                : { background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
            >
              <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", currentAnswer === idx ? "border-white" : "border-neutral-400")}>
                {currentAnswer === idx && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Footer controls */}
      <div className="flex justify-between items-center border-t pt-5 mt-2" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={toggleFlag}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
            flagged.includes(currentQ.id) ? "text-yellow-700 bg-yellow-100" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Flag size={16} /> {flagged.includes(currentQ.id) ? 'Flagged' : 'Flag for Review'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-2 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            style={{ background: 'var(--alg-secondary)' }}
          >
            <ArrowLeft size={16} /> Prev
          </button>
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => onFinish(answers, formatTime(timer))}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
            >
              Finish Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2 rounded-lg text-white font-bold transition-all flex items-center gap-1"
              style={{ background: 'var(--alg-primary)' }}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Screen 4: Confirm Submit ─── */
const Screen4Confirmation = ({
  total, attempted, onConfirm, onBack,
}: { total: number; attempted: number; onConfirm: () => void; onBack: () => void }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
  >
    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
      <Warning size={48} className="text-yellow-500" />
    </div>
    <div>
      <h2 className="text-3xl font-bold" style={{ color: 'var(--alg-text)' }}>Submit Quiz?</h2>
      <p className="text-neutral-500 mt-1">Are you sure you want to finish the assessment?</p>
    </div>
    <div className="p-6 rounded-2xl border w-full max-w-sm text-left space-y-2" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
      <div className="flex justify-between"><span className="text-neutral-500">Total Questions</span><span className="font-bold">{total}</span></div>
      <div className="flex justify-between"><span className="text-green-600">Attempted</span><span className="font-bold">{attempted}</span></div>
      <div className="flex justify-between"><span className="text-red-500">Unattempted</span><span className="font-bold">{total - attempted}</span></div>
    </div>
    <div className="flex gap-4 w-full max-w-sm">
      <button onClick={onBack} className="flex-1 py-3 rounded-xl text-white" style={{ background: 'var(--alg-secondary)' }}>Go Back</button>
      <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">Submit</button>
    </div>
  </motion.div>
);

/* ─── Screen 5: Score Card ─── */
const Screen5Result = ({
  questions, answers, timeTaken, onAnalysis,
}: { questions: Question[]; answers: UserAnswer[]; timeTaken: string; onAnalysis: () => void }) => {
  const correctCount = answers.filter(a =>
    questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption
  ).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 60;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto flex flex-col items-center space-y-8"
    >
      <div className="text-center">
        <h2 className="text-4xl font-bold" style={{ color: 'var(--alg-text)' }}>Quiz Completed!</h2>
        <p className="text-neutral-500 mt-1">Here is how you performed</p>
      </div>

      <div className={cn(
        "w-full p-8 rounded-3xl border flex flex-col items-center gap-4",
        passed ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
      )}>
        <div className={cn("w-32 h-32 rounded-full flex items-center justify-center border-4 text-4xl font-bold",
          passed ? "border-green-500 text-green-600" : "border-red-500 text-red-600"
        )}>
          {score}%
        </div>
        <div className="text-center">
          <h3 className={cn("text-2xl font-bold", passed ? "text-green-600" : "text-red-500")}>
            {passed ? "Excellent Work!" : "Needs Improvement"}
          </h3>
          <p className="text-neutral-500 text-sm mt-1">
            {passed ? "You have a strong grasp of the concepts." : "Review the material and try again."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {[
          { label: 'Correct', value: correctCount, color: 'text-green-600' },
          { label: 'Wrong', value: answers.length - correctCount, color: 'text-red-500' },
          { label: 'Time', value: timeTaken, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border text-center" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{label}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      <button onClick={onAnalysis}
        className="w-full py-4 rounded-xl font-bold text-lg text-white flex justify-center items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: 'var(--alg-primary)' }}
      >
        <ChartLine size={20} /> Detailed Analysis
      </button>
    </motion.div>
  );
};

/* ─── Screen 6: Per-question Analysis ─── */
const Screen6Analysis = ({
  questions, answers, onNext,
}: { questions: Question[]; answers: UserAnswer[]; onNext: () => void }) => (
  <div className="max-w-4xl mx-auto flex flex-col gap-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>Detailed Analysis</h2>
      <button onClick={onNext}
        className="px-6 py-2 rounded-lg text-white font-bold flex items-center gap-2 transition-all"
        style={{ background: 'var(--alg-primary)' }}
      >
        Final Report <ArrowRight size={16} />
      </button>
    </div>

    <div className="p-6 rounded-2xl border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--alg-text)' }}>
        <Result size={20} /> Performance Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-green-600 text-sm font-bold mb-2 uppercase">Strengths</p>
          <ul className="list-disc list-inside text-neutral-600 text-sm space-y-1">
            <li>Strong understanding of CPU Scheduling</li>
            <li>Good accuracy in theoretical concepts</li>
          </ul>
        </div>
        <div>
          <p className="text-orange-500 text-sm font-bold mb-2 uppercase">Suggestions</p>
          <ul className="list-disc list-inside text-neutral-600 text-sm space-y-1">
            <li>Revise First Fit, Best Fit concepts</li>
            <li>Practice more on Page Replacement algorithms</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="space-y-4 overflow-y-auto">
      {questions.map((q, idx) => {
        const userAnswer = answers.find(a => a.questionId === q.id);
        const isCorrect = userAnswer?.selectedOption === q.correctAnswer;
        return (
          <div key={q.id} className="p-6 rounded-xl border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium flex-1" style={{ color: 'var(--alg-text)' }}>
                <span className="text-neutral-400 mr-2">{idx + 1}.</span>{q.text}
              </h4>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase ml-4",
                isCorrect ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-500"
              )}>
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
                <p className="text-neutral-400 mb-1 text-xs">Your Answer</p>
                <p className={cn("font-medium", isCorrect ? "text-green-600" : "text-red-500")}>
                  {userAnswer ? q.options[userAnswer.selectedOption] : "Skipped"}
                </p>
              </div>
              <div className="p-3 rounded-lg border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
                <p className="text-neutral-400 mb-1 text-xs">Correct Answer</p>
                <p className="text-green-600 font-medium">{q.options[q.correctAnswer]}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-200">{q.category}</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs border border-purple-200">{q.difficulty}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Screen 7: Final Report ─── */
const Screen7Final = ({
  score, questions, answers, timeTaken, onRetake,
}: { score: number; questions: Question[]; answers: UserAnswer[]; timeTaken: string; onRetake: () => void }) => {
  const correctCount = answers.filter(a =>
    questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption
  ).length;

  const level = score >= 80 ? 'Expert' : score >= 60 ? 'Intermediate' : 'Novice';
  const levelPct = score >= 80 ? 90 : score >= 60 ? 55 : 15;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto flex flex-col items-center space-y-8"
    >
      <div className="w-full rounded-3xl p-8 border shadow-sm" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        {/* Profile row */}
        <div className="flex items-center gap-4 mb-8 border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--alg-primary), var(--alg-secondary))' }}>
            U
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--alg-text)' }}>Your Result</h2>
            <p className="text-neutral-500 text-sm">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-neutral-400 text-sm">Final Score</p>
            <p className="text-4xl font-bold" style={{ color: 'var(--alg-primary)' }}>{score}%</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Correct', value: correctCount, color: 'text-green-600' },
            { label: 'Wrong', value: answers.length - correctCount, color: 'text-red-500' },
            { label: 'Time', value: timeTaken, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'var(--alg-mint)' }}>
              <p className="text-neutral-500 text-xs mb-1">{label}</p>
              <p className={cn("text-xl font-bold", color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Performance bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-neutral-500 mb-2">
            <span>Novice</span><span>Intermediate</span><span>Expert</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--alg-secondary), var(--alg-primary))' }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--alg-primary)' }}>Level: {level}</p>
        </div>

        {/* Recommendation */}
        <div className="p-5 rounded-xl border mb-6" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
          <h4 className="font-bold mb-1" style={{ color: 'var(--alg-primary)' }}>Recommendation</h4>
          <p className="text-neutral-600 text-sm">
            {score >= 80
              ? "Outstanding! You have a strong command of OS concepts. Consider exploring advanced topics like real-time scheduling and memory virtualization."
              : score >= 60
              ? "Good work! Solidify your understanding of memory management and page replacement before moving to advanced topics."
              : "Keep going! Review the OS Animations and Modules sections to strengthen your fundamentals, then try again."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Link href="/modules"
            className="flex-1 py-3 rounded-xl font-bold text-center no-underline text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'var(--alg-secondary)' }}
          >
            Back to Modules
          </Link>
          <button onClick={onRetake}
            className="flex-1 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md border"
            style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)', color: 'var(--alg-text)' }}
          >
            <Restart size={16} className="inline mr-2" /> Retake Quiz
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Step indicator ─── */
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={cn(
        "rounded-full transition-all duration-300",
        i + 1 === current ? "w-6 h-2.5" : "w-2.5 h-2.5",
        i + 1 < current ? "opacity-100" : i + 1 === current ? "opacity-100" : "opacity-30"
      )}
        style={{ background: i + 1 <= current ? 'var(--alg-primary)' : 'var(--border-color)' }}
      />
    ))}
  </div>
);

/* ─── Main Page ─── */
export default function StandaloneQuizPage() {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState('0:00');

  const handleBegin = (newSettings: QuizSettings) => {
    setSettings(newSettings);
    const filtered = QUESTIONS
      .filter(q => newSettings.selectedTopics.includes(q.category))
      .slice(0, newSettings.questionCount);
    setQuizQuestions(filtered);
    setStep(3);
  };

  const handleFinishQuiz = (answers: UserAnswer[], time: string) => {
    setUserAnswers(answers);
    setTimeTaken(time);
    setStep(4);
  };

  const handleConfirmSubmit = () => {
    // Calculate score and save to localStorage
    const correctCount = userAnswers.filter(a =>
      quizQuestions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption
    ).length;
    const score = Math.round((correctCount / quizQuestions.length) * 100);
    saveResult({
      date: new Date().toISOString(),
      score,
      correct: correctCount,
      total: quizQuestions.length,
      timeTaken,
      passed: score >= 60,
    });
    setStep(5);
  };

  const handleRetake = () => {
    setStep(1);
    setSettings(null);
    setUserAnswers([]);
    setTimeTaken('0:00');
  };

  const score = quizQuestions.length > 0
    ? Math.round((userAnswers.filter(a =>
        quizQuestions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption
      ).length / quizQuestions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--alg-bg)', color: 'var(--alg-text)' }}>
      {/* Top nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b shadow-sm"
        style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <Link href="/" className="flex items-center gap-2 font-black text-xl no-underline" style={{ color: 'var(--alg-primary)' }}>
          <Code2 className="h-6 w-6" /> AlgoLogic
        </Link>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="hidden sm:block">OS Quiz</span>
          <span className="hidden sm:block text-neutral-300">|</span>
          <StepDots current={step} total={7} />
        </div>
        <Link href="/modules" className="text-sm font-semibold no-underline px-4 py-2 rounded-full transition-all hover:bg-[var(--alg-mint)]"
          style={{ color: 'var(--alg-primary)' }}>
          ← Back to Modules
        </Link>
      </nav>

      {/* Quiz content */}
      <main className="flex-1 px-4 py-10 md:px-8">
        <AnimatePresence mode="wait">
          {step === 1 && <Screen1Intro key="s1" onStart={() => setStep(2)} />}
          {step === 2 && <Screen2Settings key="s2" onBegin={handleBegin} />}
          {step === 3 && settings && (
            <Screen3Quiz key="s3" questions={quizQuestions} settings={settings} onFinish={handleFinishQuiz} />
          )}
          {step === 4 && (
            <Screen4Confirmation
              key="s4"
              total={quizQuestions.length}
              attempted={userAnswers.length}
              onConfirm={handleConfirmSubmit}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <Screen5Result
              key="s5"
              questions={quizQuestions}
              answers={userAnswers}
              timeTaken={timeTaken}
              onAnalysis={() => setStep(6)}
            />
          )}
          {step === 6 && (
            <Screen6Analysis key="s6" questions={quizQuestions} answers={userAnswers} onNext={() => setStep(7)} />
          )}
          {step === 7 && (
            <Screen7Final
              key="s7"
              score={score}
              questions={quizQuestions}
              answers={userAnswers}
              timeTaken={timeTaken}
              onRetake={handleRetake}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-neutral-400 border-t" style={{ borderColor: 'var(--border-color)' }}>
        AlgoLogic · Interactive Learning Platform
      </footer>
    </div>
  );
}
