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
  GitBranch,
  Eye,
  EyeOff,
  TreeDeciduous
} from 'lucide-react';
import Link from 'next/link';

interface DataPoint {
  id: number;
  features: number[];
  label: number;
}

interface TreeNode {
  id: string;
  x: number;
  y: number;
  featureIndex: number | null;
  threshold: number | null;
  label: number | null;
  isLeaf: boolean;
  samples: number;
  gini: number;
  left: TreeNode | null;
  right: TreeNode | null;
  depth: number;
  distribution: number[];
  isActive: boolean;
  isHighlighted: boolean;
}

type SplitCriterion = 'gini' | 'entropy';
type BuildStatus = 'idle' | 'initializing' | 'splitting' | 'completed';

const FEATURE_NAMES = ['Age', 'Income', 'Score'];
const CLASS_COLORS = ['#3B82F6', '#EC4899'];
const CLASS_NAMES = ['Class A', 'Class B'];

export default function DecisionTreeVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [buildQueue, setBuildQueue] = useState<TreeNode[]>([]);
  
  const [maxDepth, setMaxDepth] = useState(4);
  const [minSamples, setMinSamples] = useState(5);
  const [criterion, setCriterion] = useState<SplitCriterion>('gini');
  const [speed, setSpeed] = useState(1);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<BuildStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  
  const [showSampleCount, setShowSampleCount] = useState(true);
  const [predictionInput, setPredictionInput] = useState<number[]>([50, 50, 50]);
  const [predictionPath, setPredictionPath] = useState<string[]>([]);
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });
  const [treeStats, setTreeStats] = useState({ depth: 0, nodes: 0, leaves: 0 });

  const generateDataset = useCallback(() => {
    const points: DataPoint[] = [];
    for (let i = 0; i < 100; i++) {
      const features = [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100
      ];
      const label = (features[0] > 50 && features[1] > 40) || (features[2] > 60) ? 1 : 0;
      points.push({ id: i, features, label });
    }
    return points;
  }, []);

  const calculateGini = (labels: number[]): number => {
    if (labels.length === 0) return 0;
    const counts: Record<number, number> = {};
    labels.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
    let gini = 1;
    Object.values(counts).forEach(count => {
      const p = count / labels.length;
      gini -= p * p;
    });
    return gini;
  };

  const calculateEntropy = (labels: number[]): number => {
    if (labels.length === 0) return 0;
    const counts: Record<number, number> = {};
    labels.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
    let entropy = 0;
    Object.values(counts).forEach(count => {
      const p = count / labels.length;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    return entropy;
  };

  const calculateImpurity = useCallback((labels: number[]): number => {
    return criterion === 'gini' ? calculateGini(labels) : calculateEntropy(labels);
  }, [criterion]);

  const findBestSplit = useCallback((data: DataPoint[]): { featureIndex: number; threshold: number; gain: number } | null => {
    if (data.length < minSamples) return null;
    
    const labels = data.map(d => d.label);
    const parentImpurity = calculateImpurity(labels);
    
    let bestGain = 0;
    let bestFeature = -1;
    let bestThreshold = 0;
    
    for (let f = 0; f < 3; f++) {
      const values = [...new Set(data.map(d => d.features[f]))].sort((a, b) => a - b);
      
      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;
        
        const leftData = data.filter(d => d.features[f] <= threshold);
        const rightData = data.filter(d => d.features[f] > threshold);
        
        if (leftData.length === 0 || rightData.length === 0) continue;
        
        const leftLabels = leftData.map(d => d.label);
        const rightLabels = rightData.map(d => d.label);
        
        const leftImpurity = calculateImpurity(leftLabels);
        const rightImpurity = calculateImpurity(rightLabels);
        
        const weightedImpurity = (leftData.length / data.length) * leftImpurity +
                                  (rightData.length / data.length) * rightImpurity;
        
        const gain = parentImpurity - weightedImpurity;
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = threshold;
        }
      }
    }
    
    if (bestFeature === -1) return null;
    return { featureIndex: bestFeature, threshold: bestThreshold, gain: bestGain };
  }, [calculateImpurity, minSamples]);

  const getDistribution = (data: DataPoint[]): number[] => {
    const dist = [0, 0];
    data.forEach(d => { dist[d.label]++; });
    return dist;
  };

  const getMajorityClass = (data: DataPoint[]): number => {
    const dist = getDistribution(data);
    return dist[0] >= dist[1] ? 0 : 1;
  };

  const calculateNodePositions = useCallback((node: TreeNode | null, x: number, y: number, spread: number, depth: number) => {
    if (!node) return;
    
    node.x = x;
    node.y = y;
    node.depth = depth;
    
    const verticalSpacing = 100;
    const newSpread = spread * 0.55;
    
    if (node.left) {
      calculateNodePositions(node.left, x - spread, y + verticalSpacing, newSpread, depth + 1);
    }
    if (node.right) {
      calculateNodePositions(node.right, x + spread, y + verticalSpacing, newSpread, depth + 1);
    }
  }, []);

  const initializeTree = useCallback(() => {
    const data = generateDataset();
    setDataset(data);
    
    const rootNode: TreeNode = {
      id: 'root',
      x: canvasSize.width / 2,
      y: 60,
      featureIndex: null,
      threshold: null,
      label: null,
      isLeaf: false,
      samples: data.length,
      gini: calculateGini(data.map(d => d.label)),
      left: null,
      right: null,
      depth: 0,
      distribution: getDistribution(data),
      isActive: true,
      isHighlighted: false
    };
    
    setTree(rootNode);
    setBuildQueue([{ ...rootNode, data } as TreeNode & { data: DataPoint[] }]);
    setStatus('initializing');
    setCurrentStep(0);
    setPredictionPath([]);
    setPredictionResult(null);
    setTreeStats({ depth: 0, nodes: 1, leaves: 0 });
  }, [canvasSize, generateDataset]);

  const buildStep = useCallback(() => {
    if (buildQueue.length === 0) {
      setStatus('completed');
      setIsPlaying(false);
      return;
    }

    setStatus('splitting');
    const currentNode = buildQueue[0] as TreeNode & { data?: DataPoint[] };
    const nodeData = currentNode.data || dataset.slice(0, currentNode.samples);
    
    if (currentNode.depth >= maxDepth || nodeData.length < minSamples || calculateGini(nodeData.map(d => d.label)) === 0) {
      currentNode.isLeaf = true;
      currentNode.label = getMajorityClass(nodeData);
      currentNode.isActive = false;
      
      setTree(prev => {
        if (!prev) return prev;
        return { ...prev };
      });
      
      setBuildQueue(prev => prev.slice(1));
      setCurrentStep(prev => prev + 1);
      
      setTreeStats(prev => ({
        ...prev,
        leaves: prev.leaves + 1,
        depth: Math.max(prev.depth, currentNode.depth)
      }));
      return;
    }

    const bestSplit = findBestSplit(nodeData);
    
    if (!bestSplit) {
      currentNode.isLeaf = true;
      currentNode.label = getMajorityClass(nodeData);
      currentNode.isActive = false;
      
      setBuildQueue(prev => prev.slice(1));
      setCurrentStep(prev => prev + 1);
      
      setTreeStats(prev => ({
        ...prev,
        leaves: prev.leaves + 1,
        depth: Math.max(prev.depth, currentNode.depth)
      }));
      return;
    }

    currentNode.featureIndex = bestSplit.featureIndex;
    currentNode.threshold = bestSplit.threshold;
    currentNode.isActive = false;

    const leftData = nodeData.filter(d => d.features[bestSplit.featureIndex] <= bestSplit.threshold);
    const rightData = nodeData.filter(d => d.features[bestSplit.featureIndex] > bestSplit.threshold);

    const spread = Math.max(80, 200 / (currentNode.depth + 1));
    
    const leftNode: TreeNode & { data: DataPoint[] } = {
      id: `${currentNode.id}-L`,
      x: currentNode.x - spread,
      y: currentNode.y + 100,
      featureIndex: null,
      threshold: null,
      label: null,
      isLeaf: false,
      samples: leftData.length,
      gini: calculateGini(leftData.map(d => d.label)),
      left: null,
      right: null,
      depth: currentNode.depth + 1,
      distribution: getDistribution(leftData),
      isActive: true,
      isHighlighted: false,
      data: leftData
    };

    const rightNode: TreeNode & { data: DataPoint[] } = {
      id: `${currentNode.id}-R`,
      x: currentNode.x + spread,
      y: currentNode.y + 100,
      featureIndex: null,
      threshold: null,
      label: null,
      isLeaf: false,
      samples: rightData.length,
      gini: calculateGini(rightData.map(d => d.label)),
      left: null,
      right: null,
      depth: currentNode.depth + 1,
      distribution: getDistribution(rightData),
      isActive: true,
      isHighlighted: false,
      data: rightData
    };

    currentNode.left = leftNode;
    currentNode.right = rightNode;

    setTree(prev => {
      if (!prev) return prev;
      return { ...prev };
    });

    setBuildQueue(prev => [...prev.slice(1), leftNode, rightNode]);
    setCurrentStep(prev => prev + 1);
    
    setTreeStats(prev => ({
      ...prev,
      nodes: prev.nodes + 2,
      depth: Math.max(prev.depth, currentNode.depth + 1)
    }));
  }, [buildQueue, dataset, maxDepth, minSamples, findBestSplit]);

  const runPrediction = useCallback(() => {
    if (!tree || status !== 'completed') return;
    
    const path: string[] = [];
    let currentNode: TreeNode | null = tree;
    
    const clearHighlights = (node: TreeNode | null) => {
      if (!node) return;
      node.isHighlighted = false;
      clearHighlights(node.left);
      clearHighlights(node.right);
    };
    clearHighlights(tree);
    
    while (currentNode && !currentNode.isLeaf) {
      currentNode.isHighlighted = true;
      path.push(currentNode.id);
      
      if (currentNode.featureIndex !== null && currentNode.threshold !== null) {
        const featureValue = predictionInput[currentNode.featureIndex];
        if (featureValue <= currentNode.threshold) {
          currentNode = currentNode.left;
        } else {
          currentNode = currentNode.right;
        }
      } else {
        break;
      }
    }
    
    if (currentNode) {
      currentNode.isHighlighted = true;
      path.push(currentNode.id);
      setPredictionResult(currentNode.label);
    }
    
    setPredictionPath(path);
    setTree(prev => prev ? { ...prev } : null);
  }, [tree, status, predictionInput]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(600, rect.width),
          height: Math.max(500, rect.height),
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(buildStep, 800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, buildStep, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawNode = (node: TreeNode) => {
      const nodeWidth = 120;
      const nodeHeight = node.isLeaf ? 60 : 70;
      
      ctx.shadowColor = node.isHighlighted 
        ? 'rgba(234, 179, 8, 0.6)' 
        : node.isActive 
          ? 'rgba(139, 92, 246, 0.5)' 
          : node.isLeaf 
            ? `${CLASS_COLORS[node.label || 0]}40`
            : 'rgba(255, 255, 255, 0.1)';
      ctx.shadowBlur = node.isHighlighted ? 25 : node.isActive ? 20 : 15;
      
      const gradient = ctx.createLinearGradient(
        node.x - nodeWidth / 2, node.y - nodeHeight / 2,
        node.x + nodeWidth / 2, node.y + nodeHeight / 2
      );
      
      if (node.isHighlighted) {
        gradient.addColorStop(0, 'rgba(234, 179, 8, 0.3)');
        gradient.addColorStop(1, 'rgba(234, 179, 8, 0.15)');
      } else if (node.isLeaf) {
        const color = CLASS_COLORS[node.label || 0];
        gradient.addColorStop(0, `${color}30`);
        gradient.addColorStop(1, `${color}15`);
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(node.x - nodeWidth / 2, node.y - nodeHeight / 2, nodeWidth, nodeHeight, 12);
      ctx.fill();
      
      ctx.strokeStyle = node.isHighlighted 
        ? 'rgba(234, 179, 8, 0.8)' 
        : node.isActive 
          ? 'rgba(139, 92, 246, 0.6)'
          : node.isLeaf 
            ? `${CLASS_COLORS[node.label || 0]}60`
            : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = node.isHighlighted ? 2 : 1;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (node.isLeaf) {
        ctx.fillStyle = CLASS_COLORS[node.label || 0];
        ctx.fillText(CLASS_NAMES[node.label || 0], node.x, node.y - 8);
        
        if (showSampleCount) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(`n=${node.samples}`, node.x, node.y + 12);
        }
      } else if (node.featureIndex !== null && node.threshold !== null) {
        ctx.fillText(FEATURE_NAMES[node.featureIndex], node.x, node.y - 15);
        
        ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
        ctx.font = '10px monospace';
        ctx.fillText(`≤ ${node.threshold.toFixed(1)}`, node.x, node.y + 2);
        
        if (showSampleCount) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillText(`n=${node.samples}`, node.x, node.y + 18);
        }
      } else {
        ctx.fillText('Root', node.x, node.y - 8);
        if (showSampleCount) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(`n=${node.samples}`, node.x, node.y + 10);
        }
      }

      const barWidth = 80;
      const barHeight = 4;
      const barY = node.y + (node.isLeaf ? 25 : 28);
      const total = node.distribution[0] + node.distribution[1];
      
      if (total > 0) {
        const ratio0 = node.distribution[0] / total;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(node.x - barWidth / 2, barY, barWidth, barHeight, 2);
        ctx.fill();
        
        if (ratio0 > 0) {
          ctx.fillStyle = CLASS_COLORS[0];
          ctx.beginPath();
          ctx.roundRect(node.x - barWidth / 2, barY, barWidth * ratio0, barHeight, 2);
          ctx.fill();
        }
        
        if (ratio0 < 1) {
          ctx.fillStyle = CLASS_COLORS[1];
          ctx.beginPath();
          ctx.roundRect(node.x - barWidth / 2 + barWidth * ratio0, barY, barWidth * (1 - ratio0), barHeight, 2);
          ctx.fill();
        }
      }
    };

    const drawBranch = (parent: TreeNode, child: TreeNode, isLeft: boolean) => {
      const isHighlighted = parent.isHighlighted && child.isHighlighted;
      
      ctx.strokeStyle = isHighlighted 
        ? 'rgba(234, 179, 8, 0.8)' 
        : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isHighlighted ? 3 : 1.5;
      
      if (isHighlighted) {
        ctx.shadowColor = 'rgba(234, 179, 8, 0.5)';
        ctx.shadowBlur = 10;
      }
      
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y + 35);
      
      const midY = (parent.y + 35 + child.y - 30) / 2;
      ctx.bezierCurveTo(
        parent.x, midY,
        child.x, midY,
        child.x, child.y - 30
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      const labelX = (parent.x + child.x) / 2 + (isLeft ? -15 : 15);
      const labelY = (parent.y + child.y) / 2 - 5;
      
      ctx.fillStyle = isHighlighted ? 'rgba(234, 179, 8, 0.9)' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isLeft ? '≤' : '>', labelX, labelY);
    };

    const drawTree = (node: TreeNode | null) => {
      if (!node) return;
      
      if (node.left) {
        drawBranch(node, node.left, true);
        drawTree(node.left);
      }
      if (node.right) {
        drawBranch(node, node.right, false);
        drawTree(node.right);
      }
      
      drawNode(node);
    };

    const render = () => {
      ctx.fillStyle = '#0B0F14';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
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

      if (tree) {
        drawTree(tree);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [tree, canvasSize, showSampleCount]);

  const handleReset = () => {
    setIsPlaying(false);
    setTree(null);
    setBuildQueue([]);
    setStatus('idle');
    setCurrentStep(0);
    setPredictionPath([]);
    setPredictionResult(null);
    setTreeStats({ depth: 0, nodes: 0, leaves: 0 });
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Ready to build decision tree';
      case 'initializing': return 'Starting with root node';
      case 'splitting': return 'Splitting data based on best feature';
      case 'completed': return 'Decision tree construction completed';
      default: return '';
    }
  };

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
              href="/modules?tab=aiml"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Decision Tree</h1>
              <p className="text-neutral-400 text-sm mt-1">Classification Tree Visualization</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-blue-400">{CLASS_NAMES[0]}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-pink-400">{CLASS_NAMES[1]}</span>
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
              className="w-full h-full"
            />
            
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
                  ) : status === 'splitting' ? (
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
                <Settings size={16} className="text-emerald-400" />
                Tree Parameters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Max Depth</span>
                    <span className="text-white font-mono">{maxDepth}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Min Samples Split</span>
                    <span className="text-white font-mono">{minSamples}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={minSamples}
                    onChange={(e) => setMinSamples(Number(e.target.value))}
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
                    max={3}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-2">Split Criterion</label>
                  <select
                    value={criterion}
                    onChange={(e) => setCriterion(e.target.value as SplitCriterion)}
                    className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="gini">Gini Impurity</option>
                    <option value="entropy">Entropy</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-neutral-400">Show Sample Count</span>
                  <button
                    onClick={() => setShowSampleCount(!showSampleCount)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      showSampleCount ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-500'
                    }`}
                  >
                    {showSampleCount ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {status === 'idle' ? (
                  <button
                    onClick={() => { initializeTree(); setIsPlaying(true); }}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  >
                    <TreeDeciduous size={16} />
                    Build Tree
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={status === 'completed'}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      status === 'completed'
                        ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                        : isPlaying
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Continue'}
                  </button>
                )}
                
                <button
                  onClick={buildStep}
                  disabled={isPlaying || status === 'completed' || status === 'idle'}
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
                Tree Statistics
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Depth</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{treeStats.depth}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Nodes</div>
                  <div className="text-xl font-bold font-mono text-purple-400">{treeStats.nodes}</div>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-neutral-500 mb-1">Leaves</div>
                  <div className="text-xl font-bold font-mono text-pink-400">{treeStats.leaves}</div>
                </div>
              </div>
              
              <div className="mt-3 p-3 rounded-xl border" style={{
                backgroundColor: status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'
              }}>
                <div className="text-xs text-neutral-500 mb-1">Status</div>
                <div className={`text-sm font-semibold capitalize ${
                  status === 'completed' ? 'text-green-400' : 
                  status === 'splitting' ? 'text-purple-400' : 'text-neutral-400'
                }`}>
                  {status === 'idle' ? 'Ready' : status}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 backdrop-blur-xl"
                >
                  <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                    <GitBranch size={16} className="text-yellow-400" />
                    Test Prediction
                  </h3>
                  
                  <div className="space-y-3">
                    {FEATURE_NAMES.map((name, idx) => (
                      <div key={name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">{name}</span>
                          <span className="text-white font-mono">{predictionInput[idx].toFixed(0)}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={predictionInput[idx]}
                          onChange={(e) => {
                            const newInput = [...predictionInput];
                            newInput[idx] = Number(e.target.value);
                            setPredictionInput(newInput);
                          }}
                          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500"
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={runPrediction}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
                    >
                      Run Prediction
                    </button>
                    
                    {predictionResult !== null && (
                      <div className="p-3 rounded-xl bg-black/30 text-center">
                        <div className="text-xs text-neutral-500 mb-1">Prediction Result</div>
                        <div className="text-lg font-bold" style={{ color: CLASS_COLORS[predictionResult] }}>
                          {CLASS_NAMES[predictionResult]}
                        </div>
                      </div>
                    )}
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
                Decision trees split data using feature conditions to make predictions. 
                Each node selects the best feature to minimize impurity.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Root</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Internal Node</span>
                <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-400">Leaf</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
