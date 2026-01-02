"use client";

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Process, SchedulingResult } from '@/lib/algorithms/types';
import { fcfs, sjf, roundRobin, priorityScheduling } from '@/lib/algorithms';
import { ProcessInputForm } from '@/components/visualizer/ProcessInputForm';
import { GanttChart } from '@/components/visualizer/GanttChart';
import { StepExplanation } from '@/components/visualizer/StepExplanation';
import { ResultsTable } from '@/components/visualizer/ResultsTable';
import { ControlPanel } from '@/components/visualizer/ControlPanel';
import { ComparisonChart } from '@/components/visualizer/ComparisonChart';

const ALGORITHMS = [
  { id: 'fcfs', name: 'FCFS', fullName: 'First Come First Serve', description: 'Processes are executed in the order they arrive' },
  { id: 'sjf', name: 'SJF', fullName: 'Shortest Job First', description: 'Process with shortest burst time executes first' },
  { id: 'round-robin', name: 'RR', fullName: 'Round Robin', description: 'Each process gets a fixed time quantum' },
  { id: 'priority', name: 'Priority', fullName: 'Priority Scheduling', description: 'Process with highest priority executes first' },
];

export default function CpuSchedulingPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('sjf');
  const [result, setResult] = useState<SchedulingResult | null>(null);
  const [inputProcesses, setInputProcesses] = useState<Process[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [timeQuantum, setTimeQuantum] = useState(2);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const runAlgorithm = useCallback((processes: Process[], tq?: number) => {
    setInputProcesses(processes);
    if (tq) setTimeQuantum(tq);
    let schedulingResult: SchedulingResult;

    switch (selectedAlgorithm) {
      case 'fcfs':
        schedulingResult = fcfs(processes);
        break;
      case 'sjf':
        schedulingResult = sjf(processes);
        break;
      case 'round-robin':
        schedulingResult = roundRobin(processes, tq || 2);
        break;
      case 'priority':
        schedulingResult = priorityScheduling(processes);
        break;
      default:
        schedulingResult = sjf(processes);
    }

    setResult(schedulingResult);
    setCurrentStep(-1);
    setIsPlaying(false);
  }, [selectedAlgorithm]);

  const handleStepChange = useCallback((step: number) => {
    if (!result) return;
    if (step >= result.steps.length) {
      setIsPlaying(false);
      setCurrentStep(result.steps.length - 1);
      return;
    }
    if (step < 0) {
      setCurrentStep(-1);
      return;
    }
    setCurrentStep(step);
  }, [result]);

  const handlePlayPause = useCallback(() => {
    if (!result) return;
    if (currentStep >= result.steps.length - 1) {
      setCurrentStep(-1);
    }
    setIsPlaying(prev => !prev);
  }, [result, currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(-1);
    setIsPlaying(false);
  }, []);

  const currentAlgo = ALGORITHMS.find(a => a.id === selectedAlgorithm);

  return (
    <div className="min-h-screen grid-pattern">
<header className="glass-effect sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <img 
                src="/assets/logos/logo1.png" 
                alt="AlgoViz OS" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain"
              />
              <div>
                <h1 className="font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  AlgoViz OS
                </h1>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">CPU Scheduling</p>
              </div>
            </Link>

          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

<main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 sm:mb-2">
              CPU Scheduling Algorithms
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Select an algorithm, enter process data, and visualize step-by-step execution
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-8">
            {ALGORITHMS.map(algo => (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgorithm(algo.id);
                  setResult(null);
                  setCurrentStep(-1);
                }}
                className={`
                  px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 text-left
                  ${selectedAlgorithm === algo.id
                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-primary)]/20'
                    : 'glass-effect text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                `}
              >
                <span className="block font-semibold text-sm sm:text-base">{algo.name}</span>
                <span className="text-[10px] sm:text-xs opacity-70 hidden sm:block">{algo.fullName}</span>
              </button>
            ))}
          </div>

          {currentAlgo && (
            <div className="glass-effect rounded-xl p-3 sm:p-4 mb-4 sm:mb-8 flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">{currentAlgo.fullName}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{currentAlgo.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <ProcessInputForm 
              algorithm={selectedAlgorithm}
              onSubmit={runAlgorithm}
            />
          </div>

<div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {result ? (
                <>
                  <ControlPanel
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onReset={handleReset}
                    onStepForward={() => handleStepChange(currentStep + 1)}
                    onStepBackward={() => handleStepChange(currentStep - 1)}
                    speed={speed}
                    onSpeedChange={setSpeed}
                    canStepForward={currentStep < result.steps.length - 1}
                    canStepBackward={currentStep > 0}
                    hasResult={!!result}
                  />

                  <GanttChart
                      ganttChart={result.ganttChart}
                      steps={result.steps}
                      processes={inputProcesses}
                      isPlaying={isPlaying}
                      speed={speed}
                      onStepChange={handleStepChange}
                      currentStep={currentStep}
                      algorithm={currentAlgo?.fullName}
                    />

                  <ComparisonChart 
                    processes={inputProcesses}
                    timeQuantum={timeQuantum}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <StepExplanation
                      steps={result.steps}
                      currentStep={currentStep}
                      processes={inputProcesses}
                    />
                    <ResultsTable
                      processes={result.processes}
                      avgWaitingTime={result.avgWaitingTime}
                      avgTurnaroundTime={result.avgTurnaroundTime}
                    />
                  </div>
                </>
              ) : (
                <div className="glass-effect rounded-xl p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2">
                    Ready to Visualize
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto">
                    Enter process details on the left and click &quot;Visualize Algorithm&quot; to see the scheduling in action
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-8 sm:mt-16 py-6 sm:py-8 border-t border-[var(--border-color)]">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center text-[var(--text-muted)] text-xs sm:text-sm">
            <p>AlgoViz OS - Learn Operating System Algorithms Visually</p>
          </div>
        </footer>
    </div>
  );
}
