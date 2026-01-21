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
  Target,
  Activity,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  MousePointer2
} from 'lucide-react';
import Link from 'next/link';

interface Point {
  id: number;
  x: number;
  y: number;
  clusterId: number | null;
  prevClusterId: number | null;
}

interface Centroid {
  id: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

type AlgorithmStatus = 'idle' | 'initializing' | 'assigning' | 'updating' | 'converged';

const CLUSTER_COLORS = [
  { main: '#3B82F6', glow: 'rgba(59, 130, 246, 0.5)', bg: 'rgba(59, 130, 246, 0.15)' },
  { main: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)', bg: 'rgba(139, 92, 246, 0.15)' },
  { main: '#06B6D4', glow: 'rgba(6, 182, 212, 0.5)', bg: 'rgba(6, 182, 212, 0.15)' },
  { main: '#10B981', glow: 'rgba(16, 185, 129, 0.5)', bg: 'rgba(16, 185, 129, 0.15)' },
  { main: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', bg: 'rgba(245, 158, 11, 0.15)' },
  { main: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)', bg: 'rgba(239, 68, 68, 0.15)' },
];

export default function KMeansVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [numPoints, setNumPoints] = useState(150);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [status, setStatus] = useState<AlgorithmStatus>('idle');
  const [showLines, setShowLines] = useState(false);
  const [variance, setVariance] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState<'point' | 'pan'>('point');

  const generatePoints = useCallback((count: number) => {
    const newPoints: Point[] = [];
    const padding = 60;
    for (let i = 0; i < count; i++) {
      newPoints.push({
        id: i,
        x: padding + Math.random() * (canvasSize.width - padding * 2),
        y: padding + Math.random() * (canvasSize.height - padding * 2),
        clusterId: null,
        prevClusterId: null,
      });
    }
    return newPoints;
  }, [canvasSize]);

  const initializeCentroids = useCallback((numClusters: number, currentPoints: Point[]) => {
    if (currentPoints.length === 0) return [];
    const newCentroids: Centroid[] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < numClusters; i++) {
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * currentPoints.length);
      } while (usedIndices.has(randomIndex));
      usedIndices.add(randomIndex);
      
      newCentroids.push({
        id: i,
        x: currentPoints[randomIndex].x,
        y: currentPoints[randomIndex].y,
        prevX: currentPoints[randomIndex].x,
        prevY: currentPoints[randomIndex].y,
      });
    }
    return newCentroids;
  }, []);

  const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const assignPointsToClusters = useCallback((currentPoints: Point[], currentCentroids: Centroid[]) => {
    return currentPoints.map(point => {
      let minDist = Infinity;
      let closestCentroid = 0;
      
      currentCentroids.forEach((centroid, idx) => {
        const dist = distance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = idx;
        }
      });
      
      return {
        ...point,
        prevClusterId: point.clusterId,
        clusterId: closestCentroid,
      };
    });
  }, []);

  const updateCentroids = useCallback((currentPoints: Point[], currentCentroids: Centroid[]) => {
    return currentCentroids.map((centroid, idx) => {
      const clusterPoints = currentPoints.filter(p => p.clusterId === idx);
      if (clusterPoints.length === 0) return centroid;
      
      const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
      const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
      
      return {
        ...centroid,
        prevX: centroid.x,
        prevY: centroid.y,
        x: avgX,
        y: avgY,
      };
    });
  }, []);

  const calculateVariance = useCallback((currentPoints: Point[], currentCentroids: Centroid[]) => {
    let totalVariance = 0;
    currentPoints.forEach(point => {
      if (point.clusterId !== null) {
        const centroid = currentCentroids[point.clusterId];
        totalVariance += Math.pow(distance(point, centroid), 2);
      }
    });
    return totalVariance / currentPoints.length;
  }, []);

  const hasConverged = useCallback((currentCentroids: Centroid[]) => {
    const threshold = 0.5;
    return currentCentroids.every(c => 
      distance({ x: c.x, y: c.y }, { x: c.prevX, y: c.prevY }) < threshold
    );
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(400, rect.width),
          height: Math.max(400, rect.height),
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const newPoints = generatePoints(numPoints);
    setPoints(newPoints);
    const newCentroids = initializeCentroids(k, newPoints);
    setCentroids(newCentroids);
    setIteration(0);
    setStatus('idle');
    setIsPlaying(false);
  }, [numPoints, k, generatePoints, initializeCentroids, canvasSize]);

  const runStep = useCallback(() => {
    if (status === 'converged') return;

    if (status === 'idle' || status === 'initializing') {
      setStatus('assigning');
      const assigned = assignPointsToClusters(points, centroids);
      setPoints(assigned);
      setVariance(calculateVariance(assigned, centroids));
    } else if (status === 'assigning') {
      setStatus('updating');
      const updated = updateCentroids(points, centroids);
      setCentroids(updated);
      setIteration(prev => prev + 1);
      
      if (hasConverged(updated) || iteration >= 50) {
        setStatus('converged');
        setIsPlaying(false);
      }
    } else if (status === 'updating') {
      setStatus('assigning');
      const assigned = assignPointsToClusters(points, centroids);
      setPoints(assigned);
      setVariance(calculateVariance(assigned, centroids));
    }
  }, [status, points, centroids, assignPointsToClusters, updateCentroids, calculateVariance, hasConverged, iteration]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      runStep();
    }, 1000 / speed);
    
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

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1 / zoom;
        const gridSize = 40;
        for (let x = 0; x < canvasSize.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasSize.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvasSize.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasSize.width, y);
          ctx.stroke();
        }

      if (showLines && centroids.length > 0) {
        points.forEach(point => {
          if (point.clusterId !== null) {
            const centroid = centroids[point.clusterId];
            const color = CLUSTER_COLORS[point.clusterId % CLUSTER_COLORS.length];
            ctx.strokeStyle = `${color.main}20`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(centroid.x, centroid.y);
            ctx.stroke();
          }
        });
      }

      points.forEach(point => {
        const colorIdx = point.clusterId !== null ? point.clusterId % CLUSTER_COLORS.length : 0;
        const color = CLUSTER_COLORS[colorIdx];
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = point.clusterId !== null ? `${color.main}15` : 'rgba(255, 255, 255, 0.05)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = point.clusterId !== null ? color.main : 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        
        if (point.clusterId !== null) {
          ctx.shadowColor = color.glow;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      centroids.forEach((centroid, idx) => {
        const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
        
        ctx.shadowColor = color.glow;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = `${color.main}30`;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = color.main;
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        const size = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centroid.x - size, centroid.y);
        ctx.lineTo(centroid.x + size, centroid.y);
        ctx.moveTo(centroid.x, centroid.y - size);
        ctx.lineTo(centroid.x, centroid.y + size);
        ctx.stroke();

        if (status === 'converged') {
          ctx.shadowColor = color.glow;
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.arc(centroid.x, centroid.y, 25, 0, Math.PI * 2);
          ctx.strokeStyle = `${color.main}60`;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
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
    }, [points, centroids, canvasSize, showLines, status, zoom, panOffset]);

  const handleReset = () => {
    setIsPlaying(false);
    const newPoints = generatePoints(numPoints);
    setPoints(newPoints);
    const newCentroids = initializeCentroids(k, newPoints);
    setCentroids(newCentroids);
    setIteration(0);
    setStatus('idle');
    setVariance(0);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, {
      id: prev.length,
      x,
      y,
      clusterId: null,
      prevClusterId: null,
    }]);
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

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Ready to start';
      case 'initializing': return 'Initializing...';
      case 'assigning': return 'Assigning points to nearest centroid...';
      case 'updating': return 'Updating centroid positions (mean calculation)';
      case 'converged': return 'Clusters have converged';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]" />
      
      <div className="relative z-10 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link 
              href="/modules?tab=aiml"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">K-Means Clustering</h1>
              <p className="text-neutral-400 text-sm mt-1">Interactive Algorithm Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {CLUSTER_COLORS.slice(0, k).map((color, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{ 
                  backgroundColor: color.bg,
                  borderColor: `${color.main}40`
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.main }}
                />
                <span className="text-xs font-medium" style={{ color: color.main }}>
                  Cluster {idx + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ minHeight: '600px' }}
          >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={interactionMode === 'point' ? handleCanvasClick : undefined}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className={`w-full h-full ${interactionMode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
              />
              
              <AnimatePresence>
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-4 left-4 right-4"
                >
                  <div className={`px-4 py-3 rounded-xl backdrop-blur-xl border ${
                    status === 'converged' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      {status === 'converged' ? (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      ) : status !== 'idle' ? (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-neutral-500" />
                      )}
                      <span className={`text-sm ${status === 'converged' ? 'text-green-400' : 'text-neutral-300'}`}>
                        {getStatusText()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10">
                  <button
                    onClick={() => setInteractionMode('point')}
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'point' ? 'bg-blue-500/30 text-blue-400' : 'text-neutral-400 hover:text-white'}`}
                    title="Add Points"
                  >
                    <MousePointer2 size={14} />
                  </button>
                  <button
                    onClick={() => setInteractionMode('pan')}
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'pan' ? 'bg-blue-500/30 text-blue-400' : 'text-neutral-400 hover:text-white'}`}
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
            </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-4"
          >
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Layers size={16} className="text-blue-400" />
                Controls
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Number of Clusters (K)</span>
                    <span className="text-white font-mono">{k}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Data Points</span>
                    <span className="text-white font-mono">{numPoints}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={300}
                    step={10}
                    value={numPoints}
                    onChange={(e) => setNumPoints(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-neutral-400">Show Distance Lines</span>
                  <button
                    onClick={() => setShowLines(!showLines)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      showLines ? 'bg-blue-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      showLines ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={status === 'converged'}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    status === 'converged'
                      ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <button
                  onClick={runStep}
                  disabled={isPlaying || status === 'converged'}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-purple-400" />
                Live Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-neutral-500 mb-1">Iteration</div>
                  <div className="text-2xl font-bold font-mono text-white">{iteration}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-neutral-500 mb-1">Clusters</div>
                  <div className="text-2xl font-bold font-mono text-white">{k}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 col-span-2">
                  <div className="text-xs text-neutral-500 mb-1">Within-Cluster Variance</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {variance > 0 ? variance.toFixed(2) : '—'}
                  </div>
                </div>

                <div className="p-3 rounded-xl col-span-2 border" style={{
                  backgroundColor: status === 'converged' ? 'rgba(16, 185, 129, 0.1)' : 
                                   status === 'idle' ? 'rgba(255, 255, 255, 0.05)' : 
                                   'rgba(59, 130, 246, 0.1)',
                  borderColor: status === 'converged' ? 'rgba(16, 185, 129, 0.3)' : 
                               status === 'idle' ? 'rgba(255, 255, 255, 0.1)' : 
                               'rgba(59, 130, 246, 0.3)'
                }}>
                  <div className="text-xs text-neutral-500 mb-1">Status</div>
                  <div className={`text-sm font-semibold capitalize ${
                    status === 'converged' ? 'text-green-400' : 
                    status === 'idle' ? 'text-neutral-400' : 
                    'text-blue-400'
                  }`}>
                    {status === 'idle' ? 'Ready' : status}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                K-Means groups data by minimizing distance to cluster centroids. 
                Each point is assigned to its nearest centroid, then centroids 
                move to the mean position of their cluster.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-black/30 font-mono text-xs text-neutral-500">
                μ<sub>k</sub> = (1/|C<sub>k</sub>|) Σ x<sub>i</sub>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
