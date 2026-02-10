"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Education, 
  Time, 
  Checkmark, 
  CheckmarkOutline, 
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
  Close
} from '@carbon/icons-react';
import { QUESTIONS, TOPICS } from './data';
import { Difficulty, QuizSettings, UserAnswer, Question } from './types';
import { cn } from '@/lib/utils';

// --- Screen 1: Introduction ---
const Screen1Intro = ({ onStart }: { onStart: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8"
  >
    <div className="bg-blue-500/10 p-6 rounded-full border border-blue-500/20">
      <Education size={64} className="text-blue-400" />
    </div>
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">Operating Systems</h1>
      <h2 className="text-2xl text-blue-400 font-light">Memory & Scheduling Quiz</h2>
      <p className="text-neutral-400 max-w-lg mx-auto">
        Test your knowledge on core OS concepts. This quiz covers key topics to prepare you for exams and interviews.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <div className="p-4 rounded-xl border text-left" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Checkmark size={16} className="text-green-500"/> Topics</h3>
        <ul className="text-sm text-neutral-600 space-y-1">
          {TOPICS.map(t => <li key={t}>• {t}</li>)}
        </ul>
      </div>
      <div className="p-4 rounded-xl border text-left" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Time size={16} className="text-yellow-600"/> Details</h3>
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
      className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
    >
      <span>Start Quiz</span>
      <ArrowRight size={20} />
    </button>
  </motion.div>
);

// --- Screen 2: Settings ---
const Screen2Settings = ({ onBegin }: { onBegin: (settings: QuizSettings) => void }) => {
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
style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Settings size={32} className="text-purple-400"/> Quiz Configuration
      </h2>

      <div className="space-y-8">
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="text-neutral-700 font-medium">Difficulty Level</label>
          <div className="flex gap-4">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={cn(
                  "flex-1 py-3 rounded-xl border transition-all font-medium",
                  difficulty === level 
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                    : "bg-[var(--alg-mint)]/50 border-[var(--border-color)] text-neutral-700 hover:bg-[var(--alg-mint)]"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-neutral-700 font-medium">Number of Questions</label>
            <span className="text-purple-400 font-bold">{count}</span>
          </div>
          <input 
            type="range" min="3" max="10" value={count} 
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <label className="text-neutral-700 font-medium">Topics Covered</label>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map(topic => (
              <div 
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all",
                  selectedTopics.includes(topic)
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-300"
                    : "bg-[var(--alg-mint)]/30 border-[var(--border-color)] text-neutral-600"
                )}
              >
                {selectedTopics.includes(topic) ? <Checkmark size={16} /> : <div className="w-4 h-4"/>}
                <span className="text-sm">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <Time size={20} className="text-orange-500"/>
            <span className="text-neutral-700">Enable Timer</span>
          </div>
          <button 
            onClick={() => setTimer(!timer)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-300",
              timer ? "bg-green-500" : "bg-neutral-600"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
              timer ? "left-7" : "left-1"
            )}/>
          </button>
        </div>

        <button 
          onClick={() => onBegin({ difficulty, questionCount: count, selectedTopics, timerEnabled: timer })}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex justify-center items-center gap-2"
        >
          <Play size={20} /> Begin Quiz
        </button>
      </div>
    </motion.div>
  );
};

// --- Screen 3: Question ---
const Screen3Quiz = ({ 
  questions, 
  settings, 
  onFinish 
}: { 
  questions: Question[], 
  settings: QuizSettings, 
  onFinish: (answers: UserAnswer[], timeTaken: string) => void 
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

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === questions[currentIndex].id);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex].selectedOption = optionIndex;
    } else {
      newAnswers.push({
        questionId: questions[currentIndex].id,
        selectedOption: optionIndex,
        isMarked: false
      });
    }
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const qId = questions[currentIndex].id;
    if (flagged.includes(qId)) setFlagged(prev => prev.filter(id => id !== qId));
    else setFlagged(prev => [...prev, qId]);
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id)?.selectedOption;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-neutral-400">
          Question <span className="font-bold text-xl">{currentIndex + 1}</span> of {questions.length}
        </div>
        {settings.timerEnabled && (
          <div className="bg-neutral-800 px-4 py-2 rounded-lg font-mono text-orange-400 flex items-center gap-2">
            <Time size={16} /> {formatTime(timer)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-neutral-800 rounded-full mb-8">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
        className="flex-1"
      >
        <h2 className="text-2xl font-semibold mb-8 leading-relaxed">
          {currentQ.text}
        </h2>

        <div className="space-y-4">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 group",
                currentAnswer === idx 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                  : "bg-[var(--alg-white)] border-[var(--border-color)] text-neutral-700 hover:bg-[var(--alg-mint)]"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                currentAnswer === idx ? "border-white bg-white/20" : "border-neutral-500"
              )}>
                {currentAnswer === idx && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
              <span className="text-lg">{option}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Footer Controls */}
      <div className="mt-8 flex justify-between items-center border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
        <button 
          onClick={toggleFlag}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            flagged.includes(currentQ.id) ? "text-yellow-600 bg-yellow-100" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Flag size={16} /> {flagged.includes(currentQ.id) ? 'Flagged' : 'Flag for Review'}
        </button>

        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      style={{ background: 'var(--alg-primary)' }}
          >
            Previous
          </button>
          
          {currentIndex === questions.length - 1 ? (
            <button 
              onClick={() => onFinish(answers, formatTime(timer))}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
            >
              Finish Quiz
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Screen 4: Confirmation ---
const Screen4Confirmation = ({ 
  total, 
  attempted, 
  onConfirm, 
  onBack 
}: { 
  total: number, 
  attempted: number, 
  onConfirm: () => void, 
  onBack: () => void 
}) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center h-full text-center space-y-8"
  >
    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
      <Warning size={48} className="text-yellow-500" />
    </div>
    
    <div className="space-y-2">
      <h2 className="text-3xl font-bold">Submit Quiz?</h2>
      <p className="text-neutral-400">Are you sure you want to finish the assessment?</p>
    </div>

    <div className="p-6 rounded-2xl border w-full max-w-sm" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-neutral-400">Total Questions</span>
        <span className="font-bold">{total}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-green-400">Attempted</span>
        <span className="font-bold">{attempted}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-red-400">Unattempted</span>
        <span className="font-bold">{total - attempted}</span>
      </div>
    </div>

    <div className="flex gap-4 w-full max-w-sm">
      <button 
        onClick={onBack}
        className="flex-1 py-3 rounded-xl text-white transition-colors"
      style={{ background: 'var(--alg-primary)' }}
      >
        Go Back
      </button>
      <button 
        onClick={onConfirm}
        className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-[0_0_20px_rgba(22,163,74,0.3)]"
      >
        Submit
      </button>
    </div>
  </motion.div>
);

// --- Screen 5: Result Summary ---
const Screen5Result = ({ 
  questions, 
  answers, 
  timeTaken,
  onAnalysis 
}: { 
  questions: Question[], 
  answers: UserAnswer[], 
  timeTaken: string,
  onAnalysis: () => void
}) => {
  const correctCount = answers.filter(a => questions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 60;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Quiz Completed!</h2>
        <p className="text-neutral-400">Here is how you performed</p>
      </div>

      {/* Score Card */}
      <div className={cn(
        "w-full p-8 rounded-3xl border flex flex-col items-center gap-4 relative overflow-hidden",
        passed ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
      )}>
        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center border-4 text-4xl font-bold shadow-lg",
          passed ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
        )}>
          {score}%
        </div>
        <div className="text-center z-10">
          <h3 className={cn("text-2xl font-bold", passed ? "text-green-400" : "text-red-400")}>
            {passed ? "Excellent Work!" : "Needs Improvement"}
          </h3>
          <p className="text-neutral-400 text-sm mt-1">{passed ? "You have a strong grasp of the concepts." : "Review the material and try again."}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
          <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Correct</p>
          <p className="text-2xl font-bold text-green-400">{correctCount}</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
          <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Wrong</p>
          <p className="text-2xl font-bold text-red-400">{answers.length - correctCount}</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
          <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Time</p>
          <p className="text-2xl font-bold text-blue-400">{timeTaken}</p>
        </div>
      </div>

      <button 
        onClick={onAnalysis}
        className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-neutral-200 transition-all flex justify-center items-center gap-2"
      >
        <ChartLine size={20} /> Detailed Analysis
      </button>
    </motion.div>
  );
};

