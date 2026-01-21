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
  Target,
  Eye,
  EyeOff,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

interface DataPoint {
  id: number;
  x: number;
  y: number;
  label: number;
  isNeighbor: boolean;
  distance: number | null;
  isReached: boolean;
}

interface QueryPoint {
  x: number;
  y: number;
  predictedLabel: number | null;
}

type DistanceMetric = 'euclidean' | 'manhattan';
type ClassificationStatus = 'idle' | 'calculating' | 'selecting' | 'voting' | 'completed';

const CLASS_COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B'];
const CLASS_NAMES = ['Class A', 'Class B', 'Class C', 'Class D'];

export default function KNNVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [queryPoint, setQueryPoint] = useState<QueryPoint | null>(null);
  const [k, setK] = useState(5);
  const [numPoints, setNumPoints] = useState(60);
  const [numClasses, setNumClasses] = useState(3);
  const [distanceMetric, setDistanceMetric] = useState<DistanceMetric>('euclidean');
  const [speed, setSpeed] = useState(1);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<ClassificationStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [waveRadius, setWaveRadius] = useState(0);
  const [showDistanceLines, setShowDistanceLines] = useState(true);
  const [votes, setVotes] = useState<Record<number, number>>({});
  
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const padding = 60;
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState<'point' | 'pan'>('point');

  const generateDataPoints = useCallback(() => {
    const points: DataPoint[] = [];
    const clusterCenters = [
      { x: 0.25, y: 0.25 },
      { x: 0.75, y: 0.25 },
      { x: 0.5, y: 0.75 },
      { x: 0.25, y: 0.75 }
    ].slice(0, numClasses);

    for (let i = 0; i < numPoints; i++) {
      const classLabel = i % numClasses;
      const center = clusterCenters[classLabel];
      const spread = 0.15;
      
      points.push({
        id: i,
        x: center.x + (Math.random() - 0.5) * spread * 2,
        y: center.y + (Math.random() - 0.5) * spread * 2,
        label: classLabel,
        isNeighbor: false,
        distance: null,
        isReached: false
      });
    }
    return points;
  }, [numPoints, numClasses]);

  const calculateDistance = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    if (distanceMetric === 'euclidean') {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    } else {
      return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }
  }, [distanceMetric]);

  const toCanvasCoords = useCallback((x: number, y: number) => {
    const baseX = padding + x * (canvasSize.width - 2 * padding);
    const baseY = canvasSize.height - padding - y * (canvasSize.height - 2 * padding);
    return {
      x: (baseX - canvasSize.width / 2) * zoom + canvasSize.width / 2 + panOffset.x,
      y: (baseY - canvasSize.height / 2) * zoom + canvasSize.height / 2 + panOffset.y
    };
  }, [canvasSize, padding, zoom, panOffset]);

  const toDataCoords = useCallback((canvasX: number, canvasY: number) => {
    const centeredX = (canvasX - panOffset.x - canvasSize.width / 2) / zoom + canvasSize.width / 2;
    const centeredY = (canvasY - panOffset.y - canvasSize.height / 2) / zoom + canvasSize.height / 2;
    return {
      x: (centeredX - padding) / (canvasSize.width - 2 * padding),
      y: 1 - (centeredY - padding) / (canvasSize.height - 2 * padding)
    };
  }, [canvasSize, padding, zoom, panOffset]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setCanvasSize({
            width: Math.max(500, rect.width),
            height: Math.max(450, rect.height)
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

    useEffect(() => {
    setDataPoints(generateDataPoints());
  }, [generateDataPoints]);

  const runStep = useCallback(() => {
    if (!queryPoint) return;

    switch (currentStep) {
      case 0:
        setStatus('calculating');
        setWaveRadius(0);
        setCurrentStep(1);
        break;
        
      case 1:
        setWaveRadius(prev => {
          const newRadius = prev + 0.02 * speed;
          if (newRadius >= 1.5) {
            setDataPoints(points => points.map(p => {
              const dist = calculateDistance(queryPoint, p);
              return { ...p, distance: dist, isReached: true };
            }));
            setCurrentStep(2);
            return 1.5;
          }
          
          setDataPoints(points => points.map(p => {
            const dist = calculateDistance(queryPoint, p);
            const isReached = dist <= newRadius;
            return { ...p, distance: dist, isReached };
          }));
          
          return newRadius;
        });
        break;
        
      case 2:
        setStatus('selecting');
        const sortedPoints = [...dataPoints].sort((a, b) => (a.distance || 0) - (b.distance || 0));
        const neighborIds = sortedPoints.slice(0, k).map(p => p.id);
        
        setDataPoints(points => points.map(p => ({
          ...p,
          isNeighbor: neighborIds.includes(p.id)
        })));
        setCurrentStep(3);
        break;
        
      case 3:
        setStatus('voting');
        const neighbors = dataPoints.filter(p => p.isNeighbor);
        const voteCount: Record<number, number> = {};
        neighbors.forEach(n => {
          voteCount[n.label] = (voteCount[n.label] || 0) + 1;
        });
        setVotes(voteCount);
        setCurrentStep(4);
        break;
        
      case 4:
        setStatus('completed');
        const maxVotes = Math.max(...Object.values(votes));
        const predictedClass = Number(Object.keys(votes).find(key => votes[Number(key)] === maxVotes));
        setQueryPoint(prev => prev ? { ...prev, predictedLabel: predictedClass } : null);
        setIsPlaying(false);
        break;
    }
  }, [queryPoint, currentStep, dataPoints, k, calculateDistance, votes, speed]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(runStep, currentStep === 1 ? 30 : 600 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, runStep, currentStep, speed]);

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

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1 / zoom;
        const gridSize = 40;
        for (let x = padding; x < canvasSize.width - padding; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, padding);
          ctx.lineTo(x, canvasSize.height - padding);
          ctx.stroke();
        }
        for (let y = padding; y < canvasSize.height - padding; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(canvasSize.width - padding, y);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(padding, padding, canvasSize.width - 2 * padding, canvasSize.height - 2 * padding);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = `${10 / zoom}px monospace`;
        for (let i = 0; i <= 10; i++) {
          const x = padding + (i / 10) * (canvasSize.width - 2 * padding);
          ctx.fillText((i / 10).toFixed(1), x - 10, canvasSize.height - padding + 20);
        }
        for (let i = 0; i <= 10; i++) {
          const y = canvasSize.height - padding - (i / 10) * (canvasSize.height - 2 * padding);
          ctx.fillText((i / 10).toFixed(1), padding - 30, y + 4);
        }
        
        ctx.restore();

      if (queryPoint && waveRadius > 0 && status === 'calculating') {
        const qCoords = toCanvasCoords(queryPoint.x, queryPoint.y);
        const maxDim = Math.max(canvasSize.width, canvasSize.height);
        
        for (let i = 3; i >= 0; i--) {
          const r = (waveRadius - i * 0.05) * maxDim;
          if (r > 0) {
            const alpha = 0.15 - i * 0.03;
            ctx.beginPath();
            ctx.arc(qCoords.x, qCoords.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 2 - i * 0.4;
            ctx.stroke();
          }
        }
      }

      if (queryPoint && showDistanceLines && status !== 'idle') {
        const qCoords = toCanvasCoords(queryPoint.x, queryPoint.y);
        dataPoints.forEach(point => {
          if (point.isReached || point.isNeighbor) {
            const pCoords = toCanvasCoords(point.x, point.y);
            const alpha = point.isNeighbor ? 0.5 : 0.15;
            
            ctx.beginPath();
            ctx.moveTo(qCoords.x, qCoords.y);
            ctx.lineTo(pCoords.x, pCoords.y);
            ctx.strokeStyle = point.isNeighbor 
              ? `${CLASS_COLORS[point.label]}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
              : `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = point.isNeighbor ? 2 : 0.5;
            ctx.stroke();
          }
        });
      }

      dataPoints.forEach(point => {
        const coords = toCanvasCoords(point.x, point.y);
        const color = CLASS_COLORS[point.label];
        const baseSize = 8;
        
        let size = baseSize;
        let glowIntensity = 0;
        let opacity = 0.8;
        
        if (point.isNeighbor) {
          size = 12;
          glowIntensity = 20;
          opacity = 1;
        } else if (point.isReached) {
          size = 9;
          glowIntensity = 8;
          opacity = 0.9;
        } else if (status !== 'idle' && !point.isReached) {
          opacity = 0.3;
        }
        
        if (glowIntensity > 0) {
          ctx.shadowColor = color;
          ctx.shadowBlur = glowIntensity;
        }
        
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        if (point.isNeighbor) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
      });

      if (queryPoint) {
        const qCoords = toCanvasCoords(queryPoint.x, queryPoint.y);
        const predictedColor = queryPoint.predictedLabel !== null 
          ? CLASS_COLORS[queryPoint.predictedLabel] 
          : '#FFFFFF';
        
        ctx.shadowColor = predictedColor;
        ctx.shadowBlur = 25;
        
        ctx.beginPath();
        ctx.arc(qCoords.x, qCoords.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = predictedColor;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(qCoords.x, qCoords.y, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = queryPoint.predictedLabel !== null ? '#000' : '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', qCoords.x, qCoords.y);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dataPoints, queryPoint, canvasSize, waveRadius, status, showDistanceLines, toCanvasCoords, zoom, panOffset]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (interactionMode === 'pan') return;
    if (status !== 'idle' && status !== 'completed') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    const coords = toDataCoords(canvasX, canvasY);
    
    if (coords.x >= 0 && coords.x <= 1 && coords.y >= 0 && coords.y <= 1) {
      handleReset();
      setQueryPoint({ x: coords.x, y: coords.y, predictedLabel: null });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (interactionMode === 'pan') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && interactionMode === 'pan') {
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
    setZoom(prev => Math.min(5, Math.max(0.5, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStatus('idle');
    setCurrentStep(0);
    setWaveRadius(0);
    setVotes({});
    setQueryPoint(null);
    setDataPoints(points => points.map(p => ({
      ...p,
      isNeighbor: false,
      distance: null,
      isReached: false
    })));
  };

  const handleNewData = () => {
    handleReset();
    setDataPoints(generateDataPoints());
  };

  const handleRandomQuery = () => {
    handleReset();
    setQueryPoint({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      predictedLabel: null
    });
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return queryPoint ? 'Ready to classify' : 'Click on canvas to place query point';
      case 'calculating': return 'Calculating distance to all points';
      case 'selecting': return `Selecting ${k} nearest neighbors`;
      case 'voting': return 'Majority voting determines class';
      case 'completed': return 'Query point classified!';
      default: return '';
    }
  };

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
              href="/modules?tab=aiml"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">K-Nearest Neighbors</h1>
              <p className="text-neutral-400 text-sm mt-1">Distance-Based Classification</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {CLASS_COLORS.slice(0, numClasses).map((color, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs" style={{ color }}>{CLASS_NAMES[idx]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '500px' }}
          >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className={`w-full h-full ${interactionMode === 'pan' ? 'cursor-grab' : 'cursor-crosshair'} ${isPanning ? 'cursor-grabbing' : ''}`}
              />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                  <button
                    onClick={() => setInteractionMode('point')}
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'point' ? 'bg-purple-500/30 text-purple-400' : 'text-neutral-400 hover:text-white'}`}
                    title="Place Query Point"
                  >
                    <MousePointer2 size={14} />
                  </button>
                  <button
                    onClick={() => setInteractionMode('pan')}
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'pan' ? 'bg-purple-500/30 text-purple-400' : 'text-neutral-400 hover:text-white'}`}
                    title="Pan Mode"
                  >
                    <Move size={14} />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button
                    onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
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
                  {status === 'completed' ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ) : status === 'calculating' || status === 'selecting' || status === 'voting' ? (
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
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
                <Settings size={16} className="text-blue-400" />
                Parameters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">K (Neighbors)</span>
                    <span className="text-white font-mono bg-blue-500/20 px-2 py-0.5 rounded">{k}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Data Points</span>
                    <span className="text-white font-mono">{numPoints}</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={150}
                    step={10}
                    value={numPoints}
                    onChange={(e) => { setNumPoints(Number(e.target.value)); handleNewData(); }}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Classes</span>
                    <span className="text-white font-mono">{numClasses}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={4}
                    value={numClasses}
                    onChange={(e) => { setNumClasses(Number(e.target.value)); handleNewData(); }}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Distance Metric</label>
                  <select
                    value={distanceMetric}
                    onChange={(e) => setDistanceMetric(e.target.value as DistanceMetric)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="euclidean">Euclidean Distance</option>
                    <option value="manhattan">Manhattan Distance</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-neutral-400">Show Distance Lines</span>
                  <button
                    onClick={() => setShowDistanceLines(!showDistanceLines)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      showDistanceLines ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-500'
                    }`}
                  >
                    {showDistanceLines ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (queryPoint && status !== 'completed') setIsPlaying(!isPlaying); }}
                    disabled={!queryPoint || status === 'completed'}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      !queryPoint || status === 'completed'
                        ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                        : isPlaying
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Classify'}
                  </button>
                  
                  <button
                    onClick={runStep}
                    disabled={isPlaying || !queryPoint || status === 'completed'}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                    title="Step"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleRandomQuery}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Target size={14} />
                    Random Query
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-pink-400" />
                Classification Status
              </h3>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">K Value</div>
                  <div className="text-xl font-bold font-mono text-blue-400">{k}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Classes</div>
                  <div className="text-xl font-bold font-mono text-pink-400">{numClasses}</div>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
                <div className="text-xs text-neutral-500 mb-1">Distance Metric</div>
                <div className="text-sm font-semibold capitalize text-emerald-400">
                  {distanceMetric}
                </div>
              </div>
              
              <div className="p-3 rounded-xl border" style={{
                backgroundColor: status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'
              }}>
                <div className="text-xs text-neutral-500 mb-1">Status</div>
                <div className={`text-sm font-semibold capitalize ${
                  status === 'completed' ? 'text-green-400' : 
                  status === 'calculating' || status === 'selecting' || status === 'voting' ? 'text-purple-400' : 'text-neutral-400'
                }`}>
                  {status === 'idle' ? 'Ready' : status}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {Object.keys(votes).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl"
                >
                  <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    Voting Results
                  </h3>
                  
                  <div className="space-y-2">
                    {Object.entries(votes).sort((a, b) => b[1] - a[1]).map(([classLabel, count]) => {
                      const idx = Number(classLabel);
                      const maxVotes = Math.max(...Object.values(votes));
                      const isWinner = count === maxVotes && status === 'completed';
                      
                      return (
                        <div key={classLabel} className={`flex items-center gap-3 p-2 rounded-lg ${isWinner ? 'bg-white/10' : ''}`}>
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ 
                              backgroundColor: CLASS_COLORS[idx],
                              boxShadow: isWinner ? `0 0 12px ${CLASS_COLORS[idx]}` : 'none'
                            }} 
                          />
                          <span className="text-sm flex-1" style={{ color: CLASS_COLORS[idx] }}>
                            {CLASS_NAMES[idx]}
                          </span>
                          <span className={`font-mono font-bold ${isWinner ? 'text-white text-lg' : 'text-neutral-400'}`}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {status === 'completed' && queryPoint?.predictedLabel !== null && (
                    <div className="mt-3 p-3 rounded-xl bg-black/30 text-center">
                      <div className="text-xs text-neutral-500 mb-1">Prediction</div>
                      <div className="text-lg font-bold" style={{ color: CLASS_COLORS[queryPoint.predictedLabel] }}>
                        {CLASS_NAMES[queryPoint.predictedLabel]}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                KNN classifies data by majority vote of nearest neighbors. No training phase — it's distance-based learning.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">Distance</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">K Neighbors</span>
                <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-400">Voting</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
