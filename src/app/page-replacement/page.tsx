'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronLeft,
  Zap,
  Activity,
  Settings,
  HardDrive,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Check,
  X,
  Clock,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { TheorySection } from '@/components/ui/theory-section';

interface Frame {
  id: number;
  page: number | null;
  loadTime: number;
  lastUsed: number;
  frequency: number;
  isHighlighted: boolean;
  isEvicting: boolean;
  isLoading: boolean;
}

interface PageRequest {
  page: number;
  status: 'pending' | 'hit' | 'fault' | 'current';
  frameIndex: number | null;
}

interface HistorySnapshot {
  frames: (number | null)[];
  isHit: boolean;
  page: number;
  evictedPage: number | null;
}

type Algorithm = 'fifo' | 'lru' | 'optimal' | 'lfu';

const ALGORITHM_INFO: Record<Algorithm, { name: string; description: string; color: string }> = {
  'fifo': { name: 'FIFO', description: 'First-In First-Out: Evicts the oldest page', color: '#3B82F6' },
  'lru': { name: 'LRU', description: 'Least Recently Used: Evicts least recently accessed', color: '#10B981' },
  'optimal': { name: 'Optimal', description: 'Theoretical best: Evicts page used farthest in future', color: '#F59E0B' },
  'lfu': { name: 'LFU', description: 'Least Frequently Used: Evicts least accessed page', color: '#EC4899' }
};

const DEFAULT_REFERENCE_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

