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
  TrendingUp,
  Settings,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  MousePointer2
} from 'lucide-react';
import Link from 'next/link';

interface DataPoint {
  id: number;
  x: number;
  y: number;
}

interface LossPoint {
  iteration: number;
  loss: number;
}

type AlgorithmStatus = 'idle' | 'initializing' | 'training' | 'converged';

export default function LinearRegressionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<DataPoint[]>([]);
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(0);
  const [targetSlope, setTargetSlope] = useState(0);
  const [targetIntercept, setTargetIntercept] = useState(0);
  const [numPoints, setNumPoints] = useState(80);
  const [learningRate, setLearningRate] = useState(0.01);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [mse, setMse] = useState(0);
  const [status, setStatus] = useState<AlgorithmStatus>('idle');
  const [showErrors, setShowErrors] = useState(true);
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [prevMse, setPrevMse] = useState(0);
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState<'point' | 'pan'>('point');

  const dataRange = { minX: 50, maxX: 750, minY: 50, maxY: 550 };

  const generatePoints = useCallback((count: number) => {
    const newPoints: DataPoint[] = [];
    const trueSlope = 0.6 + Math.random() * 0.4;
    const trueIntercept = 100 + Math.random() * 100;
    
    for (let i = 0; i < count; i++) {
      const x = dataRange.minX + Math.random() * (dataRange.maxX - dataRange.minX);
      const noise = (Math.random() - 0.5) * 120;
      const y = trueSlope * x + trueIntercept + noise;
      const clampedY = Math.max(dataRange.minY, Math.min(dataRange.maxY, y));
      
      newPoints.push({ id: i, x, y: clampedY });
    }
    return newPoints;
  }, []);

  const calculateMSE = useCallback((pts: DataPoint[], m: number, b: number) => {
    if (pts.length === 0) return 0;
    const sumSquaredError = pts.reduce((sum, p) => {
      const predicted = m * p.x + b;
      return sum + Math.pow(p.y - predicted, 2);
    }, 0);
    return sumSquaredError / pts.length;
  }, []);

  const computeGradients = useCallback((pts: DataPoint[], m: number, b: number) => {
    if (pts.length === 0) return { dM: 0, dB: 0 };
    
    let dM = 0;
    let dB = 0;
    
    pts.forEach(p => {
      const predicted = m * p.x + b;
      const error = predicted - p.y;
      dM += error * p.x;
      dB += error;
    });
    
    dM = (2 * dM) / pts.length;
    dB = (2 * dB) / pts.length;
    
    return { dM, dB };
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
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    container.addEventListener('wheel', preventScroll, { passive: false });
    return () => container.removeEventListener('wheel', preventScroll);
  }, []);

  useEffect(() => {
    const newPoints = generatePoints(numPoints);
    setPoints(newPoints);
    const initSlope = (Math.random() - 0.5) * 0.5;
    const initIntercept = Math.random() * 300 + 100;
    setSlope(initSlope);
    setIntercept(initIntercept);
    setTargetSlope(initSlope);
    setTargetIntercept(initIntercept);
    setIteration(0);
    setStatus('idle');
    setIsPlaying(false);
    setLossHistory([]);
    setMse(calculateMSE(newPoints, initSlope, initIntercept));
  }, [numPoints, generatePoints, calculateMSE]);

  const runStep = useCallback(() => {
    if (status === 'converged') return;

    if (status === 'idle') {
      setStatus('training');
    }

    const { dM, dB } = computeGradients(points, targetSlope, targetIntercept);
    
    const newSlope = targetSlope - learningRate * dM * 0.001;
    const newIntercept = targetIntercept - learningRate * dB;
    
    setTargetSlope(newSlope);
    setTargetIntercept(newIntercept);
    
    const newMse = calculateMSE(points, newSlope, newIntercept);
    setPrevMse(mse);
    setMse(newMse);
    setIteration(prev => prev + 1);
    
    setLossHistory(prev => [...prev.slice(-50), { iteration: iteration + 1, loss: newMse }]);

    if (iteration > 10 && Math.abs(mse - newMse) < 0.01) {
      setStatus('converged');
      setIsPlaying(false);
    }
  }, [status, points, targetSlope, targetIntercept, learningRate, computeGradients, calculateMSE, mse, iteration]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      runStep();
    }, 100 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, runStep, speed]);

  useEffect(() => {
    const lerpFactor = 0.15;
    const animateParams = () => {
      setSlope(prev => prev + (targetSlope - prev) * lerpFactor);
      setIntercept(prev => prev + (targetIntercept - prev) * lerpFactor);
    };
    
    const interval = setInterval(animateParams, 16);
    return () => clearInterval(interval);
  }, [targetSlope, targetIntercept]);

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

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.moveTo(40, canvasSize.height - 40);
        ctx.lineTo(canvasSize.width - 20, canvasSize.height - 40);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, canvasSize.height - 40);
        ctx.stroke();

      if (showErrors && points.length > 0) {
        points.forEach(point => {
          const predicted = slope * point.x + intercept;
          const errorMagnitude = Math.abs(point.y - predicted);
          const maxError = 200;
          const alpha = Math.min(0.6, errorMagnitude / maxError * 0.6);
          
          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(point.x, predicted);
          ctx.stroke();
        });
      }

      const progress = status === 'converged' ? 1 : Math.min(1, iteration / 100);
      const lineColor = `rgb(${Math.round(100 + 59 * progress)}, ${Math.round(100 + 130 * progress)}, ${Math.round(100 + 146 * progress)})`;
      
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = status === 'converged' ? 3 : 2;
      
      if (status === 'converged') {
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.shadowBlur = 15;
      }
      
      ctx.beginPath();
      const x1 = 0;
      const y1 = slope * x1 + intercept;
      const x2 = canvasSize.width;
      const y2 = slope * x2 + intercept;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.fill();
        
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
    }, [points, slope, intercept, canvasSize, showErrors, status, iteration, zoom, panOffset]);

  useEffect(() => {
    const lossCanvas = lossCanvasRef.current;
    if (!lossCanvas || lossHistory.length < 2) return;
    
    const ctx = lossCanvas.getContext('2d');
    if (!ctx) return;

    const width = lossCanvas.width;
    const height = lossCanvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (lossHistory.length < 2) return;
    
    const maxLoss = Math.max(...lossHistory.map(l => l.loss), 1);
    const minLoss = Math.min(...lossHistory.map(l => l.loss), 0);
    const range = maxLoss - minLoss || 1;
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    lossHistory.forEach((point, idx) => {
      const x = (idx / (lossHistory.length - 1)) * width;
      const y = height - ((point.loss - minLoss) / range) * (height - 10) - 5;
      
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    lossHistory.forEach((point, idx) => {
      const x = (idx / (lossHistory.length - 1)) * width;
      const y = height - ((point.loss - minLoss) / range) * (height - 10) - 5;
      
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }, [lossHistory]);

  const handleReset = () => {
    setIsPlaying(false);
    const newPoints = generatePoints(numPoints);
    setPoints(newPoints);
    const initSlope = (Math.random() - 0.5) * 0.5;
    const initIntercept = Math.random() * 300 + 100;
    setSlope(initSlope);
    setIntercept(initIntercept);
    setTargetSlope(initSlope);
    setTargetIntercept(initIntercept);
    setIteration(0);
    setStatus('idle');
    setLossHistory([]);
    setMse(calculateMSE(newPoints, initSlope, initIntercept));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, { id: prev.length, x, y }]);
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
      case 'idle': return 'Ready to start training';
      case 'initializing': return 'Initializing parameters...';
      case 'training': return 'Updating parameters using gradient descent';
      case 'converged': return 'Model converged to best-fit line';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_50%)]" />
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Linear Regression</h1>
              <p className="text-neutral-400 text-sm mt-1">Gradient Descent Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-cyan-500/10 border-cyan-500/30"
            >
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-xs font-medium text-cyan-400">Data Points</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-500/10 border-blue-500/30"
            >
              <div className="w-6 h-0.5 rounded bg-blue-500" />
              <span className="text-xs font-medium text-blue-400">Regression Line</span>
            </motion.div>
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
                      ) : status === 'training' ? (
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
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'point' ? 'bg-cyan-500/30 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
                    title="Add Points"
                  >
                    <MousePointer2 size={14} />
                  </button>
                  <button
                    onClick={() => setInteractionMode('pan')}
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'pan' ? 'bg-cyan-500/30 text-cyan-400' : 'text-neutral-400 hover:text-white'}`}
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
                <Settings size={16} className="text-cyan-400" />
                Controls
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Data Points</span>
                    <span className="text-white font-mono">{numPoints}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={150}
                    step={10}
                    value={numPoints}
                    onChange={(e) => setNumPoints(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Learning Rate</span>
                    <span className="text-white font-mono">{learningRate.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
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
                    max={5}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-neutral-400">Show Error Lines</span>
                  <button
                    onClick={() => setShowErrors(!showErrors)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      showErrors ? 'bg-red-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      showErrors ? 'translate-x-5' : 'translate-x-0.5'
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
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Train'}
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
                  <div className="text-xs text-neutral-500 mb-1">MSE</div>
                  <div className="text-lg font-bold font-mono text-white truncate">
                    {mse > 0 ? mse.toFixed(1) : '—'}
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Slope (m)</div>
                  <div className="text-lg font-bold font-mono text-cyan-400 truncate">
                    {slope.toFixed(3)}
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Intercept (b)</div>
                  <div className="text-lg font-bold font-mono text-purple-400 truncate">
                    {intercept.toFixed(1)}
                  </div>
                </div>

                <div className="p-3 rounded-xl col-span-2 border" style={{
                  backgroundColor: status === 'converged' ? 'rgba(16, 185, 129, 0.1)' : 
                                   status === 'idle' ? 'rgba(255, 255, 255, 0.05)' : 
                                   'rgba(6, 182, 212, 0.1)',
                  borderColor: status === 'converged' ? 'rgba(16, 185, 129, 0.3)' : 
                               status === 'idle' ? 'rgba(255, 255, 255, 0.1)' : 
                               'rgba(6, 182, 212, 0.3)'
                }}>
                  <div className="text-xs text-neutral-500 mb-1">Status</div>
                  <div className={`text-sm font-semibold capitalize ${
                    status === 'converged' ? 'text-green-400' : 
                    status === 'idle' ? 'text-neutral-400' : 
                    'text-cyan-400'
                  }`}>
                    {status === 'idle' ? 'Ready' : status}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-400" />
                Loss History
              </h3>
              <div className="relative h-24 rounded-lg overflow-hidden bg-black/30">
                <canvas
                  ref={lossCanvasRef}
                  width={260}
                  height={96}
                  className="w-full h-full"
                />
                {lossHistory.length < 2 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                    Start training to see loss curve
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Linear regression finds a line that minimizes squared error. 
                Gradient descent iteratively adjusts slope and intercept to reduce loss.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-black/30 font-mono text-xs text-neutral-500 text-center">
                y = mx + b
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
