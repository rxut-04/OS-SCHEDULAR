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
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Plus,
  Trash2,
  AlertTriangle,
  Shuffle
} from 'lucide-react';
import Link from 'next/link';

interface MemoryBlock {
  id: string;
  start: number;
  size: number;
  type: 'free' | 'allocated';
  processId: string | null;
  processName: string | null;
  color: string | null;
  isHighlighted: boolean;
  isCandidate: boolean;
  isSelected: boolean;
}

interface Process {
  id: string;
  name: string;
  size: number;
  color: string;
  blockId: string | null;
}

type AllocationStrategy = 'first-fit' | 'best-fit' | 'worst-fit';

const TOTAL_MEMORY = 1024;
const PROCESS_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EF4444', '#84CC16', '#F97316', '#6366F1'
];

const STRATEGY_INFO: Record<AllocationStrategy, { name: string; description: string; color: string }> = {
  'first-fit': {
    name: 'First Fit',
    description: 'Allocates the first hole that is big enough',
    color: '#3B82F6'
  },
  'best-fit': {
    name: 'Best Fit',
    description: 'Allocates the smallest hole that is big enough',
    color: '#10B981'
  },
  'worst-fit': {
    name: 'Worst Fit',
    description: 'Allocates the largest hole available',
    color: '#F59E0B'
  }
};

