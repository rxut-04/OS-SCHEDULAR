"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  
  const width = Math.max(((block.endTime - block.startTime) / totalTime) * 16, 0.5);
  const xPos = ((block.startTime + block.endTime) / 2 / totalTime) * 16 - 8;
  const zPos = rowIndex * 2.5;
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
    }
    if (glowRef.current && isActive) {
      const scale = 1.15 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const opacity = isPast || isActive ? 1 : 0.3;

  return (
    <group position={[xPos, 0.75, zPos]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, 1.2, 1.5]} />
        <meshStandardMaterial
          color={process.color}
          transparent
          opacity={opacity}
          metalness={0.3}
          roughness={0.4}
          emissive={isActive ? process.color : '#000'}
          emissiveIntensity={isActive ? 0.4 : 0}
        />
      </mesh>
      
      {isActive && (
        <mesh ref={glowRef}>
          <boxGeometry args={[width, 1.2, 1.5]} />
          <meshBasicMaterial color={process.color} transparent opacity={0.25} />
        </mesh>
      )}
      
      <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
        <div className="text-center">
          <span className="text-white text-lg font-bold drop-shadow-lg">
            {block.endTime - block.startTime}
          </span>
        </div>
      </Html>
    </group>
  );
}

function TimeIndicator({ animatedTime, totalTime, processCount }: { animatedTime: number; totalTime: number; processCount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const xPos = (animatedTime / totalTime) * 16 - 8;
  
  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });
  
  if (animatedTime < 0) return null;
  
  return (
    <group position={[xPos, 0.8, (processCount - 1) * 1.25]}>
      <mesh ref={ref}>
        <boxGeometry args={[0.12, 3, processCount * 2.5 + 2]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
      </mesh>
      <pointLight color="#22d3ee" intensity={3} distance={8} />
    </group>
  );
}

function ProcessLabel({ process, rowIndex }: { process: Process; rowIndex: number }) {
  return (
    <group position={[-10, 0.75, rowIndex * 2.5]}>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={process.color} emissive={process.color} emissiveIntensity={0.4} />
      </mesh>
      <Html position={[0.8, 0, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
        <span className="text-base font-bold whitespace-nowrap" style={{ color: process.color }}>
          {process.id}
        </span>
      </Html>
    </group>
  );
}

function CameraController({ processCount }: { processCount: number }) {
  const { camera } = useThree();
  
  useMemo(() => {
    const zCenter = (processCount - 1) * 1.25;
    camera.position.set(0, 10, zCenter + 16);
    camera.lookAt(0, 0, zCenter);
  }, [camera, processCount]);
  
  return null;
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
  const zCenter = (processes.length - 1) * 1.25;
  
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = totalTime > 20 ? Math.ceil(totalTime / 10) : totalTime > 10 ? 2 : 1;
    for (let i = 0; i <= totalTime; i += step) {
      markers.push(i);
    }
    return markers;
  }, [totalTime]);

  return (
    <>
      <CameraController processCount={processes.length} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 20, 15]} intensity={1} />
      <pointLight position={[-10, 15, -10]} intensity={0.5} color="#22d3ee" />
      <spotLight position={[0, 25, zCenter]} angle={0.4} penumbra={1} intensity={0.6} />
      
      <Stars radius={150} depth={60} count={3000} factor={5} saturation={0} fade speed={0.5} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zCenter]}>
        <planeGeometry args={[24, processes.length * 2.5 + 4]} />
        <meshStandardMaterial color="#0a0a18" opacity={0.98} transparent />
      </mesh>
      
      <gridHelper args={[24, 24, '#1a1a30', '#151525']} position={[0, 0.01, zCenter]} />
      
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
        const xPos = (time / totalTime) * 16 - 8;
        const isActive = animatedTime >= time;
        return (
          <group key={time} position={[xPos, 0.02, -1.8]}>
            <mesh>
              <boxGeometry args={[0.06, 0.06, 0.5]} />
              <meshBasicMaterial color={isActive ? "#22d3ee" : "#333"} />
            </mesh>
            <Html position={[0, -0.4, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
              <span className={`text-sm font-mono font-bold ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>
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
        target={[0, 0, zCenter]}
        enablePan={true}
        minDistance={8}
        maxDistance={40}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
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
    <div className="w-full h-full" style={{ minHeight: '100vh' }}>
      <Canvas
        camera={{ 
          fov: 50,
          near: 0.1,
          far: 300
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
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
