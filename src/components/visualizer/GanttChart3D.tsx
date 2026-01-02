"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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
  
  const width = Math.max(((block.endTime - block.startTime) / totalTime) * 10, 0.3);
  const xPos = ((block.startTime + block.endTime) / 2 / totalTime) * 10 - 5;
  const zPos = rowIndex * 1.2;
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
    }
  });

  const opacity = isPast || isActive ? 1 : 0.4;

  return (
    <group position={[xPos, 0.35, zPos]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, 0.5, 0.7]} />
        <meshStandardMaterial
          color={process.color}
          transparent
          opacity={opacity}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      
      {isActive && (
        <mesh scale={[1.15, 1.15, 1.15]}>
          <boxGeometry args={[width, 0.5, 0.7]} />
          <meshBasicMaterial color={process.color} transparent opacity={0.25} />
        </mesh>
      )}
      
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <span className="text-white text-xs font-bold drop-shadow-lg">
          {block.endTime - block.startTime}
        </span>
      </Html>
    </group>
  );
}

function TimeIndicator({ animatedTime, totalTime, processCount }: { animatedTime: number; totalTime: number; processCount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const xPos = (animatedTime / totalTime) * 10 - 5;
  
  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });
  
  if (animatedTime < 0) return null;
  
  return (
    <mesh ref={ref} position={[xPos, 0.4, (processCount - 1) * 0.6]}>
      <boxGeometry args={[0.06, 1.2, processCount * 1.2 + 0.5]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
    </mesh>
  );
}

function ProcessLabel({ process, rowIndex }: { process: Process; rowIndex: number }) {
  return (
    <group position={[-5.8, 0.35, rowIndex * 1.2]}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={process.color} />
      </mesh>
      <Html position={[0.35, 0, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <span className="text-xs font-bold" style={{ color: process.color }}>
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
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-5, 8, -5]} intensity={0.3} color="#22d3ee" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (processes.length - 1) * 0.6]}>
        <planeGeometry args={[13, processes.length * 1.2 + 1.5]} />
        <meshStandardMaterial color="#12121f" opacity={0.9} transparent />
      </mesh>
      
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
        const xPos = (time / totalTime) * 10 - 5;
        const isActive = animatedTime >= time;
        return (
          <group key={time} position={[xPos, 0.01, -0.8]}>
            <mesh>
              <boxGeometry args={[0.03, 0.03, 0.2]} />
              <meshBasicMaterial color={isActive ? "#22d3ee" : "#444"} />
            </mesh>
            <Html position={[0, -0.2, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
              <span className={`text-[10px] font-mono ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}>
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
        enablePan={false}
        minDistance={4}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={false}
      />
    </>
  );
}

interface GanttChart3DProps {
  ganttChart: GanttBlock[];
  processes: Process[];
  animatedTime: number;
}

export function GanttChart3D({ ganttChart, processes, animatedTime }: GanttChart3DProps) {
  if (!ganttChart.length || !processes.length) {
    return (
      <div className="w-full h-[350px] rounded-xl bg-[#0a0a15] flex items-center justify-center text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] rounded-xl overflow-hidden bg-[#0a0a15]">
      <Canvas
        camera={{ 
          position: [0, 6, 8], 
          fov: 50,
          near: 0.1,
          far: 100
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
