"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { GanttBlock, ExecutionStep, Process } from '@/lib/algorithms/types';

const GanttChart3D = dynamic(
  () => import('./GanttChart3D').then(mod => ({ default: mod.GanttChart3D })),
  { ssr: false, loading: () => <div className="w-full h-[350px] rounded-xl bg-[#0a0a15] flex items-center justify-center text-[var(--text-muted)]">Loading 3D...</div> }
);

interface GanttChartProps {
  ganttChart: GanttBlock[];
  steps: ExecutionStep[];
  processes: Process[];
  isPlaying: boolean;
  speed: number;
  onStepChange: (stepIndex: number) => void;
  currentStep: number;
}

export function GanttChart({ 
  ganttChart, 
  steps, 
  processes,
  isPlaying, 
  speed, 
  onStepChange,
  currentStep 
}: GanttChartProps) {
  const [view, setView] = useState<'2d' | '3d'>('3d');

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onStepChange(currentStep + 1);
    }, 1500 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, speed, onStepChange]);

  const { animatedTime, currentProcessId } = useMemo(() => {
    if (currentStep < 0) {
      return { animatedTime: -1, currentProcessId: null };
    }

    const stepData = steps[currentStep];
    if (!stepData) return { animatedTime: -1, currentProcessId: null };

    let processId: string | null = null;
    if (stepData.action.includes('Execute')) {
      processId = stepData.processId;
    }

    return { animatedTime: stepData.time, currentProcessId: processId };
  }, [currentStep, steps]);

  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 0;

  const timeMarkers = [];
  for (let i = 0; i <= totalTime; i++) {
    timeMarkers.push(i);
  }

  return (
    <div className="glass-effect rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Execution Timeline
        </h3>
        
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-tertiary)]">
          <button
            onClick={() => setView('2d')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === '2d' 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setView('3d')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === '3d' 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            3D
          </button>
        </div>
      </div>
      
      {view === '3d' ? (
        <Suspense fallback={<div className="w-full h-[350px] rounded-xl bg-[#0a0a15] flex items-center justify-center text-[var(--text-muted)]">Loading 3D...</div>}>
          <GanttChart3D 
            ganttChart={ganttChart}
            processes={processes}
            animatedTime={animatedTime}
          />
          <p className="text-xs text-[var(--text-muted)] mt-2 text-center">Drag to rotate view</p>
        </Suspense>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max">
            {processes.map((process) => {
              const processBlocks = ganttChart.filter(b => b.processId === process.id);
              
              return (
                <div key={process.id} className="flex items-center mb-3 group">
                  <div className="w-16 flex-shrink-0 flex items-center gap-2 pr-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                      style={{ backgroundColor: process.color }}
                    />
                    <span 
                      className="font-mono font-semibold text-sm"
                      style={{ color: process.color }}
                    >
                      {process.id}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative h-10 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border-color) 39px, var(--border-color) 40px)`,
                      }}
                    />
                    
                    {processBlocks.map((block, bIndex) => {
                      const left = (block.startTime / totalTime) * 100;
                      const width = ((block.endTime - block.startTime) / totalTime) * 100;
                      const isActive = animatedTime >= block.startTime && animatedTime < block.endTime;
                      const isPast = animatedTime >= block.endTime;
                      const isCurrent = currentProcessId === process.id && isActive;
                      
                      return (
                        <div
                          key={bIndex}
                          className={`
                            absolute top-1 bottom-1 rounded-md flex items-center justify-center
                            transition-all duration-300 ease-out
                            ${(isPast || isActive) ? 'opacity-100' : 'opacity-20'}
                            ${isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-[var(--bg-tertiary)]' : ''}
                          `}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: process.color,
                            boxShadow: isCurrent ? `0 0 20px ${process.color}` : 'none',
                            transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          <span className="text-white text-xs font-bold drop-shadow-md">
                            {block.endTime - block.startTime}
                          </span>
                          {isCurrent && (
                            <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full animate-ping" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center mt-4">
              <div className="w-16 flex-shrink-0" />
              <div className="flex-1 relative h-6">
                <div className="absolute inset-x-0 top-0 h-px bg-[var(--border-color)]" />
                {timeMarkers.map(time => (
                  <div
                    key={time}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: `${(time / totalTime) * 100}%` }}
                  >
                    <div 
                      className={`w-px h-2 ${animatedTime >= time ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-color)]'}`}
                    />
                    <span 
                      className={`text-xs font-mono mt-1 transition-colors ${
                        animatedTime >= time ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                ))}
                
                {animatedTime >= 0 && (
                  <div
                    className="absolute top-0 w-0.5 h-full bg-[var(--accent-primary)] transition-all duration-300"
                    style={{ 
                      left: `${(animatedTime / totalTime) * 100}%`,
                      boxShadow: '0 0 10px var(--accent-primary)'
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--accent-primary)] rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
        {processes.map(process => (
          <div 
            key={process.id}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:scale-105"
            style={{ backgroundColor: `${process.color}15` }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: process.color }}
            />
            <div>
              <span className="font-mono font-semibold text-sm" style={{ color: process.color }}>
                {process.id}
              </span>
              <span className="text-xs text-[var(--text-muted)] ml-2">
                AT: {process.arrivalTime} | BT: {process.burstTime}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
