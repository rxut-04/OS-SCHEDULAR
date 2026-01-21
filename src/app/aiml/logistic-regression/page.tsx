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
  Target,
  Settings,
  Eye,
  EyeOff,
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
  label: number;
  predictedProb?: number;
}

interface LossPoint {
  iteration: number;
  loss: number;
}

type AlgorithmStatus = 'idle' | 'initializing' | 'training' | 'converged';

export default function LogisticRegressionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<DataPoint[]>([]);
  const [weights, setWeights] = useState<number[]>([0, 0, 0]);
  const [targetWeights, setTargetWeights] = useState<number[]>([0, 0, 0]);
  const [numPoints, setNumPoints] = useState(100);
  const [learningRate, setLearningRate] = useState(0.1);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [logLoss, setLogLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [status, setStatus] = useState<AlgorithmStatus>('idle');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [threshold, setThreshold] = useState(0.5);
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [confusion, setConfusion] = useState({ tp: 0, tn: 0, fp: 0, fn: 0 });
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState<'point' | 'pan'>('point');

  const sigmoid = (z: number): number => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));

  const predict = (x: number, y: number, w: number[]): number => {
    const z = w[0] + w[1] * x + w[2] * y;
    return sigmoid(z);
  };

  const generatePoints = useCallback((count: number) => {
    const newPoints: DataPoint[] = [];
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    for (let i = 0; i < count; i++) {
      const label = Math.random() > 0.5 ? 1 : 0;
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 150;
      
      let x: number, y: number;
      if (label === 0) {
        x = centerX - 100 + (Math.random() - 0.5) * 200 + Math.cos(angle) * radius * 0.3;
        y = centerY + (Math.random() - 0.5) * 300;
      } else {
        x = centerX + 100 + (Math.random() - 0.5) * 200 + Math.cos(angle) * radius * 0.3;
        y = centerY + (Math.random() - 0.5) * 300;
      }
      
      x = Math.max(50, Math.min(canvasSize.width - 50, x));
      y = Math.max(50, Math.min(canvasSize.height - 50, y));
      
      newPoints.push({ id: i, x, y, label });
    }
    return newPoints;
  }, [canvasSize]);

  const calculateLogLoss = useCallback((pts: DataPoint[], w: number[]) => {
    if (pts.length === 0) return 0;
    let loss = 0;
    pts.forEach(p => {
      const prob = predict(p.x / canvasSize.width, p.y / canvasSize.height, w);
      const clampedProb = Math.max(1e-10, Math.min(1 - 1e-10, prob));
      loss -= p.label * Math.log(clampedProb) + (1 - p.label) * Math.log(1 - clampedProb);
    });
    return loss / pts.length;
  }, [canvasSize]);

  const calculateAccuracy = useCallback((pts: DataPoint[], w: number[], thresh: number) => {
    if (pts.length === 0) return 0;
    let correct = 0;
    let tp = 0, tn = 0, fp = 0, fn = 0;
    
    pts.forEach(p => {
      const prob = predict(p.x / canvasSize.width, p.y / canvasSize.height, w);
      const predicted = prob >= thresh ? 1 : 0;
      if (predicted === p.label) correct++;
      
      if (p.label === 1 && predicted === 1) tp++;
      else if (p.label === 0 && predicted === 0) tn++;
      else if (p.label === 0 && predicted === 1) fp++;
      else fn++;
    });
    
    setConfusion({ tp, tn, fp, fn });
    return correct / pts.length;
  }, [canvasSize]);

  const computeGradients = useCallback((pts: DataPoint[], w: number[]) => {
    if (pts.length === 0) return [0, 0, 0];
    
    let dW0 = 0, dW1 = 0, dW2 = 0;
    
    pts.forEach(p => {
      const xNorm = p.x / canvasSize.width;
      const yNorm = p.y / canvasSize.height;
      const prob = predict(xNorm, yNorm, w);
      const error = prob - p.label;
      
      dW0 += error;
      dW1 += error * xNorm;
      dW2 += error * yNorm;
    });
    
    return [dW0 / pts.length, dW1 / pts.length, dW2 / pts.length];
  }, [canvasSize]);

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
    const initW = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2];
    setWeights(initW);
    setTargetWeights(initW);
    setIteration(0);
    setStatus('idle');
    setIsPlaying(false);
    setLossHistory([]);
    setLogLoss(calculateLogLoss(newPoints, initW));
    setAccuracy(calculateAccuracy(newPoints, initW, threshold));
  }, [numPoints, generatePoints, calculateLogLoss, calculateAccuracy, threshold]);

  const runStep = useCallback(() => {
    if (status === 'converged') return;

    if (status === 'idle') {
      setStatus('training');
    }

    const grads = computeGradients(points, targetWeights);
    
    const newWeights = [
      targetWeights[0] - learningRate * grads[0],
      targetWeights[1] - learningRate * grads[1],
      targetWeights[2] - learningRate * grads[2],
    ];
    
    setTargetWeights(newWeights);
    
    const newLoss = calculateLogLoss(points, newWeights);
    const newAcc = calculateAccuracy(points, newWeights, threshold);
    
    setLogLoss(newLoss);
    setAccuracy(newAcc);
    setIteration(prev => prev + 1);
    
    setLossHistory(prev => [...prev.slice(-50), { iteration: iteration + 1, loss: newLoss }]);

    if (iteration > 20 && Math.abs(logLoss - newLoss) < 0.0001) {
      setStatus('converged');
      setIsPlaying(false);
    }
  }, [status, points, targetWeights, learningRate, computeGradients, calculateLogLoss, calculateAccuracy, threshold, logLoss, iteration]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      runStep();
    }, 100 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, runStep, speed]);

  useEffect(() => {
    const lerpFactor = 0.12;
    const animateParams = () => {
      setWeights(prev => [
        prev[0] + (targetWeights[0] - prev[0]) * lerpFactor,
        prev[1] + (targetWeights[1] - prev[1]) * lerpFactor,
        prev[2] + (targetWeights[2] - prev[2]) * lerpFactor,
      ]);
    };
    
    const interval = setInterval(animateParams, 16);
    return () => clearInterval(interval);
  }, [targetWeights]);

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

        if (showHeatmap) {
        const resolution = 20;
        const cellWidth = canvasSize.width / resolution;
        const cellHeight = canvasSize.height / resolution;
        
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = (i + 0.5) / resolution;
            const y = (j + 0.5) / resolution;
            const prob = predict(x, y, weights);
            
            const r = Math.round(59 + prob * 160);
            const g = Math.round(130 - prob * 80);
            const b = Math.round(246 - prob * 50);
            const alpha = 0.15 + Math.abs(prob - 0.5) * 0.3;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth + 1, cellHeight + 1);
          }
        }
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
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

      const progress = status === 'converged' ? 1 : Math.min(1, iteration / 100);
      const boundaryAlpha = 0.4 + progress * 0.4;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${boundaryAlpha})`;
      ctx.lineWidth = status === 'converged' ? 3 : 2;
      
      if (status === 'converged') {
        ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
        ctx.shadowBlur = 20;
      }
      
      const w0 = weights[0], w1 = weights[1], w2 = weights[2];
      
      if (Math.abs(w2) > 0.001) {
        ctx.beginPath();
        const y1 = ((-w0 - w1 * 0) / w2) * canvasSize.height;
        const y2 = ((-w0 - w1 * 1) / w2) * canvasSize.height;
        ctx.moveTo(0, y1);
        ctx.lineTo(canvasSize.width, y2);
        ctx.stroke();
      } else if (Math.abs(w1) > 0.001) {
        const x = (-w0 / w1) * canvasSize.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      points.forEach(point => {
        const prob = predict(point.x / canvasSize.width, point.y / canvasSize.height, weights);
        const predicted = prob >= threshold ? 1 : 0;
        const isMisclassified = predicted !== point.label;
        
        const baseColor = point.label === 0 ? { r: 59, g: 130, b: 246 } : { r: 236, g: 72, b: 153 };
        
        if (isMisclassified && status === 'training') {
          const pulse = 0.5 + Math.sin(Date.now() / 200) * 0.3;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 12 + pulse * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.2)`;
          ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fill();
        
        ctx.shadowColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.5)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
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
    }, [points, weights, canvasSize, showHeatmap, status, iteration, threshold, zoom, panOffset]);

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
    
    const maxLoss = Math.max(...lossHistory.map(l => l.loss), 0.1);
    const minLoss = Math.min(...lossHistory.map(l => l.loss), 0);
    const range = maxLoss - minLoss || 1;
    
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
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
    gradient.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
    
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
    const initW = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2];
    setWeights(initW);
    setTargetWeights(initW);
    setIteration(0);
    setStatus('idle');
    setLossHistory([]);
    setLogLoss(calculateLogLoss(newPoints, initW));
    setAccuracy(calculateAccuracy(newPoints, initW, threshold));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const prob = predict(x / canvasSize.width, y / canvasSize.height, weights);
    const label = prob >= threshold ? 1 : 0;
    
    setPoints(prev => [...prev, { id: prev.length, x, y, label }]);
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
      case 'initializing': return 'Estimating probabilities using sigmoid';
      case 'training': return 'Updating weights to minimize log loss';
      case 'converged': return 'Model converged – optimal separation achieved';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.08),transparent_50%)]" />
      
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Logistic Regression</h1>
              <p className="text-neutral-400 text-sm mt-1">Binary Classification Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-500/10 border-blue-500/30"
            >
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-blue-400">Class 0</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-pink-500/10 border-pink-500/30"
            >
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs font-medium text-pink-400">Class 1</span>
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
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
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
                    className={`p-1.5 rounded transition-colors ${interactionMode === 'point' ? 'bg-purple-500/30 text-purple-400' : 'text-neutral-400 hover:text-white'}`}
                    title="Add Points"
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
            </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-4"
          >
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-purple-400" />
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
                    min={30}
                    max={200}
                    step={10}
                    value={numPoints}
                    onChange={(e) => setNumPoints(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Learning Rate</span>
                    <span className="text-white font-mono">{learningRate.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={1}
                    step={0.01}
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Threshold</span>
                    <span className="text-white font-mono">{threshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={threshold}
                    onChange={(e) => {
                      const newThresh = Number(e.target.value);
                      setThreshold(newThresh);
                      setAccuracy(calculateAccuracy(points, weights, newThresh));
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
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
                    max={5}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-neutral-400">Probability Heatmap</span>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      showHeatmap ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-neutral-500'
                    }`}
                  >
                    {showHeatmap ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span className="text-xs">{showHeatmap ? 'On' : 'Off'}</span>
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
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
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
                <Activity size={16} className="text-pink-400" />
                Live Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-neutral-500 mb-1">Iteration</div>
                  <div className="text-2xl font-bold font-mono text-white">{iteration}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Log Loss</div>
                  <div className="text-lg font-bold font-mono text-white truncate">
                    {logLoss > 0 ? logLoss.toFixed(4) : '—'}
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Accuracy</div>
                  <div className="text-lg font-bold font-mono text-green-400 truncate">
                    {(accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Threshold</div>
                  <div className="text-lg font-bold font-mono text-cyan-400 truncate">
                    {threshold.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 rounded-xl col-span-2 border" style={{
                  backgroundColor: status === 'converged' ? 'rgba(16, 185, 129, 0.1)' : 
                                   status === 'idle' ? 'rgba(255, 255, 255, 0.05)' : 
                                   'rgba(139, 92, 246, 0.1)',
                  borderColor: status === 'converged' ? 'rgba(16, 185, 129, 0.3)' : 
                               status === 'idle' ? 'rgba(255, 255, 255, 0.1)' : 
                               'rgba(139, 92, 246, 0.3)'
                }}>
                  <div className="text-xs text-neutral-500 mb-1">Status</div>
                  <div className={`text-sm font-semibold capitalize ${
                    status === 'converged' ? 'text-green-400' : 
                    status === 'idle' ? 'text-neutral-400' : 
                    'text-purple-400'
                  }`}>
                    {status === 'idle' ? 'Ready' : status}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Target size={16} className="text-cyan-400" />
                Confusion Matrix
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-xs text-green-400/60">TP</div>
                  <div className="text-lg font-bold text-green-400">{confusion.tp}</div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-xs text-red-400/60">FP</div>
                  <div className="text-lg font-bold text-red-400">{confusion.fp}</div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-xs text-red-400/60">FN</div>
                  <div className="text-lg font-bold text-red-400">{confusion.fn}</div>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-xs text-green-400/60">TN</div>
                  <div className="text-lg font-bold text-green-400">{confusion.tn}</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-pink-400" />
                Loss History
              </h3>
              <div className="relative h-20 rounded-lg overflow-hidden bg-black/30">
                <canvas
                  ref={lossCanvasRef}
                  width={260}
                  height={80}
                  className="w-full h-full"
                />
                {lossHistory.length < 2 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                    Start training to see loss curve
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Logistic regression predicts probabilities using the sigmoid function. 
                The decision boundary separates classes where probability = threshold.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-black/30 font-mono text-xs text-neutral-500 text-center">
                σ(z) = 1 / (1 + e<sup>-z</sup>)
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
