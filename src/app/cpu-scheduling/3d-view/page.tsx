"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GanttBlock, Process } from '@/lib/algorithms/types';

const GanttChart3DFullscreen = dynamic(
  () => import('@/components/visualizer/GanttChart3DFullscreen').then(mod => ({ default: mod.GanttChart3DFullscreen })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0a0a15] flex items-center justify-center text-gray-500">Loading 3D...</div> }
);

function ThreeDViewContent() {
  const searchParams = useSearchParams();
  const [animatedTime, setAnimatedTime] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const data = useMemo(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        return JSON.parse(decodeURIComponent(dataParam)) as { ganttChart: GanttBlock[]; processes: Process[] };
      } catch (e) {
        console.error('Failed to parse data', e);
        return null;
      }
    }
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (!isPlaying || !data) return;
    
    const totalTime = data.ganttChart.length > 0 ? data.ganttChart[data.ganttChart.length - 1].endTime : 0;
    
    const interval = setInterval(() => {
      setAnimatedTime(prev => {
        if (prev >= totalTime) {
          setIsPlaying(false);
          return totalTime;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, data]);

  const totalTime = data?.ganttChart.length ? data.ganttChart[data.ganttChart.length - 1].endTime : 0;

  const handlePlay = () => {
    if (animatedTime >= totalTime) {
      setAnimatedTime(-1);
    }
    setIsPlaying(true);
  };

  const handleReset = () => {
    setAnimatedTime(-1);
    setIsPlaying(false);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a15] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4 text-sm sm:text-base">No visualization data found</p>
          <Link href="/cpu-scheduling" className="text-cyan-400 hover:underline text-sm sm:text-base">
            Go back to CPU Scheduling
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a15] flex flex-col overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 p-2 sm:p-4 flex items-center justify-between gap-2">
        <Link 
          href="/cpu-scheduling"
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white transition-all"
              title="Reset"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              onClick={() => isPlaying ? setIsPlaying(false) : handlePlay()}
              className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-all flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </button>
          </div>
          
          <div className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white font-mono text-xs sm:text-base">
            <span className="hidden sm:inline">Time: </span>{Math.max(0, animatedTime)} / {totalTime}
          </div>
        </div>
      </header>
      
      <div className="absolute inset-0">
        <GanttChart3DFullscreen 
          ganttChart={data.ganttChart}
          processes={data.processes}
          animatedTime={animatedTime}
        />
      </div>
      
      <footer className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
          {data.processes.map(process => (
            <div 
              key={process.id}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-sm"
            >
              <div 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: process.color }}
              />
              <span className="text-white text-xs sm:text-sm font-medium">{process.id}</span>
              <span className="text-gray-400 text-[10px] sm:text-xs">BT: {process.burstTime}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-1.5 sm:mt-2">Drag to rotate • Scroll to zoom</p>
      </footer>
    </div>
  );
}

export default function ThreeDViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a15] flex items-center justify-center text-gray-500">Loading...</div>}>
      <ThreeDViewContent />
    </Suspense>
  );
}
