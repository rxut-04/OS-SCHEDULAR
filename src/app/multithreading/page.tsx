'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  Zap,
  Activity,
  Settings,
  Plus,
  Trash2,
  Cpu,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Ban,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface UserThread {
  id: string;
  color: string;
  state: 'ready' | 'running' | 'blocked' | 'terminated';
  mappedKernelThread: string | null;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

interface KernelThread {
  id: string;
  color: string;
  state: 'idle' | 'running' | 'blocked';
  assignedCore: number | null;
  mappedUserThreads: string[];
  x: number;
  y: number;
}

interface CpuCore {
  id: number;
  state: 'idle' | 'busy';
  currentThread: string | null;
  utilization: number;
}

type ThreadingModel = 'ult' | 'klt' | 'many-to-one' | 'one-to-one' | 'many-to-many';

const THREAD_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EF4444', '#84CC16', '#F97316', '#6366F1'
];

const MODEL_INFO: Record<ThreadingModel, { name: string; description: string; color: string }> = {
  'ult': { name: 'User-Level Threads', description: 'Threads managed by user library, kernel unaware', color: '#3B82F6' },
  'klt': { name: 'Kernel-Level Threads', description: 'Threads managed by OS kernel directly', color: '#10B981' },
  'many-to-one': { name: 'Many-to-One', description: 'Many user threads → one kernel thread', color: '#F59E0B' },
  'one-to-one': { name: 'One-to-One', description: 'Each user thread → one kernel thread', color: '#EC4899' },
  'many-to-many': { name: 'Many-to-Many', description: 'Many user threads → fewer kernel threads', color: '#8B5CF6' }
};

