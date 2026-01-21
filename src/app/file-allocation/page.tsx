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
  HardDrive,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Plus,
  Trash2,
  FileText,
  Link as LinkIcon,
  Grid,
  ArrowRight,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface DiskBlock {
  id: number;
  state: 'free' | 'allocated' | 'index';
  fileId: string | null;
  pointer: number | null;
  isHighlighted: boolean;
  isAccessing: boolean;
}

interface FileEntry {
  id: string;
  name: string;
  color: string;
  blocks: number[];
  startBlock: number;
  indexBlock: number | null;
  size: number;
  method: AllocationMethod;
}

type AllocationMethod = 'contiguous' | 'linked' | 'indexed';

const TOTAL_BLOCKS = 32;
const BLOCKS_PER_ROW = 8;

const FILE_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EF4444', '#84CC16', '#F97316', '#6366F1'
];

const METHOD_INFO: Record<AllocationMethod, { name: string; description: string; color: string; pros: string[]; cons: string[] }> = {
  'contiguous': {
    name: 'Contiguous Allocation',
    description: 'Files stored in consecutive blocks',
    color: '#3B82F6',
    pros: ['Fast sequential access', 'Simple to implement', 'Low overhead'],
    cons: ['External fragmentation', 'File size must be known', 'Difficult expansion']
  },
  'linked': {
    name: 'Linked Allocation',
    description: 'Blocks linked via pointers',
    color: '#10B981',
    pros: ['No external fragmentation', 'Files can grow easily', 'No compaction needed'],
    cons: ['Slow random access', 'Pointer overhead', 'Reliability issues']
  },
  'indexed': {
    name: 'Indexed Allocation',
    description: 'Index block stores all addresses',
    color: '#F59E0B',
    pros: ['Fast random access', 'No external fragmentation', 'Easy file growth'],
    cons: ['Index block overhead', 'Max file size limited', 'Extra disk access']
  }
};

