"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';

interface ProcessBarProps {
  block: GanttBlock;
  process: Process;
  totalTime: number;
  rowIndex: number;
  isActive: boolean;
  isPast: boolean;
}

function ProcessBar({ block, process, totalTime, rowIndex, isActive, isPast }: ProcessBarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const width = Math.max(((block.endTime - block.startTime) / totalTime) * 12, 0.4);
  const xPos = ((block.startTime + block.endTime) / 2 / totalTime) * 12 - 6;
  const zPos = rowIndex * 1.8;
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    if (glowRef.current && isActive) {
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const opacity = isPast || isActive ? 1 : 0.35;

  return (
    <group position={[xPos, 0.5, zPos]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, 0.8, 1]} />
        <meshStandardMaterial
          color={process.color}
          transparent
          opacity={opacity}
          metalness={0.3}
          roughness={0.4}
          emissive={isActive ? process.color : '#000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      {isActive && (
        <mesh ref={glowRef}>
          <boxGeometry args={[width, 0.8, 1]} />
          <meshBasicMaterial color={process.color} transparent opacity={0.2} />
        </mesh>
      )}
      
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className="text-center">
          <span className="text-white text-sm font-bold drop-shadow-lg">
            {block.endTime - block.startTime}
          </span>
        </div>
      </Html>
    </group>
  );
}

function TimeIndicator({ animatedTime, totalTime, processCount }: { animatedTime: number; totalTime: number; processCount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const xPos = (animatedTime / totalTime) * 12 - 6;
  
  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });
  
  if (animatedTime < 0) return null;
  
  return (
    <group position={[xPos, 0.5, (processCount - 1) * 0.9]}>
      <mesh ref={ref}>
        <boxGeometry args={[0.08, 2, processCount * 1.8 + 1]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
      </mesh>
      <pointLight color="#22d3ee" intensity={2} distance={5} />
    </group>
  );
}

function ProcessLabel({ process, rowIndex }: { process: Process; rowIndex: number }) {
  return (
    <group position={[-7.5, 0.5, rowIndex * 1.8]}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={process.color} emissive={process.color} emissiveIntensity={0.3} />
      </mesh>
      <Html position={[0.6, 0, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <span className="text-sm font-bold whitespace-nowrap" style={{ color: process.color }}>
          {process.id}
        </span>
      </Html>
    </group>
  );
}

function Scene({ 
  ganttChart, 
  processes, 
  animatedTime 
}: { 
  ganttChart: GanttBlock[]; 
  processes: Process[]; 
  animatedTime: number;
}) {
  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 1;
  
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = totalTime > 15 ? 2 : 1;
    for (let i = 0; i <= totalTime; i += step) {
      markers.push(i);
    }
    return markers;
  }, [totalTime]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 15, 10]} intensity={0.8} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color="#22d3ee" />
      <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={0.5} />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (processes.length - 1) * 0.9]}>
        <planeGeometry args={[18, processes.length * 1.8 + 3]} />
        <meshStandardMaterial color="#0f0f1a" opacity={0.95} transparent />
      </mesh>
      
      <gridHelper args={[18, 18, '#1a1a2e', '#1a1a2e']} position={[0, 0.01, (processes.length - 1) * 0.9]} />
      
      {processes.map((process, index) => (
        <ProcessLabel key={process.id} process={process} rowIndex={index} />
      ))}
      
      {ganttChart.map((block, index) => {
        const process = processes.find(p => p.id === block.processId);
        const rowIndex = processes.findIndex(p => p.id === block.processId);
        if (!process) return null;
        
        const isActive = animatedTime >= block.startTime && animatedTime < block.endTime;
        const isPast = animatedTime >= block.endTime;
        
        return (
          <ProcessBar
            key={index}
            block={block}
            process={process}
            totalTime={totalTime}
            rowIndex={rowIndex}
            isActive={isActive}
            isPast={isPast}
          />
        );
      })}
      
      {timeMarkers.map(time => {
        const xPos = (time / totalTime) * 12 - 6;
        const isActive = animatedTime >= time;
        return (
          <group key={time} position={[xPos, 0.02, -1.2]}>
            <mesh>
              <boxGeometry args={[0.04, 0.04, 0.3]} />
              <meshBasicMaterial color={isActive ? "#22d3ee" : "#333"} />
            </mesh>
            <Html position={[0, -0.3, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
              <span className={`text-xs font-mono ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>
                {time}
              </span>
            </Html>
          </group>
        );
      })}
      
      <TimeIndicator 
        animatedTime={animatedTime} 
        totalTime={totalTime}
        processCount={processes.length}
      />
      
      <OrbitControls
        enablePan={true}
        minDistance={5}
        maxDistance={30}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

interface GanttChart3DFullscreenProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  animatedTime: number;
}

export function GanttChart3DFullscreen({ ganttChart, processes, animatedTime }: GanttChart3DFullscreenProps) {
  if (!ganttChart.length || !processes.length) {
    return (
      <div className="w-full h-full bg-[#0a0a15] flex items-center justify-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [0, 10, 14], 
          fov: 50,
          near: 0.1,
          far: 200
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene 
          ganttChart={ganttChart} 
          processes={processes} 
          animatedTime={animatedTime}
        />
      </Canvas>
    </div>
  );
}
