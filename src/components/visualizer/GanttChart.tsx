"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
  algorithm?: string;
}

export function GanttChart({ 
  ganttChart, 
  steps, 
  processes,
  isPlaying, 
  speed, 
  onStepChange,
  currentStep,
  algorithm = 'CPU Scheduling'
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
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Execution Timeline
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg bg-black/20">
              <button
                onClick={() => setView('2d')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  view === '2d' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setView('3d')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  view === '3d' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                3D
              </button>
            </div>
            
            {view === '3d' && (
              <Link
                href={`/cpu-scheduling/3d-view?data=${encodeURIComponent(JSON.stringify({ ganttChart, processes, algorithm }))}`}
                className="p-1.5 sm:p-2 rounded-lg bg-black/20 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                title="Open fullscreen 3D view"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      
        {view === '3d' ? (
          <Suspense fallback={<div className="w-full h-[250px] sm:h-[350px] rounded-xl bg-black/40 flex items-center justify-center text-white/40">Loading 3D...</div>}>
            <GanttChart3D 
              ganttChart={ganttChart}
              processes={processes}
              animatedTime={animatedTime}
            />
            <p className="text-[10px] sm:text-xs text-white/40 mt-2 text-center">Drag to rotate view</p>
          </Suspense>
        ) : (
          <div className="overflow-x-auto pb-4 -mx-2 sm:mx-0 px-2 sm:px-0">
            <div className="min-w-[300px]">
              {processes.map((process) => {
                const processBlocks = ganttChart.filter(b => b.processId === process.id);
                
                return (
                  <div key={process.id} className="flex items-center mb-2 sm:mb-3 group">
                    <div className="w-12 sm:w-16 flex-shrink-0 flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3">
                      <div 
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                        style={{ backgroundColor: process.color }}
                      />
                      <span 
                        className="font-mono font-semibold text-xs sm:text-sm"
                        style={{ color: process.color }}
                      >
                        {process.id}
                      </span>
                    </div>
                    
                    <div className="flex-1 relative h-8 sm:h-10 bg-black/20 rounded-lg overflow-hidden border border-white/5">
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.1) 39px, rgba(255,255,255,0.1) 40px)`,
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
                              ${isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-black/20' : ''}
                            `}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: process.color,
                              boxShadow: isCurrent ? `0 0 20px ${process.color}` : 'none',
                              transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-md">
                              {block.endTime - block.startTime}
                            </span>
                            {isCurrent && (
                              <div className="absolute -right-1 -top-1 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-ping" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center mt-3 sm:mt-4">
                <div className="w-12 sm:w-16 flex-shrink-0" />
                <div className="flex-1 relative h-5 sm:h-6">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
                  {timeMarkers.map(time => (
                    <div
                      key={time}
                      className="absolute top-0 flex flex-col items-center"
                      style={{ left: `${(time / totalTime) * 100}%` }}
                    >
                      <div 
                        className={`w-px h-1.5 sm:h-2 ${animatedTime >= time ? 'bg-blue-400' : 'bg-white/10'}`}
                      />
                      <span 
                        className={`text-[10px] sm:text-xs font-mono mt-0.5 sm:mt-1 transition-colors ${
                          animatedTime >= time ? 'text-blue-400' : 'text-white/40'
                        }`}
                      >
                        {time}
                      </span>
                    </div>
                  ))}
                  
                  {animatedTime >= 0 && (
                    <div
                      className="absolute top-0 w-0.5 h-full bg-blue-400 transition-all duration-300"
                      style={{ 
                        left: `${(animatedTime / totalTime) * 100}%`,
                        boxShadow: '0 0 10px #60a5fa'
                      }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
          {processes.map(process => (
            <div 
              key={process.id}
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all hover:scale-105 border border-white/5"
              style={{ backgroundColor: `${process.color}15` }}
            >
              <div 
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                style={{ backgroundColor: process.color }}
              />
              <div>
                <span className="font-mono font-semibold text-xs sm:text-sm" style={{ color: process.color }}>
                  {process.id}
                </span>
                <span className="text-[10px] sm:text-xs text-white/60 ml-1 sm:ml-2">
                  AT: {process.arrivalTime} | BT: {process.burstTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}