export default function ContiguousMemoryVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [strategy, setStrategy] = useState<AllocationStrategy>('first-fit');
  const [processName, setProcessName] = useState('');
  const [processSize, setProcessSize] = useState(128);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [message, setMessage] = useState('Main memory initialized');
  const [processCounter, setProcessCounter] = useState(1);

  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const initializeMemory = useCallback(() => {
    const initialBlock: MemoryBlock = {
      id: 'block_0',
      start: 0,
      size: TOTAL_MEMORY,
      type: 'free',
      processId: null,
      processName: null,
      color: null,
      isHighlighted: false,
      isCandidate: false,
      isSelected: false
    };
    setMemoryBlocks([initialBlock]);
    setProcesses([]);
    setProcessCounter(1);
    setMessage('Main memory initialized');
  }, []);

  useEffect(() => {
    initializeMemory();
  }, [initializeMemory]);

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

  const findHole = (size: number): MemoryBlock | null => {
    const freeBlocks = memoryBlocks.filter(b => b.type === 'free' && b.size >= size);
    if (freeBlocks.length === 0) return null;

    switch (strategy) {
      case 'first-fit':
        return freeBlocks[0];
      case 'best-fit':
        return freeBlocks.reduce((best, block) =>
          block.size < best.size ? block : best
        );
      case 'worst-fit':
        return freeBlocks.reduce((worst, block) =>
          block.size > worst.size ? block : worst
        );
      default:
        return freeBlocks[0];
    }
  };

  const allocateProcess = async () => {
    const name = processName.trim() || `P${processCounter}`;
    const size = processSize;

    if (size < 1 || size > TOTAL_MEMORY) {
      setMessage('Invalid process size');
      return;
    }

    setIsAnimating(true);

    const freeBlocks = memoryBlocks.filter(b => b.type === 'free' && b.size >= size);

    if (freeBlocks.length === 0) {
      setMessage('External fragmentation: No suitable block available!');
      setMemoryBlocks(prev => prev.map(b => ({
        ...b,
        isHighlighted: b.type === 'free',
        isCandidate: false,
        isSelected: false
      })));
      await new Promise(r => setTimeout(r, 1500 / speed));
      setMemoryBlocks(prev => prev.map(b => ({ ...b, isHighlighted: false })));
      setIsAnimating(false);
      return;
    }

    setMemoryBlocks(prev => prev.map(b => ({
      ...b,
      isCandidate: b.type === 'free' && b.size >= size,
      isHighlighted: false,
      isSelected: false
    })));
    setMessage(`Scanning for ${strategy === 'first-fit' ? 'first' : strategy === 'best-fit' ? 'smallest' : 'largest'} suitable block...`);
    await new Promise(r => setTimeout(r, 800 / speed));

    const selectedBlock = findHole(size);
    if (!selectedBlock) {
      setIsAnimating(false);
      return;
    }

    setMemoryBlocks(prev => prev.map(b => ({
      ...b,
      isSelected: b.id === selectedBlock.id,
      isCandidate: false
    })));
    setMessage(`${STRATEGY_INFO[strategy].name}: Block at ${selectedBlock.start}KB selected`);
    await new Promise(r => setTimeout(r, 600 / speed));

    const color = PROCESS_COLORS[(processes.length) % PROCESS_COLORS.length];
    const processId = `process_${processCounter}`;
    const newBlockId = `block_${Date.now()}`;

    const newBlocks: MemoryBlock[] = [];
    memoryBlocks.forEach(block => {
      if (block.id === selectedBlock.id) {
        newBlocks.push({
          id: newBlockId,
          start: block.start,
          size: size,
          type: 'allocated',
          processId,
          processName: name,
          color,
          isHighlighted: true,
          isCandidate: false,
          isSelected: false
        });

        const remaining = block.size - size;
        if (remaining > 0) {
          newBlocks.push({
            id: `block_${Date.now() + 1}`,
            start: block.start + size,
            size: remaining,
            type: 'free',
            processId: null,
            processName: null,
            color: null,
            isHighlighted: false,
            isCandidate: false,
            isSelected: false
          });
        }
      } else {
        newBlocks.push({ ...block, isHighlighted: false, isCandidate: false, isSelected: false });
      }
    });

    setMemoryBlocks(newBlocks);
    setProcesses(prev => [...prev, { id: processId, name, size, color, blockId: newBlockId }]);
    setProcessCounter(prev => prev + 1);
    setProcessName('');
    setMessage(`Process ${name} allocated at ${selectedBlock.start}KB`);

    await new Promise(r => setTimeout(r, 500 / speed));
    setMemoryBlocks(prev => prev.map(b => ({ ...b, isHighlighted: false })));
    setIsAnimating(false);
  };

  const deallocateProcess = async (processId: string) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return;

    setIsAnimating(true);

    setMemoryBlocks(prev => prev.map(b => ({
      ...b,
      isHighlighted: b.processId === processId
    })));
    setMessage(`Deallocating process ${process.name}...`);
    await new Promise(r => setTimeout(r, 500 / speed));

    let newBlocks = memoryBlocks.map(block => {
      if (block.processId === processId) {
        return {
          ...block,
          type: 'free' as const,
          processId: null,
          processName: null,
          color: null,
          isHighlighted: true
        };
      }
      return { ...block, isHighlighted: false };
    });

    newBlocks.sort((a, b) => a.start - b.start);
    const mergedBlocks: MemoryBlock[] = [];

    for (const block of newBlocks) {
      if (mergedBlocks.length === 0) {
        mergedBlocks.push(block);
        continue;
      }

      const lastBlock = mergedBlocks[mergedBlocks.length - 1];
      if (lastBlock.type === 'free' && block.type === 'free') {
        lastBlock.size += block.size;
        lastBlock.isHighlighted = true;
      } else {
        mergedBlocks.push(block);
      }
    }

    setMemoryBlocks(mergedBlocks);
    setProcesses(prev => prev.filter(p => p.id !== processId));
    setMessage(`Process ${process.name} deallocated, memory reclaimed`);

    await new Promise(r => setTimeout(r, 500 / speed));
    setMemoryBlocks(prev => prev.map(b => ({ ...b, isHighlighted: false })));
    setIsAnimating(false);
  };

  const compactMemory = async () => {
    const allocatedBlocks = memoryBlocks.filter(b => b.type === 'allocated');
    if (allocatedBlocks.length === 0) {
      setMessage('No processes to compact');
      return;
    }

    setIsAnimating(true);
    setMessage('Compacting memory...');

    for (let i = 0; i < 3; i++) {
      setMemoryBlocks(prev => prev.map(b => ({ ...b, isHighlighted: !b.isHighlighted })));
      await new Promise(r => setTimeout(r, 200 / speed));
    }

    const newBlocks: MemoryBlock[] = [];
    let currentStart = 0;

    allocatedBlocks.sort((a, b) => a.start - b.start);

    for (const block of allocatedBlocks) {
      newBlocks.push({
        ...block,
        start: currentStart,
        isHighlighted: true
      });
      currentStart += block.size;
    }

    const totalUsed = allocatedBlocks.reduce((sum, b) => sum + b.size, 0);
    const freeSize = TOTAL_MEMORY - totalUsed;

    if (freeSize > 0) {
      newBlocks.push({
        id: `block_${Date.now()}`,
        start: currentStart,
        size: freeSize,
        type: 'free',
        processId: null,
        processName: null,
        color: null,
        isHighlighted: false,
        isCandidate: false,
        isSelected: false
      });
    }

    setMemoryBlocks(newBlocks);
    setMessage('Memory compaction complete - all free space merged');

    await new Promise(r => setTimeout(r, 800 / speed));
    setMemoryBlocks(prev => prev.map(b => ({ ...b, isHighlighted: false })));
    setIsAnimating(false);
  };

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

      const memBarX = 80;
      const memBarY = 60;
      const memBarWidth = 180;
      const memBarHeight = 420;
      const scale = memBarHeight / TOTAL_MEMORY;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(memBarX - 20, memBarY - 35, memBarWidth + 40, memBarHeight + 70, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MAIN MEMORY', memBarX, memBarY - 15);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${TOTAL_MEMORY} KB`, memBarX + 120, memBarY - 15);

      memoryBlocks.forEach(block => {
        const y = memBarY + block.start * scale;
        const height = block.size * scale;

        let bgColor = 'rgba(107, 114, 128, 0.2)';
        let borderColor = 'rgba(107, 114, 128, 0.4)';

        if (block.type === 'allocated' && block.color) {
          bgColor = block.color + '60';
          borderColor = block.color;
        }

        if (block.isSelected) {
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 20;
        } else if (block.isCandidate) {
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 12;
        } else if (block.isHighlighted) {
          ctx.shadowColor = block.color || '#10B981';
          ctx.shadowBlur = 15;
        }

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(memBarX, y, memBarWidth, Math.max(height - 2, 4), 4);
        ctx.fill();

        ctx.strokeStyle = block.isSelected ? '#FFFFFF' : block.isCandidate ? '#F59E0B' : borderColor;
        ctx.lineWidth = block.isHighlighted || block.isCandidate || block.isSelected ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${block.start}KB`, memBarX + 5, y + 12);

        if (block.type === 'allocated' && block.processName) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(block.processName, memBarX + memBarWidth / 2, y + height / 2 + 4);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '9px sans-serif';
          ctx.fillText(`${block.size}KB`, memBarX + memBarWidth / 2, y + height / 2 + 18);
        } else if (block.type === 'free') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          if (height > 30) {
            ctx.fillText('FREE', memBarX + memBarWidth / 2, y + height / 2);
            ctx.fillText(`${block.size}KB`, memBarX + memBarWidth / 2, y + height / 2 + 14);
          }
        }

        if (block.isCandidate && !block.isSelected) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('CANDIDATE', memBarX + memBarWidth - 5, y + 12);
        }
        if (block.isSelected) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('SELECTED', memBarX + memBarWidth - 5, y + 12);
        }
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${TOTAL_MEMORY}KB`, memBarX + 5, memBarY + memBarHeight + 12);

      const procX = memBarX + memBarWidth + 80;
      const procY = memBarY;

      ctx.fillStyle = 'rgba(236, 72, 153, 0.05)';
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(procX, procY - 35, 220, 280, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PROCESS TABLE', procX + 15, procY - 15);

      if (processes.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No processes allocated', procX + 110, procY + 50);
      } else {
        processes.forEach((proc, idx) => {
          const entryY = procY + idx * 45 + 10;
          const block = memoryBlocks.find(b => b.processId === proc.id);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.beginPath();
          ctx.roundRect(procX + 10, entryY, 200, 38, 6);
          ctx.fill();
          ctx.strokeStyle = proc.color;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = proc.color;
          ctx.beginPath();
          ctx.arc(procX + 28, entryY + 19, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(proc.name, procX + 44, entryY + 16);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '9px sans-serif';
          ctx.fillText(`${proc.size}KB @ ${block?.start || 0}KB`, procX + 44, entryY + 30);
        });
      }

      const freeBlocks = memoryBlocks.filter(b => b.type === 'free');
      const fragCount = freeBlocks.length;
      const totalFree = freeBlocks.reduce((sum, b) => sum + b.size, 0);
      const largestFree = freeBlocks.length > 0 ? Math.max(...freeBlocks.map(b => b.size)) : 0;

      const fragX = procX;
      const fragY = procY + 260;

      ctx.fillStyle = fragCount > 2 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.05)';
      ctx.strokeStyle = fragCount > 2 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(fragX, fragY, 220, 100, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = fragCount > 2 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('FRAGMENTATION STATUS', fragX + 15, fragY + 20);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Free Holes: ${fragCount}`, fragX + 15, fragY + 42);
      ctx.fillText(`Total Free: ${totalFree}KB`, fragX + 15, fragY + 58);
      ctx.fillText(`Largest Hole: ${largestFree}KB`, fragX + 15, fragY + 74);

      if (fragCount > 2) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('⚠ External Fragmentation', fragX + 15, fragY + 90);
      }

      const infoY = memBarY + memBarHeight + 50;
      const info = STRATEGY_INFO[strategy];

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(memBarX - 20, infoY, memBarWidth + 40, 60, 8);
      ctx.fill();
      ctx.strokeStyle = info.color + '40';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = info.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(info.name, memBarX - 5, infoY + 22);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(info.description, memBarX - 5, infoY + 42);

      if (message) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(procX, infoY, 220, 40, 8);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(message, procX + 15, infoY + 25);
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [memoryBlocks, processes, canvasSize, zoom, panOffset, strategy, message]);

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

  const usedMemory = memoryBlocks.filter(b => b.type === 'allocated').reduce((sum, b) => sum + b.size, 0);
  const freeMemory = TOTAL_MEMORY - usedMemory;
  const utilization = ((usedMemory / TOTAL_MEMORY) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Contiguous Memory</h1>
              <p className="text-neutral-400 text-sm mt-1">Memory Allocation Strategies</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: STRATEGY_INFO[strategy].color + '20', borderColor: STRATEGY_INFO[strategy].color + '50', borderWidth: 1 }}>
              <Cpu size={14} style={{ color: STRATEGY_INFO[strategy].color }} />
              <span className="text-xs" style={{ color: STRATEGY_INFO[strategy].color }}>{STRATEGY_INFO[strategy].name}</span>
            </div>
          </div>
        </motion.div>

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
                <Move size={14} className="text-blue-400" />
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
                <Settings size={16} className="text-blue-400" />
                Allocation Strategy
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['first-fit', 'best-fit', 'worst-fit'] as AllocationStrategy[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${strategy === s
                          ? 'bg-opacity-30 border-2'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      style={{
                        backgroundColor: strategy === s ? STRATEGY_INFO[s].color + '30' : undefined,
                        borderColor: strategy === s ? STRATEGY_INFO[s].color : undefined,
                        color: strategy === s ? STRATEGY_INFO[s].color : undefined
                      }}
                    >
                      {STRATEGY_INFO[s].name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Process Name</label>
                  <input
                    type="text"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    placeholder={`P${processCounter}`}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    maxLength={8}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Process Size (KB)</span>
                    <span className="text-white font-mono">{processSize}</span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={512}
                    step={32}
                    value={processSize}
                    onChange={(e) => setProcessSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Animation Speed</span>
                    <span className="text-white font-mono">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={allocateProcess}
                  disabled={isAnimating}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
                >
                  <Plus size={16} />
                  Allocate
                </button>

                <button
                  onClick={compactMemory}
                  disabled={isAnimating || processes.length === 0}
                  className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                  title="Compact Memory"
                >
                  <Shuffle size={16} />
                </button>

                <button
                  onClick={initializeMemory}
                  disabled={isAnimating}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Reset Memory"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Layers size={16} className="text-pink-400" />
                Processes ({processes.length})
              </h3>

              {processes.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No processes allocated</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {processes.map(proc => (
                    <div
                      key={proc.id}
                      className="p-2 rounded-lg bg-white/5 flex items-center justify-between hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: proc.color }} />
                        <span className="text-xs text-white">{proc.name}</span>
                        <span className="text-xs text-neutral-500">{proc.size}KB</span>
                      </div>
                      <button
                        onClick={() => deallocateProcess(proc.id)}
                        disabled={isAnimating}
                        className="p-1.5 rounded text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Deallocate"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-purple-400" />
                Memory Statistics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Total</div>
                  <div className="text-lg font-bold font-mono text-white">{TOTAL_MEMORY}KB</div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Used</div>
                  <div className="text-lg font-bold font-mono text-blue-400">{usedMemory}KB</div>
                </div>

                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Free</div>
                  <div className="text-lg font-bold font-mono text-green-400">{freeMemory}KB</div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Utilization</div>
                  <div className="text-lg font-bold font-mono text-purple-400">{utilization}%</div>
                </div>
              </div>

              <div className="mt-3 h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${utilization}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-pink-500/10 border border-blue-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Contiguous allocation assigns a single continuous block to each process.
                External fragmentation is the main drawback when free memory is scattered.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">First Fit</span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">Best Fit</span>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">Worst Fit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
