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
  Layers,
  Plus,
  Minus,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

interface Neuron {
  id: string;
  layer: number;
  index: number;
  x: number;
  y: number;
  activation: number;
  bias: number;
  error: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  weight: number;
  gradient: number;
}

interface Signal {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  type: 'forward' | 'backward';
  value: number;
}

interface LossPoint {
  epoch: number;
  loss: number;
}

type ActivationFn = 'relu' | 'sigmoid' | 'tanh';
type Dataset = 'xor' | 'linear' | 'circular';
type NetworkStatus = 'idle' | 'initializing' | 'forward' | 'backward' | 'training' | 'converged';

const DATASETS: Record<Dataset, { inputs: number[][]; targets: number[] }> = {
  xor: {
    inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
    targets: [0, 1, 1, 0]
  },
  linear: {
    inputs: [[0.1, 0.2], [0.3, 0.4], [0.6, 0.7], [0.8, 0.9]],
    targets: [0.15, 0.35, 0.65, 0.85]
  },
  circular: {
    inputs: [[0.5, 0.1], [0.9, 0.5], [0.5, 0.9], [0.1, 0.5]],
    targets: [1, 1, 1, 1]
  }
};

export default function NeuralNetworkVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [networkStructure, setNetworkStructure] = useState<number[]>([2, 4, 4, 1]);
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  
  const [learningRate, setLearningRate] = useState(0.5);
  const [activationFn, setActivationFn] = useState<ActivationFn>('sigmoid');
  const [dataset, setDataset] = useState<Dataset>('xor');
  const [speed, setSpeed] = useState(1);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(0);
  const [status, setStatus] = useState<NetworkStatus>('idle');
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  
  const [showWeights, setShowWeights] = useState(false);
  const [showBias, setShowBias] = useState(false);
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);
    
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const activate = useCallback((x: number, fn: ActivationFn): number => {
    switch (fn) {
      case 'relu': return Math.max(0, x);
      case 'sigmoid': return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
      case 'tanh': return Math.tanh(x);
    }
  }, []);

  const activateDerivative = useCallback((x: number, fn: ActivationFn): number => {
    switch (fn) {
      case 'relu': return x > 0 ? 1 : 0;
      case 'sigmoid': {
        const s = activate(x, 'sigmoid');
        return s * (1 - s);
      }
      case 'tanh': {
        const t = Math.tanh(x);
        return 1 - t * t;
      }
    }
  }, [activate]);

  const initializeNetwork = useCallback(() => {
    const newNeurons: Neuron[] = [];
    const newConnections: Connection[] = [];
    
    const layerSpacing = canvasSize.width / (networkStructure.length + 1);
    
    networkStructure.forEach((count, layerIdx) => {
      const neuronSpacing = canvasSize.height / (count + 1);
      
      for (let i = 0; i < count; i++) {
        const neuron: Neuron = {
          id: `${layerIdx}-${i}`,
          layer: layerIdx,
          index: i,
          x: layerSpacing * (layerIdx + 1),
          y: neuronSpacing * (i + 1),
          activation: 0,
          bias: (Math.random() - 0.5) * 2,
          error: 0
        };
        newNeurons.push(neuron);
        
        if (layerIdx > 0) {
          const prevCount = networkStructure[layerIdx - 1];
          for (let j = 0; j < prevCount; j++) {
            newConnections.push({
              id: `${layerIdx - 1}-${j}-${layerIdx}-${i}`,
              from: `${layerIdx - 1}-${j}`,
              to: `${layerIdx}-${i}`,
              weight: (Math.random() - 0.5) * 2,
              gradient: 0
            });
          }
        }
      }
    });
    
    setNeurons(newNeurons);
    setConnections(newConnections);
    setSignals([]);
    setEpoch(0);
    setCurrentLoss(0);
    setLossHistory([]);
    setStatus('idle');
    setSelectedNeuron(null);
  }, [networkStructure, canvasSize]);

  const forwardPass = useCallback((input: number[]): number => {
    const newNeurons = [...neurons];
    const newSignals: Signal[] = [];
    
    networkStructure.forEach((count, layerIdx) => {
      for (let i = 0; i < count; i++) {
        const neuronIdx = newNeurons.findIndex(n => n.id === `${layerIdx}-${i}`);
        if (neuronIdx === -1) continue;
        
        if (layerIdx === 0) {
          newNeurons[neuronIdx].activation = input[i] || 0;
        } else {
          let sum = newNeurons[neuronIdx].bias;
          
          connections.forEach(conn => {
            if (conn.to === `${layerIdx}-${i}`) {
              const fromNeuron = newNeurons.find(n => n.id === conn.from);
              if (fromNeuron) {
                sum += fromNeuron.activation * conn.weight;
                
                newSignals.push({
                  id: `fwd-${conn.id}-${Date.now()}`,
                  fromX: fromNeuron.x,
                  fromY: fromNeuron.y,
                  toX: newNeurons[neuronIdx].x,
                  toY: newNeurons[neuronIdx].y,
                  progress: 0,
                  type: 'forward',
                  value: fromNeuron.activation * conn.weight
                });
              }
            }
          });
          
          newNeurons[neuronIdx].activation = activate(sum, activationFn);
        }
      }
    });
    
    setNeurons(newNeurons);
    setSignals(prev => [...prev, ...newSignals]);
    
    const outputNeuron = newNeurons.find(n => n.layer === networkStructure.length - 1);
    return outputNeuron?.activation || 0;
  }, [neurons, connections, networkStructure, activationFn, activate]);

  const backwardPass = useCallback((target: number) => {
    const newNeurons = [...neurons];
    const newConnections = [...connections];
    const newSignals: Signal[] = [];
    
    for (let layerIdx = networkStructure.length - 1; layerIdx >= 0; layerIdx--) {
      const count = networkStructure[layerIdx];
      
      for (let i = 0; i < count; i++) {
        const neuronIdx = newNeurons.findIndex(n => n.id === `${layerIdx}-${i}`);
        if (neuronIdx === -1) continue;
        
        const neuron = newNeurons[neuronIdx];
        
        if (layerIdx === networkStructure.length - 1) {
          neuron.error = (neuron.activation - target) * activateDerivative(neuron.activation, activationFn);
        } else {
          let errorSum = 0;
          newConnections.forEach(conn => {
            if (conn.from === neuron.id) {
              const toNeuron = newNeurons.find(n => n.id === conn.to);
              if (toNeuron) {
                errorSum += conn.weight * toNeuron.error;
                
                newSignals.push({
                  id: `bwd-${conn.id}-${Date.now()}`,
                  fromX: toNeuron.x,
                  fromY: toNeuron.y,
                  toX: neuron.x,
                  toY: neuron.y,
                  progress: 0,
                  type: 'backward',
                  value: toNeuron.error
                });
              }
            }
          });
          neuron.error = errorSum * activateDerivative(neuron.activation, activationFn);
        }
      }
    }
    
    newConnections.forEach((conn, idx) => {
      const fromNeuron = newNeurons.find(n => n.id === conn.from);
      const toNeuron = newNeurons.find(n => n.id === conn.to);
      
      if (fromNeuron && toNeuron) {
        const gradient = fromNeuron.activation * toNeuron.error;
        newConnections[idx].gradient = gradient;
        newConnections[idx].weight -= learningRate * gradient;
      }
    });
    
    newNeurons.forEach((neuron, idx) => {
      if (neuron.layer > 0) {
        newNeurons[idx].bias -= learningRate * neuron.error;
      }
    });
    
    setNeurons(newNeurons);
    setConnections(newConnections);
    setSignals(prev => [...prev, ...newSignals]);
  }, [neurons, connections, networkStructure, learningRate, activationFn, activateDerivative]);

  const trainStep = useCallback(() => {
    if (status === 'converged') return;
    
    const data = DATASETS[dataset];
    let totalLoss = 0;
    
    setStatus('training');
    
    data.inputs.forEach((input, idx) => {
      const output = forwardPass(input);
      const target = data.targets[idx];
      totalLoss += Math.pow(output - target, 2);
      backwardPass(target);
    });
    
    const avgLoss = totalLoss / data.inputs.length;
    setCurrentLoss(avgLoss);
    setEpoch(prev => prev + 1);
    setLossHistory(prev => [...prev.slice(-100), { epoch: epoch + 1, loss: avgLoss }]);
    
    if (epoch > 50 && avgLoss < 0.01) {
      setStatus('converged');
      setIsPlaying(false);
    }
  }, [status, dataset, epoch, forwardPass, backwardPass]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(600, rect.width),
          height: Math.max(400, rect.height),
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    initializeNetwork();
  }, [networkStructure, canvasSize, initializeNetwork]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(trainStep, 200 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, trainStep, speed]);

  useEffect(() => {
    setSignals(prev => {
      const updated = prev.map(s => ({
        ...s,
        progress: Math.min(1, s.progress + 0.08)
      })).filter(s => s.progress < 1);
      return updated;
    });
  }, [neurons]);

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

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1 / zoom;
        const gridSize = 30;
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

      connections.forEach(conn => {
        const fromNeuron = neurons.find(n => n.id === conn.from);
        const toNeuron = neurons.find(n => n.id === conn.to);
        
        if (!fromNeuron || !toNeuron) return;
        
        const weightStrength = Math.abs(conn.weight);
        const alpha = 0.1 + Math.min(0.5, weightStrength * 0.3);
        const lineWidth = 0.5 + Math.min(3, weightStrength * 1.5);
        
        const hue = conn.weight > 0 ? 200 : 340;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
        ctx.lineWidth = lineWidth;
        
        ctx.beginPath();
        ctx.moveTo(fromNeuron.x, fromNeuron.y);
        ctx.lineTo(toNeuron.x, toNeuron.y);
        ctx.stroke();
        
        if (showWeights) {
          const midX = (fromNeuron.x + toNeuron.x) / 2;
          const midY = (fromNeuron.y + toNeuron.y) / 2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '9px monospace';
          ctx.fillText(conn.weight.toFixed(2), midX, midY);
        }
      });

      signals.forEach(signal => {
        const x = signal.fromX + (signal.toX - signal.fromX) * signal.progress;
        const y = signal.fromY + (signal.toY - signal.fromY) * signal.progress;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        if (signal.type === 'forward') {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.9)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      neurons.forEach(neuron => {
        const isSelected = selectedNeuron?.id === neuron.id;
        const activationIntensity = Math.abs(neuron.activation);
        
        const baseRadius = 18;
        const radius = baseRadius + activationIntensity * 4;
        
        let hue: number;
        if (neuron.layer === 0) hue = 200;
        else if (neuron.layer === networkStructure.length - 1) hue = 140;
        else hue = 270;
        
        const saturation = 60 + activationIntensity * 30;
        const lightness = 40 + activationIntensity * 20;
        
        ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
        ctx.shadowBlur = 15 + activationIntensity * 10;
        
        const gradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, radius
        );
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 1)`);
        gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness - 10}%, 0.7)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (isSelected) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, radius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(neuron.activation.toFixed(2), neuron.x, neuron.y);
        
        if (showBias && neuron.layer > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '8px monospace';
          ctx.fillText(`b:${neuron.bias.toFixed(1)}`, neuron.x, neuron.y + radius + 10);
        }
      });

      const labels = ['Input', ...Array(networkStructure.length - 2).fill(null).map((_, i) => `Hidden ${i + 1}`), 'Output'];
      const layerSpacing = canvasSize.width / (networkStructure.length + 1);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      
        networkStructure.forEach((_, idx) => {
          const x = layerSpacing * (idx + 1);
          ctx.fillText(labels[idx], x, 25);
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
    }, [neurons, connections, signals, canvasSize, networkStructure, showWeights, showBias, selectedNeuron, zoom, panOffset]);

  useEffect(() => {
    const lossCanvas = lossCanvasRef.current;
    if (!lossCanvas || lossHistory.length < 2) return;
    
    const ctx = lossCanvas.getContext('2d');
    if (!ctx) return;

    const width = lossCanvas.width;
    const height = lossCanvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    const maxLoss = Math.max(...lossHistory.map(l => l.loss), 0.5);
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    lossHistory.forEach((point, idx) => {
      const x = (idx / (lossHistory.length - 1)) * width;
      const y = height - (point.loss / maxLoss) * (height - 10) - 5;
      
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
      const y = height - (point.loss / maxLoss) * (height - 10) - 5;
      
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }, [lossHistory]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clicked = neurons.find(n => {
      const dist = Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2));
      return dist < 25;
    });
    
    setSelectedNeuron(clicked || null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!e.shiftKey) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
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
    setZoom(prev => Math.min(5, Math.max(0.3, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setIsPlaying(false);
    initializeNetwork();
  };

  const addHiddenNeuron = () => {
    if (networkStructure.length < 2) return;
    const newStructure = [...networkStructure];
    const hiddenIdx = Math.floor(networkStructure.length / 2);
    if (newStructure[hiddenIdx] < 8) {
      newStructure[hiddenIdx]++;
      setNetworkStructure(newStructure);
    }
  };

  const removeHiddenNeuron = () => {
    if (networkStructure.length < 2) return;
    const newStructure = [...networkStructure];
    const hiddenIdx = Math.floor(networkStructure.length / 2);
    if (newStructure[hiddenIdx] > 2) {
      newStructure[hiddenIdx]--;
      setNetworkStructure(newStructure);
    }
  };

  const addHiddenLayer = () => {
    if (networkStructure.length >= 5) return;
    const newStructure = [...networkStructure];
    newStructure.splice(networkStructure.length - 1, 0, 3);
    setNetworkStructure(newStructure);
  };

  const removeHiddenLayer = () => {
    if (networkStructure.length <= 3) return;
    const newStructure = [...networkStructure];
    newStructure.splice(networkStructure.length - 2, 1);
    setNetworkStructure(newStructure);
  };

  const totalParams = connections.length + neurons.filter(n => n.layer > 0).length;

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Neural network initialized';
      case 'initializing': return 'Initializing weights and biases';
      case 'forward': return 'Forward propagation: computing predictions';
      case 'backward': return 'Backpropagation: updating weights';
      case 'training': return 'Training: minimizing loss';
      case 'converged': return 'Neural network converged';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.1),transparent_50%)]" />
      
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
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Neural Network</h1>
              <p className="text-neutral-400 text-sm mt-1">Feedforward & Backpropagation Visualization</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-blue-400">Forward</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-pink-400">Backward</span>
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
                onClick={handleCanvasClick}
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
                    onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
                    className="p-1.5 rounded text-neutral-400 hover:text-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => setZoom(prev => Math.max(0.3, prev / 1.2))}
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
                  <Move size={14} className="text-purple-400" />
                  <span className="text-xs text-neutral-300">Drag to pan</span>
                </div>
              </div>
            
            <AnimatePresence>
              {selectedNeuron && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10"
                >
                  <h4 className="text-sm font-semibold mb-2">Neuron Details</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-400">Layer:</span>
                      <span className="font-mono">{selectedNeuron.layer}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-400">Activation:</span>
                      <span className="font-mono text-blue-400">{selectedNeuron.activation.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-400">Bias:</span>
                      <span className="font-mono text-purple-400">{selectedNeuron.bias.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-400">Error:</span>
                      <span className="font-mono text-pink-400">{selectedNeuron.error.toFixed(4)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-80 space-y-4"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                Network Structure
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Hidden Neurons</span>
                  <div className="flex items-center gap-2">
                    <button onClick={removeHiddenNeuron} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-sm w-6 text-center">{networkStructure[1]}</span>
                    <button onClick={addHiddenNeuron} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Hidden Layers</span>
                  <div className="flex items-center gap-2">
                    <button onClick={removeHiddenLayer} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-sm w-6 text-center">{networkStructure.length - 2}</span>
                    <button onClick={addHiddenLayer} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/5 text-xs text-neutral-500">
                  Structure: {networkStructure.join(' → ')}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-cyan-400" />
                Controls
              </h3>
              
              <div className="space-y-4">
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
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
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Activation</label>
                  <select
                    value={activationFn}
                    onChange={(e) => setActivationFn(e.target.value as ActivationFn)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="sigmoid">Sigmoid</option>
                    <option value="relu">ReLU</option>
                    <option value="tanh">Tanh</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Dataset</label>
                  <select
                    value={dataset}
                    onChange={(e) => setDataset(e.target.value as Dataset)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="xor">XOR Problem</option>
                    <option value="linear">Linear</option>
                    <option value="circular">Circular</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWeights(!showWeights)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors ${
                      showWeights ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {showWeights ? <Eye size={14} /> : <EyeOff size={14} />}
                    Weights
                  </button>
                  <button
                    onClick={() => setShowBias(!showBias)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors ${
                      showBias ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {showBias ? <Eye size={14} /> : <EyeOff size={14} />}
                    Bias
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={status === 'converged'}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    status === 'converged'
                      ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Train'}
                </button>
                
                <button
                  onClick={trainStep}
                  disabled={isPlaying || status === 'converged'}
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
                <Activity size={16} className="text-pink-400" />
                Live Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-neutral-500 mb-1">Epoch</div>
                  <div className="text-xl font-bold font-mono text-white">{epoch}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Loss (MSE)</div>
                  <div className="text-lg font-bold font-mono text-pink-400 truncate">
                    {currentLoss > 0 ? currentLoss.toFixed(4) : '—'}
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="text-xs text-neutral-500 mb-1">Parameters</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">{totalParams}</div>
                </div>
                
                <div className="p-3 rounded-xl border overflow-hidden" style={{
                  backgroundColor: status === 'converged' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: status === 'converged' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'
                }}>
                  <div className="text-xs text-neutral-500 mb-1">Status</div>
                  <div className={`text-sm font-semibold capitalize truncate ${
                    status === 'converged' ? 'text-green-400' : 
                    status === 'training' ? 'text-purple-400' : 'text-neutral-400'
                  }`}>
                    {status === 'idle' ? 'Ready' : status}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-purple-400" />
                Loss History
              </h3>
              <div className="relative h-16 rounded-lg overflow-hidden bg-black/30">
                <canvas
                  ref={lossCanvasRef}
                  width={260}
                  height={64}
                  className="w-full h-full"
                />
                {lossHistory.length < 2 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                    Start training
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                How It Works
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Neural networks learn by adjusting weights to minimize error. 
                Forward pass computes predictions, backpropagation updates weights.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">Forward Pass</span>
                <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-400">Backprop</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Gradient Descent</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
