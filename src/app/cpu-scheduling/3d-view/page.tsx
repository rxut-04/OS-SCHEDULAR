"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { GanttBlock, Process } from '@/lib/algorithms/types';

const GanttChart3DWithCharacter = dynamic(
  () => import('@/components/visualizer/GanttChart3DWithCharacter').then(mod => ({ default: mod.GanttChart3DWithCharacter })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0a0a15] flex items-center justify-center text-gray-500">Loading 3D...</div> }
);

function ThreeDViewContent() {
  const searchParams = useSearchParams();
  const [isExplaining, setIsExplaining] = useState(false);
  const [showAllBlocks, setShowAllBlocks] = useState(false);

  const data = useMemo(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        return JSON.parse(decodeURIComponent(dataParam)) as { 
          ganttChart: GanttBlock[]; 
          processes: Process[];
          algorithm?: string;
        };
      } catch (e) {
        console.error('Failed to parse data', e);
        return null;
      }
    }
    return null;
  }, [searchParams]);

  const algorithm = data?.algorithm || searchParams.get('algorithm') || 'CPU Scheduling';

  const handleStartExplanation = () => {
    setShowAllBlocks(false);
    setIsExplaining(true);
  };

  const handleStopExplanation = () => {
    setIsExplaining(false);
    setShowAllBlocks(true);
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
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/cpu-scheduling"
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          
          <div className="hidden sm:flex items-center gap-2">
            <Image
              src="/assets/logos/logo2.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-white font-semibold">{algorithm}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            {!isExplaining ? (
              <button
                onClick={handleStartExplanation}
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-400 hover:to-purple-400 transition-all flex items-center gap-2 text-sm sm:text-base shadow-lg"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Start Guide</span>
                <span className="sm:hidden">Guide</span>
              </button>
            ) : (
              <button
                onClick={handleStopExplanation}
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-red-500/80 text-white font-medium hover:bg-red-500 transition-all flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span className="hidden sm:inline">Stop Guide</span>
                <span className="sm:hidden">Stop</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      {isExplaining && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30">
          <p className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
            AI Guide is explaining the algorithm...
          </p>
        </div>
      )}
      
      <div className="absolute inset-0">
        <GanttChart3DWithCharacter 
          ganttChart={data.ganttChart}
          processes={data.processes}
          algorithm={algorithm}
          isExplaining={isExplaining}
          showAllBlocks={showAllBlocks}
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
          <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-1.5 sm:mt-2">
              Left-drag: Rotate • Right-drag: Pan • Scroll: Zoom • Touch: Pinch to zoom, drag to rotate
            </p>
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
