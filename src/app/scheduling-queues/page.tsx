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
  Cpu,
  HardDrive,
  Plus,
  SkipForward,
  FastForward,
  Clock,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

type ProcessState = 'new' | 'ready' | 'running' | 'waiting' | 'io' | 'terminated';

interface Process {
  id: string;
  name: string;
  color: string;
  priority: number;
  arrivalTime: number;
  burstTime: number;
  remainingBurst: number;
  ioTime: number;
  remainingIo: number;
  state: ProcessState;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

const PROCESS_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EF4444', '#84CC16', '#F97316', '#6366F1'
];

const STATE_INFO: Record<ProcessState, { name: string; color: string }> = {
  'new': { name: 'Job Queue', color: '#6366F1' },
  'ready': { name: 'Ready Queue', color: '#10B981' },
  'running': { name: 'Running', color: '#3B82F6' },
  'waiting': { name: 'Waiting', color: '#F59E0B' },
  'io': { name: 'I/O Queue', color: '#EC4899' },
  'terminated': { name: 'Terminated', color: '#6B7280' }
};

export default function SchedulingQueuesVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [processes, setProcesses] = useState<Process[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [contextSwitches, setContextSwitches] = useState(0);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [message, setMessage] = useState('System initialized - Add processes to begin');
  const [processCounter, setProcessCounter] = useState(1);
  const [timeQuantum] = useState(3);

  const [canvasSize, setCanvasSize] = useState({ width: 950, height: 600 });

  const queuePositions = {
    jobQueue: { x: 80, y: 100, width: 140, height: 180 },
    readyQueue: { x: 280, y: 100, width: 140, height: 180 },
    cpu: { x: 480, y: 130, width: 100, height: 120 },
    ioQueue: { x: 480, y: 320, width: 140, height: 140 },
    waitingQueue: { x: 280, y: 320, width: 140, height: 140 },
    terminated: { x: 680, y: 130, width: 140, height: 120 }
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(800, rect.width),
          height: Math.max(520, rect.height)
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const addProcess = useCallback(() => {
    const id = `P${processCounter}`;
    const color = PROCESS_COLORS[(processCounter - 1) % PROCESS_COLORS.length];
    const pos = queuePositions.jobQueue;
    
    const jobQueueProcesses = processes.filter(p => p.state === 'new');
    const yOffset = jobQueueProcesses.length * 35;

    const newProcess: Process = {
      id,
      name: id,
      color,
      priority: Math.floor(Math.random() * 5) + 1,
      arrivalTime: time,
      burstTime: Math.floor(Math.random() * 6) + 3,
      remainingBurst: Math.floor(Math.random() * 6) + 3,
      ioTime: Math.floor(Math.random() * 3) + 1,
      remainingIo: Math.floor(Math.random() * 3) + 1,
      state: 'new',
      x: pos.x + 20,
      y: pos.y + 30 + yOffset,
      targetX: pos.x + 20,
      targetY: pos.y + 30 + yOffset
    };

    newProcess.remainingBurst = newProcess.burstTime;
    newProcess.remainingIo = newProcess.ioTime;

    setProcesses(prev => [...prev, newProcess]);
    setProcessCounter(prev => prev + 1);
    setMessage(`Process ${id} submitted to Job Queue`);
  }, [processCounter, time, processes]);

  const getQueuePosition = (state: ProcessState, index: number): { x: number; y: number } => {
    const pos = state === 'new' ? queuePositions.jobQueue
      : state === 'ready' ? queuePositions.readyQueue
      : state === 'running' ? queuePositions.cpu
      : state === 'io' ? queuePositions.ioQueue
      : state === 'waiting' ? queuePositions.waitingQueue
      : queuePositions.terminated;

    if (state === 'running') {
      return { x: pos.x + pos.width / 2 - 25, y: pos.y + pos.height / 2 - 15 };
    }

    const col = index % 2;
    const row = Math.floor(index / 2);
    return {
      x: pos.x + 15 + col * 60,
      y: pos.y + 30 + row * 35
    };
  };

  const simulationStep = useCallback(() => {
    setProcesses(prev => {
      let updated = [...prev];
      let newContextSwitches = 0;

      const jobQueue = updated.filter(p => p.state === 'new');
      if (jobQueue.length > 0 && Math.random() > 0.5) {
        const selected = jobQueue[0];
        selected.state = 'ready';
        const readyCount = updated.filter(p => p.state === 'ready').length - 1;
        const newPos = getQueuePosition('ready', readyCount);
        selected.targetX = newPos.x;
        selected.targetY = newPos.y;
        setMessage(`${selected.name} admitted to Ready Queue (Long-term scheduler)`);
      }

      const running = updated.find(p => p.state === 'running');
      if (running) {
        running.remainingBurst--;
        
        if (running.remainingBurst <= 0) {
          running.state = 'terminated';
          const termCount = updated.filter(p => p.state === 'terminated').length - 1;
          const newPos = getQueuePosition('terminated', termCount);
          running.targetX = newPos.x;
          running.targetY = newPos.y;
          setMessage(`${running.name} terminated - Resources released`);
          newContextSwitches++;
        } else if (running.remainingBurst === Math.floor(running.burstTime / 2) && running.ioTime > 0) {
          running.state = 'io';
          running.remainingIo = running.ioTime;
          const ioCount = updated.filter(p => p.state === 'io').length - 1;
          const newPos = getQueuePosition('io', ioCount);
          running.targetX = newPos.x;
          running.targetY = newPos.y;
          setMessage(`${running.name} requested I/O - Moved to Device Queue`);
          newContextSwitches++;
        }
      }

      const ioProcesses = updated.filter(p => p.state === 'io');
      ioProcesses.forEach(p => {
        p.remainingIo--;
        if (p.remainingIo <= 0) {
          p.state = 'ready';
          const readyCount = updated.filter(proc => proc.state === 'ready').length;
          const newPos = getQueuePosition('ready', readyCount);
          p.targetX = newPos.x;
          p.targetY = newPos.y;
          setMessage(`${p.name} I/O completed - Back to Ready Queue`);
        }
      });

      if (!updated.find(p => p.state === 'running')) {
        const readyQueue = updated.filter(p => p.state === 'ready');
        if (readyQueue.length > 0) {
          const selected = readyQueue[0];
          selected.state = 'running';
          const newPos = getQueuePosition('running', 0);
          selected.targetX = newPos.x;
          selected.targetY = newPos.y;
          setMessage(`${selected.name} dispatched to CPU (Short-term scheduler)`);
          newContextSwitches++;
        }
      }

      updated.forEach((p, idx) => {
        if (p.state === 'ready') {
          const readyIdx = updated.filter((proc, i) => i < idx && proc.state === 'ready').length;
          const newPos = getQueuePosition('ready', readyIdx);
          p.targetX = newPos.x;
          p.targetY = newPos.y;
        }
        if (p.state === 'new') {
          const jobIdx = updated.filter((proc, i) => i < idx && proc.state === 'new').length;
          const newPos = getQueuePosition('new', jobIdx);
          p.targetX = newPos.x;
          p.targetY = newPos.y;
        }
        if (p.state === 'io') {
          const ioIdx = updated.filter((proc, i) => i < idx && proc.state === 'io').length;
          const newPos = getQueuePosition('io', ioIdx);
          p.targetX = newPos.x;
          p.targetY = newPos.y;
        }
      });

      if (newContextSwitches > 0) {
        setContextSwitches(c => c + newContextSwitches);
      }

      return updated;
    });

    setTime(t => t + 1);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        simulationStep();
      }, 1000 / speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, speed, simulationStep]);

  useEffect(() => {
    const running = processes.find(p => p.state === 'running');
    const active = processes.filter(p => p.state !== 'terminated').length;
    if (active > 0) {
      setCpuUtilization(running ? 100 : 0);
    } else {
      setCpuUtilization(0);
    }
  }, [processes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = () => {
      ctx.fillStyle = '#0B0F14';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      setProcesses(prev => prev.map(p => ({
        ...p,
        x: lerp(p.x, p.targetX, 0.15),
        y: lerp(p.y, p.targetY, 0.15)
      })));

      const drawQueue = (name: string, pos: { x: number; y: number; width: number; height: number }, color: string, icon?: string) => {
        ctx.fillStyle = color + '15';
        ctx.strokeStyle = color + '50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, pos.width, pos.height, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, pos.x + pos.width / 2, pos.y + 18);

        if (icon) {
          ctx.fillStyle = color + '60';
          ctx.font = '20px sans-serif';
          ctx.fillText(icon, pos.x + pos.width / 2, pos.y + pos.height - 10);
        }
      };

      drawQueue('JOB QUEUE', queuePositions.jobQueue, '#6366F1', '📥');
      drawQueue('READY QUEUE', queuePositions.readyQueue, '#10B981', '⏳');
      drawQueue('I/O QUEUE', queuePositions.ioQueue, '#EC4899', '💾');
      drawQueue('WAITING', queuePositions.waitingQueue, '#F59E0B', '⏸');
      drawQueue('TERMINATED', queuePositions.terminated, '#6B7280', '✓');

      const cpuPos = queuePositions.cpu;
      const running = processes.find(p => p.state === 'running');
      
      ctx.fillStyle = running ? '#3B82F620' : '#3B82F610';
      ctx.strokeStyle = running ? '#3B82F6' : '#3B82F650';
      ctx.lineWidth = running ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(cpuPos.x, cpuPos.y, cpuPos.width, cpuPos.height, 12);
      ctx.fill();
      ctx.stroke();

      if (running) {
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#3B82F6';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#3B82F6';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CPU', cpuPos.x + cpuPos.width / 2, cpuPos.y + 18);

      ctx.fillStyle = '#3B82F660';
      ctx.font = '24px sans-serif';
      ctx.fillText('⚡', cpuPos.x + cpuPos.width / 2, cpuPos.y + cpuPos.height - 8);

      const drawArrow = (from: { x: number; y: number }, to: { x: number; y: number }, color: string, label?: string) => {
        ctx.strokeStyle = color + '60';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.fillStyle = color + '80';
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - 10 * Math.cos(angle - 0.4), to.y - 10 * Math.sin(angle - 0.4));
        ctx.lineTo(to.x - 10 * Math.cos(angle + 0.4), to.y - 10 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        if (label) {
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, midX, midY - 5);
        }
      };

      drawArrow(
        { x: queuePositions.jobQueue.x + queuePositions.jobQueue.width, y: queuePositions.jobQueue.y + queuePositions.jobQueue.height / 2 },
        { x: queuePositions.readyQueue.x, y: queuePositions.readyQueue.y + queuePositions.readyQueue.height / 2 },
        '#10B981', 'admit'
      );

      drawArrow(
        { x: queuePositions.readyQueue.x + queuePositions.readyQueue.width, y: queuePositions.readyQueue.y + queuePositions.readyQueue.height / 2 },
        { x: cpuPos.x, y: cpuPos.y + cpuPos.height / 2 },
        '#3B82F6', 'dispatch'
      );

      drawArrow(
        { x: cpuPos.x + cpuPos.width, y: cpuPos.y + cpuPos.height / 2 },
        { x: queuePositions.terminated.x, y: queuePositions.terminated.y + queuePositions.terminated.height / 2 },
        '#6B7280', 'exit'
      );

      drawArrow(
        { x: cpuPos.x + cpuPos.width / 2, y: cpuPos.y + cpuPos.height },
        { x: queuePositions.ioQueue.x + queuePositions.ioQueue.width / 2, y: queuePositions.ioQueue.y },
        '#EC4899', 'I/O req'
      );

      drawArrow(
        { x: queuePositions.ioQueue.x, y: queuePositions.ioQueue.y + queuePositions.ioQueue.height / 2 },
        { x: queuePositions.readyQueue.x + queuePositions.readyQueue.width / 2, y: queuePositions.readyQueue.y + queuePositions.readyQueue.height },
        '#10B981', 'I/O done'
      );

      processes.forEach(p => {
        if (p.state === 'terminated') {
          ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = p.color + '40';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, 50, 28, 6);
        ctx.fill();
        ctx.stroke();

        if (p.state === 'running') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x + 25, p.y + 13);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '8px sans-serif';
        if (p.state === 'running') {
          ctx.fillText(`${p.remainingBurst}/${p.burstTime}`, p.x + 25, p.y + 23);
        } else if (p.state === 'io') {
          ctx.fillText(`IO:${p.remainingIo}`, p.x + 25, p.y + 23);
        } else {
          ctx.fillText(`B:${p.burstTime}`, p.x + 25, p.y + 23);
        }

        ctx.globalAlpha = 1;
      });

      const legendY = 480;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(80, legendY, 700, 50, 8);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Process Lifecycle:', 95, legendY + 20);

      const states: ProcessState[] = ['new', 'ready', 'running', 'io', 'terminated'];
      states.forEach((state, i) => {
        const x = 200 + i * 120;
        ctx.fillStyle = STATE_INFO[state].color + '40';
        ctx.strokeStyle = STATE_INFO[state].color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, legendY + 10, 80, 28, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = STATE_INFO[state].color;
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(STATE_INFO[state].name, x + 40, legendY + 28);

        if (i < states.length - 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillText('→', x + 95, legendY + 28);
        }
      });

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [canvasSize, processes]);

  const resetSimulation = () => {
    setProcesses([]);
    setTime(0);
    setContextSwitches(0);
    setProcessCounter(1);
    setIsRunning(false);
    setMessage('System reset - Add processes to begin');
  };

  const stepSimulation = () => {
    if (!isRunning) {
      simulationStep();
    }
  };

  const queueCounts = {
    job: processes.filter(p => p.state === 'new').length,
    ready: processes.filter(p => p.state === 'ready').length,
    running: processes.filter(p => p.state === 'running').length,
    io: processes.filter(p => p.state === 'io').length,
    terminated: processes.filter(p => p.state === 'terminated').length
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.08),transparent_50%)]" />

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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Scheduling Queues</h1>
              <p className="text-neutral-400 text-sm mt-1">Process Lifecycle Visualization</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <Clock size={14} className="text-indigo-400" />
              <span className="text-xs text-indigo-400 font-mono">T = {time}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
              <Cpu size={14} className="text-green-400" />
              <span className="text-xs text-green-400">{cpuUtilization}% CPU</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '540px' }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="w-full h-full"
            />

            <div className="absolute bottom-4 left-4 right-4">
              <div className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <p className="text-xs text-neutral-300">{message}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-72 space-y-4"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-blue-400" />
                Simulation Controls
              </h3>

              <div className="space-y-4">
                <button
                  onClick={addProcess}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                >
                  <Plus size={16} />
                  Add Process
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      isRunning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}
                  >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    {isRunning ? 'Pause' : 'Play'}
                  </button>

                  <button
                    onClick={stepSimulation}
                    disabled={isRunning}
                    className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
                    title="Step"
                  >
                    <SkipForward size={16} />
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw size={16} />
                  </button>
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
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Layers size={16} className="text-pink-400" />
                Queue Status
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-xs text-indigo-400">Job Queue</span>
                  <span className="text-sm font-bold text-indigo-400">{queueCounts.job}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-xs text-green-400">Ready Queue</span>
                  <span className="text-sm font-bold text-green-400">{queueCounts.ready}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs text-blue-400">Running</span>
                  <span className="text-sm font-bold text-blue-400">{queueCounts.running}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <span className="text-xs text-pink-400">I/O Queue</span>
                  <span className="text-sm font-bold text-pink-400">{queueCounts.io}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-500/10 border border-neutral-500/20">
                  <span className="text-xs text-neutral-400">Terminated</span>
                  <span className="text-sm font-bold text-neutral-400">{queueCounts.terminated}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-purple-400" />
                Statistics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Time</div>
                  <div className="text-lg font-bold font-mono text-white">{time}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Switches</div>
                  <div className="text-lg font-bold font-mono text-amber-400">{contextSwitches}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center col-span-2">
                  <div className="text-xs text-neutral-500 mb-1">CPU Utilization</div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${cpuUtilization}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Scheduling queues organize processes by state. The long-term scheduler admits processes, 
                while the short-term scheduler dispatches them to CPU.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
