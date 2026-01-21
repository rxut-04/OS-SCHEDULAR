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
  Plus,
  Trash2,
  HardDrive,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

interface MemoryBlock {
  id: string;
  start: number;
  size: number;
  processId: string | null;
  processColor: string | null;
  isAllocating: boolean;
  isDeallocating: boolean;
}

interface Process {
  id: string;
  name: string;
  size: number;
  color: string;
  status: 'waiting' | 'allocated' | 'completed';
  allocatedBlock: string | null;
}

type PartitioningType = 'fixed' | 'variable';
type AllocationAlgorithm = 'first-fit' | 'best-fit' | 'worst-fit';
type VisualizerStatus = 'idle' | 'allocating' | 'deallocating' | 'searching' | 'completed';

const PROCESS_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EF4444', '#84CC16', '#F97316', '#6366F1'
];

const TOTAL_MEMORY = 1024;

export default function MemoryManagementVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processQueue, setProcessQueue] = useState<Process[]>([]);
  
  const [partitioningType, setPartitioningType] = useState<PartitioningType>('variable');
  const [algorithm, setAlgorithm] = useState<AllocationAlgorithm>('first-fit');
  const [fixedPartitionSize, setFixedPartitionSize] = useState(128);
  const [speed, setSpeed] = useState(1);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<VisualizerStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedBlock, setHighlightedBlock] = useState<string | null>(null);
  const [searchingIndex, setSearchingIndex] = useState(-1);
  
  const [usedMemory, setUsedMemory] = useState(0);
  const [internalFragmentation, setInternalFragmentation] = useState(0);
  const [externalFragmentation, setExternalFragmentation] = useState(0);
  
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [newProcessSize, setNewProcessSize] = useState(100);
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const initializeMemory = useCallback(() => {
    if (partitioningType === 'fixed') {
      const numPartitions = Math.floor(TOTAL_MEMORY / fixedPartitionSize);
      const blocks: MemoryBlock[] = [];
      for (let i = 0; i < numPartitions; i++) {
        blocks.push({
          id: `block-${i}`,
          start: i * fixedPartitionSize,
          size: fixedPartitionSize,
          processId: null,
          processColor: null,
          isAllocating: false,
          isDeallocating: false
        });
      }
      setMemoryBlocks(blocks);
    } else {
      setMemoryBlocks([{
        id: 'block-0',
        start: 0,
        size: TOTAL_MEMORY,
        processId: null,
        processColor: null,
        isAllocating: false,
        isDeallocating: false
      }]);
    }
    setProcesses([]);
    setProcessQueue([]);
    setUsedMemory(0);
    setInternalFragmentation(0);
    setExternalFragmentation(0);
    setStatus('idle');
    setCurrentStep(0);
    setHighlightedBlock(null);
    setSearchingIndex(-1);
  }, [partitioningType, fixedPartitionSize]);

  useEffect(() => {
    initializeMemory();
  }, [initializeMemory]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(600, rect.width),
          height: Math.max(500, rect.height)
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const calculateFragmentation = useCallback(() => {
    let internal = 0;
    let external = 0;
    let used = 0;

    memoryBlocks.forEach(block => {
      if (block.processId) {
        const process = processes.find(p => p.id === block.processId);
        if (process && partitioningType === 'fixed') {
          internal += block.size - process.size;
        }
        used += process?.size || block.size;
      } else {
        external += block.size;
      }
    });

    const freeBlocks = memoryBlocks.filter(b => !b.processId);
    if (freeBlocks.length > 1) {
      external = freeBlocks.reduce((sum, b) => sum + b.size, 0);
    } else {
      external = 0;
    }

    setUsedMemory(used);
    setInternalFragmentation(internal);
    setExternalFragmentation(external);
  }, [memoryBlocks, processes, partitioningType]);

  useEffect(() => {
    calculateFragmentation();
  }, [memoryBlocks, processes, calculateFragmentation]);

  const findBestBlock = useCallback((processSize: number): MemoryBlock | null => {
    const freeBlocks = memoryBlocks.filter(b => !b.processId && b.size >= processSize);
    
    if (freeBlocks.length === 0) return null;

    switch (algorithm) {
      case 'first-fit':
        return freeBlocks[0];
      case 'best-fit':
        return freeBlocks.reduce((best, current) => 
          current.size < best.size ? current : best
        );
      case 'worst-fit':
        return freeBlocks.reduce((worst, current) => 
          current.size > worst.size ? current : worst
        );
      default:
        return freeBlocks[0];
    }
  }, [memoryBlocks, algorithm]);

  const allocateProcess = useCallback((process: Process) => {
    const targetBlock = findBestBlock(process.size);
    
    if (!targetBlock) {
      setProcesses(prev => prev.map(p => 
        p.id === process.id ? { ...p, status: 'waiting' } : p
      ));
      return false;
    }

    setHighlightedBlock(targetBlock.id);
    
    if (partitioningType === 'variable') {
      const remainingSize = targetBlock.size - process.size;
      
      setMemoryBlocks(prev => {
        const newBlocks = prev.filter(b => b.id !== targetBlock.id);
        const allocatedBlock: MemoryBlock = {
          id: `block-${Date.now()}`,
          start: targetBlock.start,
          size: process.size,
          processId: process.id,
          processColor: process.color,
          isAllocating: true,
          isDeallocating: false
        };
        
        if (remainingSize > 0) {
          const freeBlock: MemoryBlock = {
            id: `block-${Date.now() + 1}`,
            start: targetBlock.start + process.size,
            size: remainingSize,
            processId: null,
            processColor: null,
            isAllocating: false,
            isDeallocating: false
          };
          newBlocks.push(allocatedBlock, freeBlock);
        } else {
          newBlocks.push(allocatedBlock);
        }
        
        return newBlocks.sort((a, b) => a.start - b.start);
      });
      
      setProcesses(prev => prev.map(p => 
        p.id === process.id ? { ...p, status: 'allocated', allocatedBlock: targetBlock.id } : p
      ));
    } else {
      setMemoryBlocks(prev => prev.map(b => 
        b.id === targetBlock.id 
          ? { ...b, processId: process.id, processColor: process.color, isAllocating: true }
          : b
      ));
      
      setProcesses(prev => prev.map(p => 
        p.id === process.id ? { ...p, status: 'allocated', allocatedBlock: targetBlock.id } : p
      ));
    }

    setTimeout(() => {
      setMemoryBlocks(prev => prev.map(b => ({ ...b, isAllocating: false })));
      setHighlightedBlock(null);
    }, 500);

    return true;
  }, [findBestBlock, partitioningType]);

  const deallocateProcess = useCallback((processId: string) => {
    const blockToFree = memoryBlocks.find(b => b.processId === processId);
    if (!blockToFree) return;

    setHighlightedBlock(blockToFree.id);
    setMemoryBlocks(prev => prev.map(b => 
      b.id === blockToFree.id ? { ...b, isDeallocating: true } : b
    ));

    setTimeout(() => {
      if (partitioningType === 'variable') {
        setMemoryBlocks(prev => {
          let newBlocks = prev.map(b => 
            b.id === blockToFree.id 
              ? { ...b, processId: null, processColor: null, isDeallocating: false }
              : b
          );
          
          newBlocks = newBlocks.sort((a, b) => a.start - b.start);
          
          const mergedBlocks: MemoryBlock[] = [];
          for (const block of newBlocks) {
            const lastBlock = mergedBlocks[mergedBlocks.length - 1];
            if (lastBlock && !lastBlock.processId && !block.processId) {
              lastBlock.size += block.size;
            } else {
              mergedBlocks.push({ ...block });
            }
          }
          
          return mergedBlocks;
        });
      } else {
        setMemoryBlocks(prev => prev.map(b => 
          b.id === blockToFree.id 
            ? { ...b, processId: null, processColor: null, isDeallocating: false }
            : b
        ));
      }
      
      setProcesses(prev => prev.map(p => 
        p.id === processId ? { ...p, status: 'completed', allocatedBlock: null } : p
      ));
      
      setHighlightedBlock(null);
    }, 500);
  }, [memoryBlocks, partitioningType]);

  const addProcess = useCallback(() => {
    const colorIndex = processes.length % PROCESS_COLORS.length;
    const newProcess: Process = {
      id: `P${processes.length + 1}`,
      name: `Process ${processes.length + 1}`,
      size: newProcessSize,
      color: PROCESS_COLORS[colorIndex],
      status: 'waiting',
      allocatedBlock: null
    };
    
    setProcesses(prev => [...prev, newProcess]);
    setProcessQueue(prev => [...prev, newProcess]);
  }, [processes.length, newProcessSize]);

  const runStep = useCallback(() => {
    if (processQueue.length === 0) {
      setStatus('idle');
      setIsPlaying(false);
      return;
    }

    const currentProcess = processQueue[0];
    setStatus('allocating');
    
    const success = allocateProcess(currentProcess);
    
    if (success) {
      setProcessQueue(prev => prev.slice(1));
    } else {
      setProcessQueue(prev => prev.slice(1));
    }
    
    setCurrentStep(prev => prev + 1);
  }, [processQueue, allocateProcess]);

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

      const memoryBarX = 80;
      const memoryBarY = 60;
      const memoryBarWidth = 180;
      const memoryBarHeight = canvasSize.height - 120;
      const scale = memoryBarHeight / TOTAL_MEMORY;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(memoryBarX - 10, memoryBarY - 10, memoryBarWidth + 20, memoryBarHeight + 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(memoryBarX - 10, memoryBarY - 10, memoryBarWidth + 20, memoryBarHeight + 20);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Main Memory', memoryBarX + memoryBarWidth / 2, memoryBarY - 25);
      ctx.fillText(`${TOTAL_MEMORY} MB`, memoryBarX + memoryBarWidth / 2, memoryBarY - 10);

      memoryBlocks.forEach(block => {
        const blockY = memoryBarY + block.start * scale;
        const blockHeight = block.size * scale;
        
        const isHighlighted = block.id === highlightedBlock;
        
        if (block.processId && block.processColor) {
          if (block.isAllocating) {
            ctx.shadowColor = block.processColor;
            ctx.shadowBlur = 20;
          }
          if (block.isDeallocating) {
            ctx.globalAlpha = 0.5;
          }
          
          const gradient = ctx.createLinearGradient(memoryBarX, blockY, memoryBarX + memoryBarWidth, blockY);
          gradient.addColorStop(0, block.processColor + 'CC');
          gradient.addColorStop(1, block.processColor + '99');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = isHighlighted 
            ? 'rgba(139, 92, 246, 0.3)'
            : 'rgba(255, 255, 255, 0.05)';
        }
        
        ctx.beginPath();
        ctx.roundRect(memoryBarX, blockY, memoryBarWidth, blockHeight - 2, 4);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        ctx.strokeStyle = block.processId 
          ? (block.processColor || 'rgba(255, 255, 255, 0.2)') 
          : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        if (blockHeight > 30) {
          ctx.fillStyle = block.processId ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const text = block.processId || 'Free';
          ctx.fillText(text, memoryBarX + memoryBarWidth / 2, blockY + blockHeight / 2 - 8);
          
          ctx.font = '10px monospace';
          ctx.fillStyle = block.processId ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)';
          ctx.fillText(`${block.size} MB`, memoryBarX + memoryBarWidth / 2, blockY + blockHeight / 2 + 8);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${block.start}`, memoryBarX - 35, blockY + 10);
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${TOTAL_MEMORY}`, memoryBarX - 35, memoryBarY + memoryBarHeight);

      const queueX = memoryBarX + memoryBarWidth + 80;
      const queueY = memoryBarY;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Process Queue', queueX, queueY - 10);

      if (processQueue.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '11px sans-serif';
        ctx.fillText('Queue empty', queueX, queueY + 30);
      }

      processQueue.slice(0, 8).forEach((process, idx) => {
        const processY = queueY + idx * 55;
        const processWidth = 140;
        const processHeight = 45;
        
        ctx.fillStyle = process.color + '30';
        ctx.beginPath();
        ctx.roundRect(queueX, processY, processWidth, processHeight, 8);
        ctx.fill();
        
        ctx.strokeStyle = process.color + '60';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = process.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(process.id, queueX + 12, processY + 18);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText(`${process.size} MB`, queueX + 12, processY + 34);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('waiting', queueX + processWidth - 12, processY + 26);
      });

      const allocatedX = queueX + 200;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Allocated Processes', allocatedX, queueY - 10);

      const allocatedProcesses = processes.filter(p => p.status === 'allocated');
      
      if (allocatedProcesses.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '11px sans-serif';
        ctx.fillText('No processes allocated', allocatedX, queueY + 30);
      }

      allocatedProcesses.slice(0, 8).forEach((process, idx) => {
        const processY = queueY + idx * 55;
        const processWidth = 160;
        const processHeight = 45;
        
        ctx.shadowColor = process.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = process.color + '40';
        ctx.beginPath();
        ctx.roundRect(allocatedX, processY, processWidth, processHeight, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = process.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = process.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(process.id, allocatedX + 12, processY + 18);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px monospace';
        ctx.fillText(`${process.size} MB`, allocatedX + 12, processY + 34);
        
        ctx.fillStyle = '#10B981';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('allocated', allocatedX + processWidth - 12, processY + 26);
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [memoryBlocks, processQueue, processes, canvasSize, highlightedBlock, zoom, panOffset]);

  const handleReset = () => {
    setIsPlaying(false);
    initializeMemory();
  };

  const removeAllocatedProcess = (processId: string) => {
    deallocateProcess(processId);
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

  const getStatusText = () => {
    switch (status) {
      case 'idle': return processQueue.length > 0 ? 'Ready to allocate' : 'Add processes to begin';
      case 'allocating': return `Allocating using ${algorithm.replace('-', ' ')}`;
      case 'deallocating': return 'Deallocating process memory';
      case 'searching': return `Searching for suitable block (${algorithm.replace('-', ' ')})`;
      case 'completed': return 'All processes allocated';
      default: return '';
    }
  };

  const freeMemory = TOTAL_MEMORY - usedMemory;
  const utilizationPercent = ((usedMemory / TOTAL_MEMORY) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]" />
      
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Memory Management</h1>
              <p className="text-neutral-400 text-sm mt-1">Allocation Algorithms Visualization</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <HardDrive size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">{TOTAL_MEMORY} MB</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Layers size={14} className="text-purple-400" />
              <span className="text-xs text-purple-400 capitalize">{partitioningType}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '550px' }}
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
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={resetView}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                  title="Reset View"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <span className="text-xs text-neutral-400">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                <Move size={14} className="text-emerald-400" />
                <span className="text-xs text-neutral-300">Drag to pan</span>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className={`px-4 py-3 rounded-xl backdrop-blur-xl border ${
                status === 'completed' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  {status === 'allocating' || status === 'searching' ? (
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  ) : status === 'completed' ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-neutral-500" />
                  )}
                  <span className={`text-sm ${status === 'completed' ? 'text-green-400' : 'text-neutral-300'}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-4"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-emerald-400" />
                Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Partitioning Type</label>
                  <select
                    value={partitioningType}
                    onChange={(e) => setPartitioningType(e.target.value as PartitioningType)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="variable">Variable Partitioning</option>
                    <option value="fixed">Fixed Partitioning</option>
                  </select>
                </div>

                {partitioningType === 'fixed' && (
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-neutral-400">Partition Size</span>
                      <span className="text-white font-mono">{fixedPartitionSize} MB</span>
                    </div>
                    <input
                      type="range"
                      min={64}
                      max={256}
                      step={32}
                      value={fixedPartitionSize}
                      onChange={(e) => setFixedPartitionSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Allocation Algorithm</label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as AllocationAlgorithm)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="first-fit">First Fit</option>
                    <option value="best-fit">Best Fit</option>
                    <option value="worst-fit">Worst Fit</option>
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={processQueue.length === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    processQueue.length === 0
                      ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Allocate'}
                </button>
                
                <button
                  onClick={runStep}
                  disabled={isPlaying || processQueue.length === 0}
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
                <Plus size={16} className="text-purple-400" />
                Add Process
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Process Size</span>
                    <span className="text-white font-mono">{newProcessSize} MB</span>
                  </div>
                  <input
                    type="range"
                    min={32}
                    max={300}
                    step={8}
                    value={newProcessSize}
                    onChange={(e) => setNewProcessSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                  />
                </div>
                
                <button
                  onClick={addProcess}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add to Queue
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-pink-400" />
                Memory Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Used Memory</span>
                  <span className="text-sm font-mono text-emerald-400">{usedMemory} MB</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Free Memory</span>
                  <span className="text-sm font-mono text-blue-400">{freeMemory} MB</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Utilization</span>
                  <span className="text-sm font-mono text-yellow-400">{utilizationPercent}%</span>
                </div>
                
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${utilizationPercent}%` }}
                  />
                </div>
                
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Internal Fragmentation</span>
                    <span className="text-sm font-mono text-orange-400">{internalFragmentation} MB</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-400">External Fragmentation</span>
                    <span className="text-sm font-mono text-red-400">{externalFragmentation} MB</span>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {processes.filter(p => p.status === 'allocated').length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                  <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                    <Trash2 size={16} className="text-red-400" />
                    Deallocate Process
                  </h3>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {processes.filter(p => p.status === 'allocated').map(process => (
                      <button
                        key={process.id}
                        onClick={() => removeAllocatedProcess(process.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: process.color }} />
                          <span className="text-sm">{process.id}</span>
                          <span className="text-xs text-neutral-500">{process.size} MB</span>
                        </div>
                        <Trash2 size={14} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Memory management allocates main memory to processes efficiently. 
                Different algorithms minimize fragmentation in different ways.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">First Fit</span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Best Fit</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Worst Fit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