export default function PageReplacementVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [frames, setFrames] = useState<Frame[]>([]);
  const [numFrames, setNumFrames] = useState(3);
  const [referenceString, setReferenceString] = useState<number[]>(DEFAULT_REFERENCE_STRING);
  const [referenceInput, setReferenceInput] = useState(DEFAULT_REFERENCE_STRING.join(', '));
  const [pageRequests, setPageRequests] = useState<PageRequest[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  
  const [algorithm, setAlgorithm] = useState<Algorithm>('fifo');
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [hits, setHits] = useState(0);
  const [faults, setFaults] = useState(0);
  const [time, setTime] = useState(0);
  
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<Record<Algorithm, { hits: number; faults: number }>>({
    fifo: { hits: 0, faults: 0 },
    lru: { hits: 0, faults: 0 },
    optimal: { hits: 0, faults: 0 },
    lfu: { hits: 0, faults: 0 }
  });

  const initializeSimulation = useCallback(() => {
    const newFrames: Frame[] = [];
    for (let i = 0; i < numFrames; i++) {
      newFrames.push({
        id: i,
        page: null,
        loadTime: -1,
        lastUsed: -1,
        frequency: 0,
        isHighlighted: false,
        isEvicting: false,
        isLoading: false
      });
    }
    setFrames(newFrames);

    const newRequests: PageRequest[] = referenceString.map(page => ({
      page,
      status: 'pending',
      frameIndex: null
    }));
    setPageRequests(newRequests);

    setCurrentIndex(-1);
    setHistory([]);
    setHits(0);
    setFaults(0);
    setTime(0);
    setIsComplete(false);
    setIsPlaying(false);
  }, [numFrames, referenceString]);

  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(700, rect.width),
          height: Math.max(500, rect.height)
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    container.addEventListener('wheel', preventScroll, { passive: false });
    return () => container.removeEventListener('wheel', preventScroll);
  }, []);

  const findVictim = useCallback((currentFrames: Frame[], futureRequests: number[]): number => {
    switch (algorithm) {
      case 'fifo': {
        let oldest = 0;
        let oldestTime = Infinity;
        currentFrames.forEach((frame, idx) => {
          if (frame.page !== null && frame.loadTime < oldestTime) {
            oldestTime = frame.loadTime;
            oldest = idx;
          }
        });
        return oldest;
      }
      
      case 'lru': {
        let lru = 0;
        let lruTime = Infinity;
        currentFrames.forEach((frame, idx) => {
          if (frame.page !== null && frame.lastUsed < lruTime) {
            lruTime = frame.lastUsed;
            lru = idx;
          }
        });
        return lru;
      }
      
      case 'optimal': {
        let victim = 0;
        let farthest = -1;
        
        currentFrames.forEach((frame, idx) => {
          if (frame.page === null) return;
          
          const nextUse = futureRequests.indexOf(frame.page);
          if (nextUse === -1) {
            victim = idx;
            farthest = Infinity;
          } else if (nextUse > farthest) {
            farthest = nextUse;
            victim = idx;
          }
        });
        return victim;
      }
      
      case 'lfu': {
        let lfu = 0;
        let minFreq = Infinity;
        let oldestTime = Infinity;
        
        currentFrames.forEach((frame, idx) => {
          if (frame.page !== null) {
            if (frame.frequency < minFreq || 
                (frame.frequency === minFreq && frame.loadTime < oldestTime)) {
              minFreq = frame.frequency;
              oldestTime = frame.loadTime;
              lfu = idx;
            }
          }
        });
        return lfu;
      }
      
      default:
        return 0;
    }
  }, [algorithm]);

  const runStep = useCallback(() => {
    if (currentIndex >= referenceString.length - 1) {
      setIsComplete(true);
      setIsPlaying(false);
      return;
    }

    const nextIndex = currentIndex + 1;
    const requestedPage = referenceString[nextIndex];
    const newTime = time + 1;

    setTime(newTime);
    setCurrentIndex(nextIndex);

    setPageRequests(prev => prev.map((req, idx) => ({
      ...req,
      status: idx === nextIndex ? 'current' : idx < nextIndex ? req.status : 'pending'
    })));

    setFrames(prev => {
      const newFrames = prev.map(f => ({ ...f, isHighlighted: false, isEvicting: false, isLoading: false }));
      
      const hitIndex = newFrames.findIndex(f => f.page === requestedPage);
      
      if (hitIndex !== -1) {
        newFrames[hitIndex].isHighlighted = true;
        newFrames[hitIndex].lastUsed = newTime;
        newFrames[hitIndex].frequency++;
        
        setHits(h => h + 1);
        setPageRequests(p => p.map((req, idx) => 
          idx === nextIndex ? { ...req, status: 'hit', frameIndex: hitIndex } : req
        ));
        
        setHistory(h => [...h, {
          frames: newFrames.map(f => f.page),
          isHit: true,
          page: requestedPage,
          evictedPage: null
        }]);
        
        return newFrames;
      }

      const emptyIndex = newFrames.findIndex(f => f.page === null);
      
      if (emptyIndex !== -1) {
        newFrames[emptyIndex].page = requestedPage;
        newFrames[emptyIndex].loadTime = newTime;
        newFrames[emptyIndex].lastUsed = newTime;
        newFrames[emptyIndex].frequency = 1;
        newFrames[emptyIndex].isLoading = true;
        
        setFaults(f => f + 1);
        setPageRequests(p => p.map((req, idx) => 
          idx === nextIndex ? { ...req, status: 'fault', frameIndex: emptyIndex } : req
        ));
        
        setHistory(h => [...h, {
          frames: newFrames.map(f => f.page),
          isHit: false,
          page: requestedPage,
          evictedPage: null
        }]);
        
        return newFrames;
      }

      const futureRequests = referenceString.slice(nextIndex + 1);
      const victimIndex = findVictim(newFrames, futureRequests);
      const evictedPage = newFrames[victimIndex].page;
      
      newFrames[victimIndex].isEvicting = true;
      
      setTimeout(() => {
        setFrames(f => f.map((frame, idx) => {
          if (idx === victimIndex) {
            return {
              ...frame,
              page: requestedPage,
              loadTime: newTime,
              lastUsed: newTime,
              frequency: 1,
              isEvicting: false,
              isLoading: true
            };
          }
          return frame;
        }));
      }, 300 / speed);
      
      setFaults(f => f + 1);
      setPageRequests(p => p.map((req, idx) => 
        idx === nextIndex ? { ...req, status: 'fault', frameIndex: victimIndex } : req
      ));
      
      setHistory(h => [...h, {
        frames: newFrames.map((f, idx) => idx === victimIndex ? requestedPage : f.page),
        isHit: false,
        page: requestedPage,
        evictedPage
      }]);
      
      return newFrames;
    });
  }, [currentIndex, referenceString, time, findVictim, speed]);

  useEffect(() => {
    if (!isPlaying || isComplete) return;
    
    const interval = setInterval(runStep, 1200 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, isComplete, runStep, speed]);

  const runComparison = useCallback(() => {
    const algorithms: Algorithm[] = ['fifo', 'lru', 'optimal', 'lfu'];
    const results: Record<Algorithm, { hits: number; faults: number }> = {
      fifo: { hits: 0, faults: 0 },
      lru: { hits: 0, faults: 0 },
      optimal: { hits: 0, faults: 0 },
      lfu: { hits: 0, faults: 0 }
    };

    algorithms.forEach(algo => {
      const simFrames: Frame[] = Array(numFrames).fill(null).map((_, i) => ({
        id: i, page: null, loadTime: -1, lastUsed: -1, frequency: 0,
        isHighlighted: false, isEvicting: false, isLoading: false
      }));
      
      let simTime = 0;
      let simHits = 0;
      let simFaults = 0;

      referenceString.forEach((page, idx) => {
        simTime++;
        const hitIdx = simFrames.findIndex(f => f.page === page);
        
        if (hitIdx !== -1) {
          simHits++;
          simFrames[hitIdx].lastUsed = simTime;
          simFrames[hitIdx].frequency++;
        } else {
          simFaults++;
          const emptyIdx = simFrames.findIndex(f => f.page === null);
          
          if (emptyIdx !== -1) {
            simFrames[emptyIdx] = { ...simFrames[emptyIdx], page, loadTime: simTime, lastUsed: simTime, frequency: 1 };
          } else {
            let victimIdx = 0;
            const future = referenceString.slice(idx + 1);
            
            switch (algo) {
              case 'fifo':
                victimIdx = simFrames.reduce((min, f, i) => f.loadTime < simFrames[min].loadTime ? i : min, 0);
                break;
              case 'lru':
                victimIdx = simFrames.reduce((min, f, i) => f.lastUsed < simFrames[min].lastUsed ? i : min, 0);
                break;
              case 'optimal':
                let farthest = -1;
                simFrames.forEach((f, i) => {
                  const next = future.indexOf(f.page!);
                  if (next === -1 || next > farthest) { farthest = next === -1 ? Infinity : next; victimIdx = i; }
                });
                break;
              case 'lfu':
                victimIdx = simFrames.reduce((min, f, i) => {
                  if (f.frequency < simFrames[min].frequency) return i;
                  if (f.frequency === simFrames[min].frequency && f.loadTime < simFrames[min].loadTime) return i;
                  return min;
                }, 0);
                break;
            }
            
            simFrames[victimIdx] = { ...simFrames[victimIdx], page, loadTime: simTime, lastUsed: simTime, frequency: 1 };
          }
        }
      });

      results[algo] = { hits: simHits, faults: simFaults };
    });

    setComparisonResults(results);
    setShowComparison(true);
  }, [numFrames, referenceString]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = '#0B0F14';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.save();
      ctx.translate(canvasSize.width / 2 + panOffset.x, canvasSize.height / 2 + panOffset.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvasSize.width / 2, -canvasSize.height / 2);

      // Page Reference Queue
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Page Reference String', 50, 40);

      const queueStartX = 50;
      const queueY = 70;
      const boxSize = 36;
      const visibleCount = Math.min(pageRequests.length, 18);
      const startIdx = Math.max(0, currentIndex - 5);

      pageRequests.slice(startIdx, startIdx + visibleCount).forEach((req, idx) => {
        const actualIdx = startIdx + idx;
        const x = queueStartX + idx * (boxSize + 4);
        
        let bgColor = 'rgba(255, 255, 255, 0.05)';
        let borderColor = 'rgba(255, 255, 255, 0.1)';
        let textColor = 'rgba(255, 255, 255, 0.5)';
        
        if (req.status === 'current') {
          bgColor = 'rgba(139, 92, 246, 0.3)';
          borderColor = '#8B5CF6';
          textColor = '#FFFFFF';
          ctx.shadowColor = '#8B5CF6';
          ctx.shadowBlur = 10;
        } else if (req.status === 'hit') {
          bgColor = 'rgba(16, 185, 129, 0.2)';
          borderColor = '#10B981';
          textColor = '#10B981';
        } else if (req.status === 'fault') {
          bgColor = 'rgba(239, 68, 68, 0.2)';
          borderColor = '#EF4444';
          textColor = '#EF4444';
        }
        
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, queueY, boxSize, boxSize, 6);
        ctx.fill();
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = req.status === 'current' ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(req.page), x + boxSize / 2, queueY + boxSize / 2);
      });

      // RAM Frames
      const ramX = 80;
      const ramY = 150;
      const frameWidth = 120;
      const frameHeight = 70;
      const frameGap = 20;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(ramX - 20, ramY - 30, frameWidth + 40, frames.length * (frameHeight + frameGap) + 40, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RAM FRAMES', ramX, ramY - 10);

      frames.forEach((frame, idx) => {
        const y = ramY + idx * (frameHeight + frameGap) + 20;
        
        let bgColor = 'rgba(255, 255, 255, 0.03)';
        let borderColor = 'rgba(255, 255, 255, 0.1)';
        
        if (frame.isLoading) {
          bgColor = 'rgba(16, 185, 129, 0.2)';
          borderColor = '#10B981';
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 15;
        } else if (frame.isEvicting) {
          bgColor = 'rgba(239, 68, 68, 0.2)';
          borderColor = '#EF4444';
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 15;
        } else if (frame.isHighlighted) {
          bgColor = 'rgba(16, 185, 129, 0.15)';
          borderColor = '#10B981';
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 10;
        }
        
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(ramX, y, frameWidth, frameHeight, 8);
        ctx.fill();
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = frame.isHighlighted || frame.isLoading || frame.isEvicting ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Frame ${idx}`, ramX + 8, y + 16);

        if (frame.page !== null) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(String(frame.page), ramX + frameWidth / 2, y + 45);

          if (algorithm === 'lfu') {
            ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`freq: ${frame.frequency}`, ramX + frameWidth - 8, y + 16);
          }
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Empty', ramX + frameWidth / 2, y + 45);
        }
      });

      // Disk
      const diskX = ramX + frameWidth + 100;
      const diskY = ramY;

      ctx.fillStyle = 'rgba(107, 114, 128, 0.05)';
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(diskX, diskY - 30, 160, 200, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DISK (Secondary)', diskX + 15, diskY - 10);

      const uniquePages = [...new Set(referenceString)].sort((a, b) => a - b);
      uniquePages.forEach((page, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        const x = diskX + 20 + col * 35;
        const y = diskY + 20 + row * 35;

        const inMemory = frames.some(f => f.page === page);
        
        ctx.fillStyle = inMemory ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(x, y, 30, 30, 4);
        ctx.fill();
        ctx.strokeStyle = inMemory ? '#10B981' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = inMemory ? '#10B981' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(page), x + 15, y + 15);
      });

      // History Timeline
      const historyX = diskX + 200;
      const historyY = 40;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Memory State History', historyX, historyY);

      const visibleHistory = history.slice(-8);
      visibleHistory.forEach((snapshot, idx) => {
        const y = historyY + 20 + idx * 45;
        
        ctx.fillStyle = snapshot.isHit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        ctx.beginPath();
        ctx.roundRect(historyX, y, 180, 38, 6);
        ctx.fill();
        ctx.strokeStyle = snapshot.isHit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = snapshot.isHit ? '#10B981' : '#EF4444';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Page ${snapshot.page}: ${snapshot.isHit ? 'HIT' : 'FAULT'}`, historyX + 8, y + 12);

        snapshot.frames.forEach((page, fIdx) => {
          const fx = historyX + 8 + fIdx * 28;
          const fy = y + 18;
          
          ctx.fillStyle = page !== null ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)';
          ctx.beginPath();
          ctx.roundRect(fx, fy, 24, 16, 3);
          ctx.fill();
          
          ctx.fillStyle = page !== null ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(page !== null ? String(page) : '-', fx + 12, fy + 11);
        });
      });

      // Algorithm Info
      const algoInfo = ALGORITHM_INFO[algorithm];
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(ramX, ramY + frames.length * (frameHeight + frameGap) + 40, 300, 60, 8);
      ctx.fill();
      ctx.strokeStyle = algoInfo.color + '40';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = algoInfo.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(algoInfo.name, ramX + 15, ramY + frames.length * (frameHeight + frameGap) + 65);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px sans-serif';
      ctx.fillText(algoInfo.description, ramX + 15, ramY + frames.length * (frameHeight + frameGap) + 85);

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frames, pageRequests, history, canvasSize, zoom, panOffset, algorithm, currentIndex, referenceString]);

  const handleReset = () => {
    initializeSimulation();
  };

  const handleReferenceChange = () => {
    const parsed = referenceInput.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setReferenceString(parsed);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(3, Math.max(0.5, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const totalRequests = referenceString.length;
  const hitRatio = totalRequests > 0 && (hits + faults) > 0 ? ((hits / (hits + faults)) * 100).toFixed(1) : '0.0';
  const faultRatio = totalRequests > 0 && (hits + faults) > 0 ? ((faults / (hits + faults)) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.08),transparent_50%)]" />
      
      <div className="relative z-10 p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Link 
              href="/modules"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Page Replacement</h1>
              <p className="text-neutral-400 text-sm mt-1">Virtual Memory Algorithms</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: ALGORITHM_INFO[algorithm].color + '20', borderColor: ALGORITHM_INFO[algorithm].color + '50', borderWidth: 1 }}>
              <Layers size={14} style={{ color: ALGORITHM_INFO[algorithm].color }} />
              <span className="text-xs" style={{ color: ALGORITHM_INFO[algorithm].color }}>{ALGORITHM_INFO[algorithm].name}</span>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <TheorySection title="Theory: Page Replacement" defaultOpen={false}>
            <p><strong>Page replacement</strong> is used when a page fault occurs and no free frame is available. The OS must choose a victim page to evict from memory.</p>
            <p><strong>FIFO:</strong> Evicts the page that has been in memory longest. Simple but can cause Belady&apos;s anomaly (more frames can mean more faults).</p>
            <p><strong>LRU (Least Recently Used):</strong> Evicts the page that has not been used for the longest time. Good practical performance; requires hardware support or approximation.</p>
            <p><strong>Optimal:</strong> Evicts the page that will be used farthest in the future. Theoretically best but not implementable (requires future knowledge); used as a benchmark.</p>
            <p><strong>LFU (Least Frequently Used):</strong> Evicts the page with the smallest reference count. Can favor recently brought-in pages that are used repeatedly.</p>
          </TheorySection>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '520px' }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <button onClick={() => setZoom(prev => Math.min(3, prev * 1.2))} className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors">
                  <ZoomIn size={14} />
                </button>
                <button onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))} className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors">
                  <ZoomOut size={14} />
                </button>
                <button onClick={resetView} className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors">
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <span className="text-xs text-neutral-400">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <Move size={14} className="text-amber-400" />
                <span className="text-xs text-neutral-300">Drag to pan</span>
              </div>
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <div className="px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <Check size={18} className="text-green-400" />
                    <span className="text-sm text-green-400">Simulation complete! Hit Ratio: {hitRatio}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-4"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-amber-400" />
                Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Algorithm</label>
                  <select
                    value={algorithm}
                    onChange={(e) => { setAlgorithm(e.target.value as Algorithm); handleReset(); }}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="fifo">FIFO (First-In First-Out)</option>
                    <option value="lru">LRU (Least Recently Used)</option>
                    <option value="optimal">Optimal (OPT)</option>
                    <option value="lfu">LFU (Least Frequently Used)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Number of Frames</span>
                    <span className="text-white font-mono">{numFrames}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={5}
                    value={numFrames}
                    onChange={(e) => { setNumFrames(Number(e.target.value)); }}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Reference String</label>
                  <input
                    type="text"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    onBlur={handleReferenceChange}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono focus:outline-none focus:border-amber-500/50"
                    placeholder="7, 0, 1, 2, 0, 3..."
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Speed</span>
                    <span className="text-white font-mono">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isComplete}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    isComplete
                      ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <button
                  onClick={runStep}
                  disabled={isPlaying || isComplete}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Step"
                >
                  <SkipForward size={16} />
                </button>
                
                <button
                  onClick={handleReset}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-pink-400" />
                Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Page Requests</div>
                  <div className="text-xl font-bold font-mono text-blue-400">{currentIndex + 1}/{totalRequests}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Hits</div>
                  <div className="text-xl font-bold font-mono text-green-400">{hits}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Faults</div>
                  <div className="text-xl font-bold font-mono text-red-400">{faults}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Hit Ratio</div>
                  <div className="text-xl font-bold font-mono text-amber-400">{hitRatio}%</div>
                </div>
              </div>

              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${hitRatio}%` }} />
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${faultRatio}%` }} />
              </div>
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Hits: {hitRatio}%</span>
                <span>Faults: {faultRatio}%</span>
              </div>
            </div>

            <button
              onClick={runComparison}
              className="w-full p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <BarChart3 size={16} />
              Compare All Algorithms
            </button>

            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                      <BarChart3 size={16} className="text-purple-400" />
                      Comparison
                    </h3>
                    <button onClick={() => setShowComparison(false)} className="text-neutral-500 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(Object.keys(comparisonResults) as Algorithm[]).map(algo => {
                      const result = comparisonResults[algo];
                      const ratio = totalRequests > 0 ? (result.faults / totalRequests) * 100 : 0;
                      return (
                        <div key={algo} className="flex items-center gap-2">
                          <span className="text-xs w-16" style={{ color: ALGORITHM_INFO[algo].color }}>{ALGORITHM_INFO[algo].name}</span>
                          <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${ratio}%`,
                                backgroundColor: ALGORITHM_INFO[algo].color
                              }}
                            />
                          </div>
                          <span className="text-xs text-neutral-400 w-12 text-right">{result.faults} faults</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Page replacement algorithms decide which memory page to evict when a fault occurs. 
                Different algorithms optimize for different access patterns.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">Hit</span>
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">Fault</span>
                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Evict</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