export default function FileAllocationVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [blocks, setBlocks] = useState<DiskBlock[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [method, setMethod] = useState<AllocationMethod>('contiguous');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(3);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [accessPath, setAccessPath] = useState<number[]>([]);
  const [currentAccessIndex, setCurrentAccessIndex] = useState(-1);
  const [speed, setSpeed] = useState(1);
  
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 550 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [fileCounter, setFileCounter] = useState(1);

  const initializeDisk = useCallback(() => {
    const newBlocks: DiskBlock[] = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
      newBlocks.push({
        id: i,
        state: 'free',
        fileId: null,
        pointer: null,
        isHighlighted: false,
        isAccessing: false
      });
    }
    setBlocks(newBlocks);
    setFiles([]);
    setSelectedFile(null);
    setAccessPath([]);
    setCurrentAccessIndex(-1);
    setFileCounter(1);
  }, []);

  useEffect(() => {
    initializeDisk();
  }, [initializeDisk]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(700, rect.width),
          height: Math.max(450, rect.height)
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const findContiguousBlocks = (size: number): number[] | null => {
    for (let start = 0; start <= TOTAL_BLOCKS - size; start++) {
      let found = true;
      for (let i = 0; i < size; i++) {
        if (blocks[start + i].state !== 'free') {
          found = false;
          break;
        }
      }
      if (found) {
        return Array.from({ length: size }, (_, i) => start + i);
      }
    }
    return null;
  };

  const findFreeBlocks = (count: number): number[] => {
    const freeBlocks: number[] = [];
    for (let i = 0; i < TOTAL_BLOCKS && freeBlocks.length < count; i++) {
      if (blocks[i].state === 'free') {
        freeBlocks.push(i);
      }
    }
    return freeBlocks;
  };

  const allocateFile = async () => {
    if (!fileName.trim() || fileSize < 1) return;
    
    const freeCount = blocks.filter(b => b.state === 'free').length;
    const requiredBlocks = method === 'indexed' ? fileSize + 1 : fileSize;
    
    if (freeCount < requiredBlocks) {
      alert('Not enough free blocks!');
      return;
    }

    setIsAnimating(true);
    const color = FILE_COLORS[(files.length) % FILE_COLORS.length];
    const fileId = `file_${fileCounter}`;
    setFileCounter(prev => prev + 1);

    let allocatedBlocks: number[] = [];
    let startBlock = -1;
    let indexBlock: number | null = null;

    switch (method) {
      case 'contiguous': {
        const contiguous = findContiguousBlocks(fileSize);
        if (!contiguous) {
          alert('No contiguous space available! External fragmentation.');
          setIsAnimating(false);
          return;
        }
        allocatedBlocks = contiguous;
        startBlock = contiguous[0];
        
        for (let i = 0; i < allocatedBlocks.length; i++) {
          await new Promise(r => setTimeout(r, 200 / speed));
          setBlocks(prev => prev.map((b, idx) => 
            idx === allocatedBlocks[i] 
              ? { ...b, state: 'allocated', fileId, isHighlighted: true }
              : { ...b, isHighlighted: false }
          ));
        }
        break;
      }

      case 'linked': {
        const freeBlocks = findFreeBlocks(fileSize);
        if (freeBlocks.length < fileSize) {
          alert('Not enough free blocks!');
          setIsAnimating(false);
          return;
        }
        
        for (let i = 0; i < freeBlocks.length; i++) {
          const randomIdx = i + Math.floor(Math.random() * (freeBlocks.length - i));
          [freeBlocks[i], freeBlocks[randomIdx]] = [freeBlocks[randomIdx], freeBlocks[i]];
        }
        
        allocatedBlocks = freeBlocks;
        startBlock = allocatedBlocks[0];
        
        for (let i = 0; i < allocatedBlocks.length; i++) {
          await new Promise(r => setTimeout(r, 300 / speed));
          const pointer = i < allocatedBlocks.length - 1 ? allocatedBlocks[i + 1] : null;
          setBlocks(prev => prev.map((b, idx) => 
            idx === allocatedBlocks[i]
              ? { ...b, state: 'allocated', fileId, pointer, isHighlighted: true }
              : { ...b, isHighlighted: false }
          ));
        }
        break;
      }

      case 'indexed': {
        const freeBlocks = findFreeBlocks(fileSize + 1);
        if (freeBlocks.length < fileSize + 1) {
          alert('Not enough free blocks!');
          setIsAnimating(false);
          return;
        }
        
        indexBlock = freeBlocks[0];
        allocatedBlocks = freeBlocks.slice(1);
        startBlock = indexBlock;
        
        await new Promise(r => setTimeout(r, 200 / speed));
        setBlocks(prev => prev.map((b, idx) => 
          idx === indexBlock
            ? { ...b, state: 'index', fileId, isHighlighted: true }
            : { ...b, isHighlighted: false }
        ));
        
        for (let i = 0; i < allocatedBlocks.length; i++) {
          await new Promise(r => setTimeout(r, 200 / speed));
          setBlocks(prev => prev.map((b, idx) => 
            idx === allocatedBlocks[i]
              ? { ...b, state: 'allocated', fileId, isHighlighted: true }
              : idx === indexBlock
              ? { ...b, isHighlighted: true }
              : { ...b, isHighlighted: false }
          ));
        }
        break;
      }
    }

    const newFile: FileEntry = {
      id: fileId,
      name: fileName,
      color,
      blocks: allocatedBlocks,
      startBlock,
      indexBlock,
      size: fileSize,
      method
    };

    setFiles(prev => [...prev, newFile]);
    setFileName('');
    
    await new Promise(r => setTimeout(r, 300));
    setBlocks(prev => prev.map(b => ({ ...b, isHighlighted: false })));
    setIsAnimating(false);
  };

  const deleteFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setIsAnimating(true);
    
    const allBlocks = file.indexBlock !== null 
      ? [file.indexBlock, ...file.blocks]
      : file.blocks;

    for (const blockId of allBlocks) {
      await new Promise(r => setTimeout(r, 150 / speed));
      setBlocks(prev => prev.map((b, idx) => 
        idx === blockId
          ? { ...b, state: 'free', fileId: null, pointer: null, isHighlighted: true }
          : { ...b, isHighlighted: false }
      ));
    }

    await new Promise(r => setTimeout(r, 200));
    setBlocks(prev => prev.map(b => ({ ...b, isHighlighted: false })));
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFile(null);
    setIsAnimating(false);
  };

  const accessFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || isAnimating) return;

    setIsAnimating(true);
    setSelectedFile(fileId);
    setAccessPath([]);
    setCurrentAccessIndex(-1);

    let path: number[] = [];

    switch (file.method) {
      case 'contiguous':
        path = [...file.blocks];
        break;
      
      case 'linked':
        path = [...file.blocks];
        break;
      
      case 'indexed':
        if (file.indexBlock !== null) {
          path = [file.indexBlock, ...file.blocks];
        }
        break;
    }

    setAccessPath(path);

    for (let i = 0; i < path.length; i++) {
      setCurrentAccessIndex(i);
      setBlocks(prev => prev.map((b, idx) => ({
        ...b,
        isAccessing: idx === path[i],
        isHighlighted: path.slice(0, i + 1).includes(idx)
      })));
      await new Promise(r => setTimeout(r, 400 / speed));
    }

    await new Promise(r => setTimeout(r, 500));
    setBlocks(prev => prev.map(b => ({ ...b, isAccessing: false, isHighlighted: false })));
    setCurrentAccessIndex(-1);
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

      const diskX = 50;
      const diskY = 60;
      const blockSize = 55;
      const blockGap = 6;

      ctx.fillStyle = 'rgba(107, 114, 128, 0.05)';
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(diskX - 15, diskY - 30, BLOCKS_PER_ROW * (blockSize + blockGap) + 20, Math.ceil(TOTAL_BLOCKS / BLOCKS_PER_ROW) * (blockSize + blockGap) + 50, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DISK BLOCKS', diskX, diskY - 10);

      const freeCount = blocks.filter(b => b.state === 'free').length;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Free: ${freeCount}/${TOTAL_BLOCKS}`, diskX + 150, diskY - 10);

      blocks.forEach((block, idx) => {
        const row = Math.floor(idx / BLOCKS_PER_ROW);
        const col = idx % BLOCKS_PER_ROW;
        const x = diskX + col * (blockSize + blockGap);
        const y = diskY + row * (blockSize + blockGap) + 10;

        let bgColor = 'rgba(255, 255, 255, 0.03)';
        let borderColor = 'rgba(255, 255, 255, 0.1)';
        
        if (block.state === 'allocated' || block.state === 'index') {
          const file = files.find(f => f.id === block.fileId);
          if (file) {
            bgColor = file.color + '40';
            borderColor = file.color;
          }
        }

        if (block.isAccessing) {
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 20;
        } else if (block.isHighlighted) {
          ctx.shadowColor = borderColor;
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, y, blockSize, blockSize, 6);
        ctx.fill();

        ctx.strokeStyle = block.isAccessing ? '#FFFFFF' : borderColor;
        ctx.lineWidth = block.isHighlighted || block.isAccessing ? 2 : 1;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${idx}`, x + 4, y + 12);

        if (block.state === 'index') {
          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('IDX', x + blockSize - 4, y + 12);
        }

        if (block.state === 'allocated' && block.pointer !== null) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`→${block.pointer}`, x + blockSize / 2, y + blockSize - 6);
        }

        if (block.fileId) {
          const file = files.find(f => f.id === block.fileId);
          if (file) {
            ctx.fillStyle = file.color;
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(file.name.slice(0, 4), x + blockSize / 2, y + blockSize / 2 + 4);
          }
        }
      });

      if (method === 'linked') {
        files.filter(f => f.method === 'linked').forEach(file => {
          ctx.strokeStyle = file.color + '80';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          
          for (let i = 0; i < file.blocks.length - 1; i++) {
            const fromIdx = file.blocks[i];
            const toIdx = file.blocks[i + 1];
            
            const fromRow = Math.floor(fromIdx / BLOCKS_PER_ROW);
            const fromCol = fromIdx % BLOCKS_PER_ROW;
            const toRow = Math.floor(toIdx / BLOCKS_PER_ROW);
            const toCol = toIdx % BLOCKS_PER_ROW;
            
            const fromX = diskX + fromCol * (blockSize + blockGap) + blockSize / 2;
            const fromY = diskY + fromRow * (blockSize + blockGap) + blockSize + 10;
            const toX = diskX + toCol * (blockSize + blockGap) + blockSize / 2;
            const toY = diskY + toRow * (blockSize + blockGap) + 10;
            
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.bezierCurveTo(fromX, fromY + 30, toX, toY - 30, toX, toY);
            ctx.stroke();
            
            const angle = Math.atan2(toY - (toY - 30), toX - toX);
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(toX - 6, toY - 8);
            ctx.lineTo(toX + 6, toY - 8);
            ctx.closePath();
            ctx.fillStyle = file.color + '80';
            ctx.fill();
          }
          ctx.setLineDash([]);
        });
      }

      if (method === 'indexed') {
        files.filter(f => f.method === 'indexed' && f.indexBlock !== null).forEach(file => {
          const indexIdx = file.indexBlock!;
          const indexRow = Math.floor(indexIdx / BLOCKS_PER_ROW);
          const indexCol = indexIdx % BLOCKS_PER_ROW;
          const indexX = diskX + indexCol * (blockSize + blockGap) + blockSize / 2;
          const indexY = diskY + indexRow * (blockSize + blockGap) + blockSize + 10;
          
          ctx.strokeStyle = file.color + '60';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          
          file.blocks.forEach(blockIdx => {
            const blockRow = Math.floor(blockIdx / BLOCKS_PER_ROW);
            const blockCol = blockIdx % BLOCKS_PER_ROW;
            const blockX = diskX + blockCol * (blockSize + blockGap) + blockSize / 2;
            const blockY = diskY + blockRow * (blockSize + blockGap) + 10;
            
            ctx.beginPath();
            ctx.moveTo(indexX, indexY);
            ctx.lineTo(blockX, blockY);
            ctx.stroke();
          });
          ctx.setLineDash([]);
        });
      }

      const filesX = diskX + BLOCKS_PER_ROW * (blockSize + blockGap) + 40;
      const filesY = diskY;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(filesX, filesY - 30, 220, 300, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('FILE DIRECTORY', filesX + 15, filesY - 10);

      if (files.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No files created', filesX + 110, filesY + 50);
      } else {
        files.forEach((file, idx) => {
          const entryY = filesY + idx * 55 + 20;
          
          ctx.fillStyle = selectedFile === file.id ? file.color + '30' : 'rgba(255, 255, 255, 0.03)';
          ctx.beginPath();
          ctx.roundRect(filesX + 10, entryY, 200, 48, 6);
          ctx.fill();
          ctx.strokeStyle = selectedFile === file.id ? file.color : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = file.color;
          ctx.beginPath();
          ctx.arc(filesX + 26, entryY + 24, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(file.name, filesX + 42, entryY + 20);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '9px sans-serif';
          ctx.fillText(`${file.size} blocks | ${METHOD_INFO[file.method].name.split(' ')[0]}`, filesX + 42, entryY + 36);

          if (file.method === 'contiguous') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`Start: ${file.startBlock}`, filesX + 200, entryY + 20);
          } else if (file.method === 'indexed' && file.indexBlock !== null) {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`Idx: ${file.indexBlock}`, filesX + 200, entryY + 20);
          }
        });
      }

      const infoY = filesY + 320;
      const info = METHOD_INFO[method];
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(diskX, infoY, BLOCKS_PER_ROW * (blockSize + blockGap), 80, 8);
      ctx.fill();
      ctx.strokeStyle = info.color + '40';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = info.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(info.name, diskX + 15, infoY + 22);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(info.description, diskX + 15, infoY + 40);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.font = '9px sans-serif';
      ctx.fillText(`✓ ${info.pros[0]}`, diskX + 15, infoY + 58);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.fillText(`✗ ${info.cons[0]}`, diskX + 220, infoY + 58);

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [blocks, files, canvasSize, zoom, panOffset, method, selectedFile]);

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

  const allocatedCount = blocks.filter(b => b.state !== 'free').length;
  const fragmentation = method === 'contiguous' 
    ? blocks.reduce((acc, b, i, arr) => {
        if (b.state === 'free' && (i === 0 || arr[i-1].state !== 'free')) return acc + 1;
        return acc;
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">File Allocation</h1>
              <p className="text-neutral-400 text-sm mt-1">Disk Storage Methods</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: METHOD_INFO[method].color + '20', borderColor: METHOD_INFO[method].color + '50', borderWidth: 1 }}>
              <HardDrive size={14} style={{ color: METHOD_INFO[method].color }} />
              <span className="text-xs" style={{ color: METHOD_INFO[method].color }}>{METHOD_INFO[method].name}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '480px' }}
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
                Allocation Method
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['contiguous', 'linked', 'indexed'] as AllocationMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                        method === m
                          ? 'bg-opacity-30 border-2'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      style={{
                        backgroundColor: method === m ? METHOD_INFO[m].color + '30' : undefined,
                        borderColor: method === m ? METHOD_INFO[m].color : undefined,
                        color: method === m ? METHOD_INFO[m].color : undefined
                      }}
                    >
                      {m === 'contiguous' && <Grid size={14} />}
                      {m === 'linked' && <LinkIcon size={14} />}
                      {m === 'indexed' && <Layers size={14} />}
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">File Name</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    maxLength={8}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">File Size (blocks)</span>
                    <span className="text-white font-mono">{fileSize}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={fileSize}
                    onChange={(e) => setFileSize(Number(e.target.value))}
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
                  onClick={allocateFile}
                  disabled={isAnimating || !fileName.trim()}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
                >
                  <Plus size={16} />
                  Allocate
                </button>
                
                <button
                  onClick={initializeDisk}
                  disabled={isAnimating}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Reset Disk"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-pink-400" />
                Files ({files.length})
              </h3>
              
              {files.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No files created yet</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      className={`p-2 rounded-lg flex items-center justify-between transition-all ${
                        selectedFile === file.id ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: file.color }} />
                        <span className="text-xs text-white">{file.name}</span>
                        <span className="text-xs text-neutral-500">{file.size}b</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => accessFile(file.id)}
                          disabled={isAnimating}
                          className="p-1.5 rounded text-neutral-400 hover:text-green-400 transition-colors disabled:opacity-50"
                          title="Access File"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          disabled={isAnimating}
                          className="p-1.5 rounded text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete File"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-purple-400" />
                Disk Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Used Blocks</div>
                  <div className="text-xl font-bold font-mono text-blue-400">{allocatedCount}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Free Blocks</div>
                  <div className="text-xl font-bold font-mono text-green-400">{TOTAL_BLOCKS - allocatedCount}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Files</div>
                  <div className="text-xl font-bold font-mono text-purple-400">{files.length}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Fragments</div>
                  <div className="text-xl font-bold font-mono text-orange-400">{fragmentation}</div>
                </div>
              </div>

              <div className="mt-3 h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" 
                  style={{ width: `${(allocatedCount / TOTAL_BLOCKS) * 100}%` }}
                />
              </div>
              <div className="text-xs text-neutral-500 text-center mt-1">
                {((allocatedCount / TOTAL_BLOCKS) * 100).toFixed(0)}% disk usage
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                File allocation methods determine how files are stored on disk blocks. 
                Each method has trade-offs between access speed, fragmentation, and overhead.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">Contiguous</span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">Linked</span>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">Indexed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