// --- Screen 6: Analysis ---
const Screen6Analysis = ({ 
  questions, 
  answers, 
  onNext 
}: { 
  questions: Question[], 
  answers: UserAnswer[], 
  onNext: () => void 
}) => {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Detailed Analysis</h2>
        <button 
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Final Report <ArrowRight size={16} className="inline ml-1"/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Insights Box */}
        <div className="p-6 rounded-2xl border mb-8" style={{ background: 'var(--alg-mint)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Result size={20} /> Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-green-400 text-sm font-bold mb-2 uppercase">Strengths</p>
              <ul className="list-disc list-inside text-neutral-600 text-sm space-y-1">
                <li>Strong understanding of CPU Scheduling</li>
                <li>Good accuracy in theoretical concepts</li>
              </ul>
            </div>
            <div>
              <p className="text-orange-400 text-sm font-bold mb-2 uppercase">Suggestions</p>
              <ul className="list-disc list-inside text-neutral-600 text-sm space-y-1">
                <li>Revise First Fit, Best Fit concepts</li>
                <li>Practice more on Page Replacement algorithms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAnswer = answers.find(a => a.questionId === q.id);
            const isCorrect = userAnswer?.selectedOption === q.correctAnswer;
            
            return (
              <div key={q.id} className="p-6 rounded-xl border" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-lg flex-1">
                    <span className="text-neutral-500 mr-2">{idx + 1}.</span> {q.text}
                  </h4>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase shrink-0 ml-4",
                    isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <p className="text-neutral-500 mb-1">Your Answer</p>
                    <p className={cn("font-medium", isCorrect ? "text-green-400" : "text-red-400")}>
                      {userAnswer ? q.options[userAnswer.selectedOption] : "Skipped"}
                    </p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <p className="text-neutral-500 mb-1">Correct Answer</p>
                    <p className="text-green-400 font-medium">
                      {q.options[q.correctAnswer]}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                  <span className="px-2 py-0.5 bg-white/10 rounded">{q.category}</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded">{q.difficulty}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Screen 7: Final Dashboard ---
const Screen7Final = ({ 
  score, 
  onRetake 
}: { 
  score: number, 
  onRetake: () => void 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center space-y-8"
    >
      <div className="w-full rounded-3xl p-8 border shadow-sm" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-4 mb-8 border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
            U
          </div>
          <div>
            <h2 className="text-2xl font-bold">User Profile</h2>
            <p className="text-neutral-400">ID: OS-STUDENT-2024</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-neutral-400 text-sm">Final Score</p>
            <p className="text-4xl font-bold text-blue-400">{score}/100</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-4">Performance Summary</h3>
            <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${score}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-sm text-neutral-400">
              <span>Novice</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
            <h4 className="text-blue-300 font-bold mb-2">Recommendation</h4>
            <p className="text-neutral-600 text-sm">
              User understands OS basics but needs improvement in memory management. Recommended to review the paging and segmentation visualization modules.
            </p>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="flex-1 py-3 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2" style={{ background: 'var(--alg-primary)' }}>
              <Download size={18} /> Download Report
            </button>
            <button 
              onClick={onRetake}
              className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-all flex justify-center items-center gap-2"
            >
              <Restart size={18} /> Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Orchestrator ---
export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState("0:00");

  const handleStart = () => setStep(2);

  const handleBegin = (newSettings: QuizSettings) => {
    setSettings(newSettings);
    // Filter questions based on settings (Mock logic)
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

  const handleConfirmSubmit = () => setStep(5);
  
  const handleShowAnalysis = () => setStep(6);

  const handleShowFinal = () => setStep(7);

  const handleRetake = () => {
    setStep(1);
    setSettings(null);
    setUserAnswers([]);
  };

  return (
    <div className="min-h-screen bg-transparent p-6 font-['Lexend:Regular',_sans-serif]" style={{ color: 'var(--alg-text)' }}>
      <AnimatePresence mode="wait">
        {step === 1 && <Screen1Intro key="1" onStart={handleStart} />}
        {step === 2 && <Screen2Settings key="2" onBegin={handleBegin} />}
        {step === 3 && settings && (
          <Screen3Quiz 
            key="3" 
            questions={quizQuestions} 
            settings={settings} 
            onFinish={handleFinishQuiz} 
          />
        )}
        {step === 4 && (
          <Screen4Confirmation 
            key="4"
            total={quizQuestions.length}
            attempted={userAnswers.length}
            onConfirm={handleConfirmSubmit}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <Screen5Result 
            key="5"
            questions={quizQuestions}
            answers={userAnswers}
            timeTaken={timeTaken}
            onAnalysis={handleShowAnalysis}
          />
        )}
        {step === 6 && (
          <Screen6Analysis 
            key="6"
            questions={quizQuestions}
            answers={userAnswers}
            onNext={handleShowFinal}
          />
        )}
        {step === 7 && (
          <Screen7Final 
            key="7"
            score={Math.round((userAnswers.filter(a => quizQuestions.find(q => q.id === a.questionId)?.correctAnswer === a.selectedOption).length / quizQuestions.length) * 100)}
            onRetake={handleRetake}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
