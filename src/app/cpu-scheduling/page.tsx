"use client";

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/ui/shaders-hero-section';
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
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <Header
          title="CPU Scheduling Algorithms"
          description="Select an algorithm, enter process data, and visualize step-by-step execution"
        />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
              CPU Scheduling Algorithms
            </h2>
            <p className="text-sm sm:text-base text-white/60">
              Select an algorithm, enter process data, and visualize step-by-step execution
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10">
            {ALGORITHMS.map(algo => (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgorithm(algo.id);
                  setResult(null);
                  setCurrentStep(-1);
                }}
                className={`
                  px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 text-left border
                  ${selectedAlgorithm === algo.id
                    ? 'bg-white/10 text-white border-white/30 shadow-lg shadow-white/5'
                    : 'bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/20'}
                `}
              >
                <span className="block font-semibold text-sm sm:text-base">{algo.name}</span>
                <span className="text-[10px] sm:text-xs opacity-60 hidden sm:block mt-1">{algo.fullName}</span>
              </button>
            ))}
          </div>

          {currentAlgo && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10 flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white mb-1">{currentAlgo.fullName}</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{currentAlgo.description}</p>
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
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    Ready to Visualize
                  </h3>
                  <p className="text-sm sm:text-base text-white/60 max-w-md mx-auto leading-relaxed">
                    Enter process details on the left and click &quot;Visualize Algorithm&quot; to see the scheduling in action
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-8 sm:mt-16 py-6 sm:py-8 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center text-white/40 text-xs sm:text-sm">
            <p>AlgoViz OS - Learn Operating System Algorithms Visually</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
