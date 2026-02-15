'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  HardDrive,
  Settings,
  Zap,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
} from 'lucide-react';
import Link from 'next/link';
import { TheorySection } from '@/components/ui/theory-section';

type DiskAlgorithm = 'fcfs' | 'sstf' | 'scan' | 'cscan';

const ALGORITHM_INFO: Record<DiskAlgorithm, { name: string; color: string; description: string }> = {
  fcfs: { name: 'FCFS', color: '#3B82F6', description: 'First-Come, First-Served' },
  sstf: { name: 'SSTF', color: '#10B981', description: 'Shortest Seek Time First' },
  scan: { name: 'SCAN', color: '#F59E0B', description: 'Elevator algorithm' },
  cscan: { name: 'C-SCAN', color: '#8B5CF6', description: 'Circular SCAN' },
};

const TRACK_COUNT = 200;
const DEFAULT_REQUESTS = [82, 170, 43, 140, 24, 16, 190];

function parseRequests(input: string): number[] {
  return input
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n < TRACK_COUNT);
}

export default function DiskSchedulingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('fcfs');
  const [requestInput, setRequestInput] = useState(DEFAULT_REQUESTS.join(', '));
  const [initialHead, setInitialHead] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [seekSequence, setSeekSequence] = useState<number[]>([]);
  const [totalSeek, setTotalSeek] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 400 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  const requests = parseRequests(requestInput);
  const headPosition = seekSequence[currentStep] ?? initialHead;

  const computeSequence = useCallback(() => {
    const req = [...requests];
    if (req.length === 0) {
      setSeekSequence([initialHead]);
      setTotalSeek(0);
      setCurrentStep(0);
      setIsComplete(true);
      return;
    }
    let seq: number[] = [initialHead];
    let head = initialHead;
    const remaining = new Set(req);

    if (algorithm === 'fcfs') {
      for (const r of req) {
        seq.push(r);
        head = r;
      }
    } else if (algorithm === 'sstf') {
      while (remaining.size > 0) {
        let nearest = -1;
        let minDist = Infinity;
        for (const r of remaining) {
          const d = Math.abs(r - head);
          if (d < minDist) {
            minDist = d;
            nearest = r;
          }
        }
        if (nearest === -1) break;
        remaining.delete(nearest);
        seq.push(nearest);
        head = nearest;
      }
    } else if (algorithm === 'scan' || algorithm === 'cscan') {
      const right = req.filter((r) => r >= head).sort((a, b) => a - b);
      const leftScan = req.filter((r) => r < head).sort((a, b) => b - a); // high to low when returning
      const leftCscan = req.filter((r) => r < head).sort((a, b) => a - b); // low to high after wrap
      if (algorithm === 'scan') {
        seq = [head, ...right, ...(leftScan.length > 0 ? [0, ...leftScan] : [])];
      } else {
        seq = [head, ...right, ...(leftCscan.length > 0 ? [TRACK_COUNT - 1, 0, ...leftCscan] : [])];
      }
    }

    let seek = 0;
    for (let i = 1; i < seq.length; i++) seek += Math.abs(seq[i] - seq[i - 1]);
    setSeekSequence(seq);
    setTotalSeek(seek);
    setCurrentStep(0);
    setIsComplete(seq.length <= 1);
  }, [algorithm, requests, initialHead]);

  useEffect(() => {
    computeSequence();
  }, [computeSequence]);

  useEffect(() => {
    if (!isPlaying || currentStep >= seekSequence.length - 1) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (currentStep >= seekSequence.length - 1 && seekSequence.length > 1) setIsComplete(true);
      return;
    }
    const step = () => {
      setCurrentStep((s) => {
        if (s >= seekSequence.length - 1) {
          setIsPlaying(false);
          setIsComplete(true);
          return s;
        }
        return s + 1;
      });
    };
    const interval = setInterval(step, 800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, seekSequence.length, speed]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: Math.max(800, rect.width), height: Math.max(360, rect.height) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvasSize;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0B0F14';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    const scale = zoom;
    const tx = panOffset.x + width / 2;
    const ty = panOffset.y + height / 2;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);

    const trackHeight = 24;
    const trackWidth = Math.min(width - 80, TRACK_COUNT * 2);
    const startX = (width - trackWidth) / 2 + 40;
    const startY = height / 2 - (TRACK_COUNT * trackHeight) / 2;
    if (startY > 0) {
      for (let t = 0; t < TRACK_COUNT; t++) {
        const x = startX + (t / (TRACK_COUNT - 1)) * trackWidth;
        const y = startY + t * trackHeight;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + trackWidth, y);
        ctx.stroke();
      }
    }

    const headX = startX + (headPosition / (TRACK_COUNT - 1)) * trackWidth;
    const headY = height / 2 - 12;
    ctx.fillStyle = ALGORITHM_INFO[algorithm].color;
    ctx.beginPath();
    ctx.arc(headX, headY + trackHeight / 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(headPosition), headX, headY + trackHeight / 2 + 4);

    const reqSet = new Set(requests);
    reqSet.forEach((r) => {
      const rx = startX + (r / (TRACK_COUNT - 1)) * trackWidth;
      const ry = height / 2 - 12 + trackHeight / 2;
      const visited = seekSequence.indexOf(r) >= 0 && seekSequence.indexOf(r) <= currentStep;
      ctx.fillStyle = visited ? 'rgba(16,185,129,0.6)' : 'rgba(245,158,11,0.8)';
      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Total seek: ${totalSeek}`, 12, height - 12);
    ctx.fillText(`Step: ${currentStep + 1}/${seekSequence.length}`, 12, height - 28);
  }, [canvasSize, zoom, panOffset, headPosition, currentStep, seekSequence, requests, totalSeek, algorithm]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.5, z - e.deltaY * 0.002)));
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset((p) => ({
      x: p.x + e.clientX - lastMousePos.x,
      y: p.y + e.clientY - lastMousePos.y,
    }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setIsPanning(false);
  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Disk Scheduling</h1>
              <p className="text-neutral-400 text-sm mt-1">FCFS, SSTF, SCAN, C-SCAN</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{
                backgroundColor: ALGORITHM_INFO[algorithm].color + '20',
                borderColor: ALGORITHM_INFO[algorithm].color + '50',
              }}
            >
              <HardDrive size={14} style={{ color: ALGORITHM_INFO[algorithm].color }} />
              <span className="text-xs" style={{ color: ALGORITHM_INFO[algorithm].color }}>
                {ALGORITHM_INFO[algorithm].name}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <TheorySection title="Theory: Disk Scheduling" defaultOpen={false}>
            <p>
              <strong>Disk scheduling</strong> algorithms determine the order in which I/O requests are served to minimize seek time.
            </p>
            <p>
              <strong>FCFS:</strong> Services requests in the order they arrive. Simple but can lead to high seek times (e.g. wild swing).
            </p>
            <p>
              <strong>SSTF:</strong> Picks the request with the minimum seek time from the current head position. Can cause starvation.
            </p>
            <p>
              <strong>SCAN (Elevator):</strong> Head moves in one direction to the end, then reverses. Fair and efficient.
            </p>
            <p>
              <strong>C-SCAN:</strong> Like SCAN but wraps from end to start without serving on the return; more uniform wait times.
            </p>
          </TheorySection>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div
            ref={containerRef}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '380px' }}
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
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/60 border border-white/10">
                <button
                  onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}
                  className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                >
                  <ZoomOut size={14} />
                </button>
                <button onClick={resetView} className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors">
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-black/60 border border-white/10">
                <span className="text-xs text-neutral-400">{Math.round(zoom * 100)}%</span>
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
                <Settings size={16} className="text-amber-400" />
                Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Algorithm</label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as DiskAlgorithm)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  >
                    {(['fcfs', 'sstf', 'scan', 'cscan'] as const).map((alg) => (
                      <option key={alg} value={alg}>
                        {ALGORITHM_INFO[alg].name} – {ALGORITHM_INFO[alg].description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Initial head position (0–199)</label>
                  <input
                    type="number"
                    min={0}
                    max={TRACK_COUNT - 1}
                    value={initialHead}
                    onChange={(e) => setInitialHead(Math.max(0, Math.min(TRACK_COUNT - 1, parseInt(e.target.value, 10) || 0)))}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Request queue (comma-separated, 0–199)</label>
                  <input
                    type="text"
                    value={requestInput}
                    onChange={(e) => setRequestInput(e.target.value)}
                    placeholder="82, 170, 43, 140, 24..."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-white/30"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { computeSequence(); setIsPlaying(false); setCurrentStep(0); setIsComplete(false); }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="Recompute"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    disabled={seekSequence.length <= 1}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-400">Speed</label>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-xs text-neutral-400">{speed}x</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Total seek time</span>
                <span className="font-mono text-white">{totalSeek}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Sequence length</span>
                <span className="font-mono text-white">{seekSequence.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