export default function MultithreadingVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [userThreads, setUserThreads] = useState<UserThread[]>([]);
  const [kernelThreads, setKernelThreads] = useState<KernelThread[]>([]);
  const [cpuCores, setCpuCores] = useState<CpuCore[]>([
    { id: 0, state: 'idle', currentThread: null, utilization: 0 },
    { id: 1, state: 'idle', currentThread: null, utilization: 0 },
    { id: 2, state: 'idle', currentThread: null, utilization: 0 },
    { id: 3, state: 'idle', currentThread: null, utilization: 0 }
  ]);
  
  const [model, setModel] = useState<ThreadingModel>('many-to-many');
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [contextSwitches, setContextSwitches] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 650 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const getKernelThreadCount = useCallback((userCount: number): number => {
    switch (model) {
      case 'ult':
      case 'many-to-one':
        return 1;
      case 'klt':
      case 'one-to-one':
        return userCount;
      case 'many-to-many':
        return Math.max(1, Math.min(userCount, Math.ceil(userCount / 2)));
      default:
        return 1;
    }
  }, [model]);

  const initializeThreads = useCallback(() => {
    const initialUserThreads: UserThread[] = [];
    for (let i = 0; i < 4; i++) {
      initialUserThreads.push({
        id: `UT${i + 1}`,
        color: THREAD_COLORS[i % THREAD_COLORS.length],
        state: 'ready',
        mappedKernelThread: null,
        x: 100 + (i % 4) * 60,
        y: 120,
        targetX: 100 + (i % 4) * 60,
        targetY: 120
      });
    }
    setUserThreads(initialUserThreads);

    const kernelCount = getKernelThreadCount(4);
    const initialKernelThreads: KernelThread[] = [];
    for (let i = 0; i < kernelCount; i++) {
      initialKernelThreads.push({
        id: `KT${i + 1}`,
        color: '#6B7280',
        state: 'idle',
        assignedCore: null,
        mappedUserThreads: [],
        x: 150 + i * 80,
        y: 320
      });
    }
    setKernelThreads(initialKernelThreads);

    setCpuCores([
      { id: 0, state: 'idle', currentThread: null, utilization: 0 },
      { id: 1, state: 'idle', currentThread: null, utilization: 0 },
      { id: 2, state: 'idle', currentThread: null, utilization: 0 },
      { id: 3, state: 'idle', currentThread: null, utilization: 0 }
    ]);
    
    setContextSwitches(0);
    setBlockedCount(0);
  }, [getKernelThreadCount]);

  useEffect(() => {
    initializeThreads();
  }, [model, initializeThreads]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(700, rect.width),
          height: Math.max(550, rect.height)
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

  const mapThreads = useCallback(() => {
    if (userThreads.length === 0 || kernelThreads.length === 0) return;

    const newKernelThreads = kernelThreads.map(kt => ({ ...kt, mappedUserThreads: [] as string[] }));
    const newUserThreads = [...userThreads];

    const readyThreads = newUserThreads.filter(ut => ut.state === 'ready' || ut.state === 'running');

    switch (model) {
      case 'ult':
      case 'many-to-one':
        readyThreads.forEach(ut => {
          ut.mappedKernelThread = newKernelThreads[0]?.id || null;
          if (newKernelThreads[0]) {
            newKernelThreads[0].mappedUserThreads.push(ut.id);
          }
        });
        break;

      case 'klt':
      case 'one-to-one':
        readyThreads.forEach((ut, idx) => {
          if (newKernelThreads[idx]) {
            ut.mappedKernelThread = newKernelThreads[idx].id;
            newKernelThreads[idx].mappedUserThreads.push(ut.id);
          }
        });
        break;

      case 'many-to-many':
        readyThreads.forEach((ut, idx) => {
          const ktIdx = idx % newKernelThreads.length;
          ut.mappedKernelThread = newKernelThreads[ktIdx].id;
          newKernelThreads[ktIdx].mappedUserThreads.push(ut.id);
        });
        break;
    }

    setUserThreads(newUserThreads);
    setKernelThreads(newKernelThreads);
  }, [userThreads, kernelThreads, model]);

  const scheduleOnCores = useCallback(() => {
    const newKernelThreads = [...kernelThreads];
    const newCores = [...cpuCores];
    let switches = 0;

    newKernelThreads.forEach(kt => {
      if (kt.mappedUserThreads.length > 0 && kt.state !== 'blocked') {
        const idleCore = newCores.find(c => c.state === 'idle');
        if (idleCore && kt.assignedCore === null) {
          kt.assignedCore = idleCore.id;
          kt.state = 'running';
          idleCore.state = 'busy';
          idleCore.currentThread = kt.id;
          idleCore.utilization = Math.min(100, idleCore.utilization + 25);
          switches++;
        }
      }
    });

    setKernelThreads(newKernelThreads);
    setCpuCores(newCores);
    setContextSwitches(prev => prev + switches);

    const newUserThreads = userThreads.map(ut => {
      const kt = newKernelThreads.find(k => k.id === ut.mappedKernelThread);
      if (kt && kt.state === 'running' && ut.state === 'ready') {
        return { ...ut, state: 'running' as const };
      }
      return ut;
    });
    setUserThreads(newUserThreads);
  }, [kernelThreads, cpuCores, userThreads]);

  const runStep = useCallback(() => {
    mapThreads();
    setTimeout(() => {
      scheduleOnCores();
    }, 300 / speed);
  }, [mapThreads, scheduleOnCores, speed]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(runStep, 1500 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, runStep, speed]);

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

      // User Space
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 40, canvasSize.width - 80, 180, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('USER SPACE', 60, 70);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px sans-serif';
      ctx.fillText('Process Container', 60, 90);

      // User Threads
      userThreads.forEach((thread, idx) => {
        const x = 100 + idx * 70;
        const y = 140;
        
        const isRunning = thread.state === 'running';
        const isBlocked = thread.state === 'blocked';
        
        if (isRunning) {
          ctx.shadowColor = thread.color;
          ctx.shadowBlur = 15;
        }
        
        ctx.fillStyle = isBlocked ? 'rgba(239, 68, 68, 0.6)' : thread.color + (isRunning ? 'FF' : '99');
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = isRunning ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isRunning ? 3 : 1;
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(thread.id, x, y);
        
        ctx.fillStyle = isBlocked ? '#EF4444' : isRunning ? '#10B981' : '#9CA3AF';
        ctx.font = '8px sans-serif';
        ctx.fillText(thread.state, x, y + 35);
      });

      // Kernel Space
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 250, canvasSize.width - 80, 140, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('KERNEL SPACE', 60, 280);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px sans-serif';
      ctx.fillText('Thread Scheduler', 60, 300);

      // Kernel Threads
      kernelThreads.forEach((kt, idx) => {
        const x = 150 + idx * 100;
        const y = 340;
        
        const isRunning = kt.state === 'running';
        const isBlocked = kt.state === 'blocked';
        const hasThreads = kt.mappedUserThreads.length > 0;
        
        if (isRunning) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 12;
        }
        
        ctx.fillStyle = isBlocked ? 'rgba(239, 68, 68, 0.6)' : isRunning ? 'rgba(16, 185, 129, 0.8)' : 'rgba(107, 114, 128, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x - 30, y - 20, 60, 40, 8);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = isRunning ? '#10B981' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isRunning ? 2 : 1;
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(kt.id, x, y);
        
        if (hasThreads) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '8px sans-serif';
          ctx.fillText(`(${kt.mappedUserThreads.length})`, x, y + 28);
        }
      });

      // Mapping Lines
      userThreads.forEach((ut, idx) => {
        if (ut.mappedKernelThread) {
          const ktIdx = kernelThreads.findIndex(kt => kt.id === ut.mappedKernelThread);
          if (ktIdx !== -1) {
            const utX = 100 + idx * 70;
            const utY = 162;
            const ktX = 150 + ktIdx * 100;
            const ktY = 320;
            
            const gradient = ctx.createLinearGradient(utX, utY, ktX, ktY);
            gradient.addColorStop(0, ut.color + '80');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.5)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = ut.state === 'running' ? 2 : 1;
            ctx.setLineDash(ut.state === 'blocked' ? [5, 5] : []);
            
            ctx.beginPath();
            ctx.moveTo(utX, utY);
            ctx.bezierCurveTo(utX, utY + 60, ktX, ktY - 60, ktX, ktY);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });

      // CPU Cores
      ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 420, canvasSize.width - 80, 120, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CPU CORES', 60, 450);

      cpuCores.forEach((core, idx) => {
        const x = 120 + idx * 140;
        const y = 490;
        
        const isBusy = core.state === 'busy';
        
        if (isBusy) {
          ctx.shadowColor = '#8B5CF6';
          ctx.shadowBlur = 15;
        }
        
        ctx.fillStyle = isBusy ? 'rgba(139, 92, 246, 0.6)' : 'rgba(55, 65, 81, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x - 45, y - 25, 90, 50, 8);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = isBusy ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isBusy ? 2 : 1;
        ctx.stroke();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Core ${core.id}`, x, y - 5);
        
        if (core.currentThread) {
          ctx.fillStyle = '#10B981';
          ctx.font = '9px sans-serif';
          ctx.fillText(core.currentThread, x, y + 12);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = '9px sans-serif';
          ctx.fillText('idle', x, y + 12);
        }
      });

      // Core-KT Lines
      kernelThreads.forEach((kt, idx) => {
        if (kt.assignedCore !== null) {
          const ktX = 150 + idx * 100;
          const ktY = 360;
          const coreX = 120 + kt.assignedCore * 140;
          const coreY = 465;
          
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ktX, ktY);
          ctx.lineTo(coreX, coreY);
          ctx.stroke();
          
          // Arrow
          const angle = Math.atan2(coreY - ktY, coreX - ktX);
          ctx.beginPath();
          ctx.moveTo(coreX, coreY);
          ctx.lineTo(coreX - 10 * Math.cos(angle - 0.3), coreY - 10 * Math.sin(angle - 0.3));
          ctx.lineTo(coreX - 10 * Math.cos(angle + 0.3), coreY - 10 * Math.sin(angle + 0.3));
          ctx.closePath();
          ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
          ctx.fill();
        }
      });

      // Model Info
      const infoX = canvasSize.width - 220;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(infoX, 50, 180, 80, 8);
      ctx.fill();
      ctx.strokeStyle = MODEL_INFO[model].color + '40';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = MODEL_INFO[model].color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(MODEL_INFO[model].name, infoX + 12, 75);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px sans-serif';
      const words = MODEL_INFO[model].description.split(' ');
      let line = '';
      let lineY = 95;
      words.forEach(word => {
        if ((line + word).length > 22) {
          ctx.fillText(line, infoX + 12, lineY);
          line = word + ' ';
          lineY += 14;
        } else {
          line += word + ' ';
        }
      });
      ctx.fillText(line, infoX + 12, lineY);

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [userThreads, kernelThreads, cpuCores, canvasSize, zoom, panOffset, model]);

  const addThread = () => {
    const newId = `UT${userThreads.length + 1}`;
    const newThread: UserThread = {
      id: newId,
      color: THREAD_COLORS[userThreads.length % THREAD_COLORS.length],
      state: 'ready',
      mappedKernelThread: null,
      x: 100 + userThreads.length * 70,
      y: 140,
      targetX: 100 + userThreads.length * 70,
      targetY: 140
    };
    setUserThreads(prev => [...prev, newThread]);

    if (model === 'klt' || model === 'one-to-one') {
      const newKt: KernelThread = {
        id: `KT${kernelThreads.length + 1}`,
        color: '#6B7280',
        state: 'idle',
        assignedCore: null,
        mappedUserThreads: [],
        x: 150 + kernelThreads.length * 100,
        y: 340
      };
      setKernelThreads(prev => [...prev, newKt]);
    } else if (model === 'many-to-many' && userThreads.length >= kernelThreads.length * 2) {
      const newKt: KernelThread = {
        id: `KT${kernelThreads.length + 1}`,
        color: '#6B7280',
        state: 'idle',
        assignedCore: null,
        mappedUserThreads: [],
        x: 150 + kernelThreads.length * 100,
        y: 340
      };
      setKernelThreads(prev => [...prev, newKt]);
    }
  };

  const blockThread = () => {
    const readyThread = userThreads.find(t => t.state === 'ready' || t.state === 'running');
    if (!readyThread) return;

    setUserThreads(prev => prev.map(t => 
      t.id === readyThread.id ? { ...t, state: 'blocked' } : t
    ));
    setBlockedCount(prev => prev + 1);

    if (model === 'ult' || model === 'many-to-one') {
      setKernelThreads(prev => prev.map(kt => ({ ...kt, state: 'blocked' })));
      setCpuCores(prev => prev.map(c => ({ ...c, state: 'idle', currentThread: null })));
    }
  };

  const unblockThread = () => {
    const blockedThread = userThreads.find(t => t.state === 'blocked');
    if (!blockedThread) return;

    setUserThreads(prev => prev.map(t => 
      t.id === blockedThread.id ? { ...t, state: 'ready' } : t
    ));

    if (model === 'ult' || model === 'many-to-one') {
      setKernelThreads(prev => prev.map(kt => ({ ...kt, state: 'idle' })));
    }
  };

  const removeThread = () => {
    if (userThreads.length <= 1) return;
    setUserThreads(prev => prev.slice(0, -1));
    
    if (model === 'klt' || model === 'one-to-one') {
      setKernelThreads(prev => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    initializeThreads();
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

  const runningThreads = userThreads.filter(t => t.state === 'running').length;
  const blockedThreads = userThreads.filter(t => t.state === 'blocked').length;
  const activeCores = cpuCores.filter(c => c.state === 'busy').length;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Multithreading Models</h1>
              <p className="text-neutral-400 text-sm mt-1">User & Kernel Thread Mapping</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Layers size={14} className="text-purple-400" />
              <span className="text-xs text-purple-400">{MODEL_INFO[model].name}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '580px' }}
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
                <button
                  onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={resetView}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <span className="text-xs text-neutral-400">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <Move size={14} className="text-purple-400" />
                <span className="text-xs text-neutral-300">Drag to pan</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-4"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-purple-400" />
                Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Threading Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as ThreadingModel)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="ult">User-Level Threads (ULT)</option>
                    <option value="klt">Kernel-Level Threads (KLT)</option>
                    <option value="many-to-one">Many-to-One</option>
                    <option value="one-to-one">One-to-One</option>
                    <option value="many-to-many">Many-to-Many</option>
                  </select>
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    isPlaying
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Run'}
                </button>
                
                <button
                  onClick={handleReset}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Layers size={16} className="text-blue-400" />
                Thread Controls
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={addThread}
                  disabled={userThreads.length >= 8}
                  className="py-2.5 rounded-xl font-semibold text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={14} />
                  Add Thread
                </button>
                
                <button
                  onClick={removeThread}
                  disabled={userThreads.length <= 1}
                  className="py-2.5 rounded-xl font-semibold text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
                
                <button
                  onClick={blockThread}
                  className="py-2.5 rounded-xl font-semibold text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Ban size={14} />
                  Block
                </button>
                
                <button
                  onClick={unblockThread}
                  disabled={blockedThreads === 0}
                  className="py-2.5 rounded-xl font-semibold text-xs bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowRight size={14} />
                  Unblock
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
                  <div className="text-xs text-neutral-500 mb-1">User Threads</div>
                  <div className="text-xl font-bold font-mono text-blue-400">{userThreads.length}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Kernel Threads</div>
                  <div className="text-xl font-bold font-mono text-green-400">{kernelThreads.length}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Running</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{runningThreads}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Blocked</div>
                  <div className="text-xl font-bold font-mono text-red-400">{blockedThreads}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Active Cores</div>
                  <div className="text-xl font-bold font-mono text-purple-400">{activeCores}/4</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Context Switches</div>
                  <div className="text-xl font-bold font-mono text-yellow-400">{contextSwitches}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Multithreading models define how user threads map to kernel threads. 
                Different models offer trade-offs between parallelism, overhead, and blocking behavior.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">Parallelism</span>
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400">Blocking</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Overhead</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
