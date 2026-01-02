"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GanttBlock, Process } from '@/lib/algorithms/types';

interface CharacterProps {
  position: [number, number, number];
  targetPosition: [number, number, number];
  animation: 'idle' | 'wave' | 'point' | 'pickup' | 'place' | 'explain' | 'walk';
  holdingBlock?: { color: string; width: number } | null;
  onReachedTarget?: () => void;
}

function RealisticHumanBody({ animation, holdingBlock }: { animation: string; holdingBlock?: { color: string; width: number } | null }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftWristRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (bodyRef.current) {
      bodyRef.current.position.y = animation === 'walk' 
        ? Math.abs(Math.sin(time * 8)) * 0.04 
        : Math.sin(time * 1.5) * 0.015;
    }
    
    if (torsoRef.current && animation !== 'walk') {
      torsoRef.current.rotation.y = Math.sin(time * 0.3) * 0.02;
    }
    
    if (headRef.current) {
      if (animation === 'walk') {
        headRef.current.rotation.y = Math.sin(time * 4) * 0.03;
      } else {
        headRef.current.rotation.y = Math.sin(time * 0.4) * 0.08;
        headRef.current.rotation.x = Math.sin(time * 0.25) * 0.04;
      }
    }
    
    if (hairRef.current && animation === 'walk') {
      hairRef.current.rotation.x = Math.sin(time * 8) * 0.05;
    }
    
    if (eyesRef.current) {
      const blinkCycle = time % 3.5;
      eyesRef.current.scale.y = blinkCycle < 0.1 ? 0.1 : 1;
    }
    
    if (mouthRef.current) {
      if (animation === 'explain' || animation === 'wave') {
        mouthRef.current.scale.y = 0.7 + Math.sin(time * 10) * 0.5;
        mouthRef.current.scale.x = 1 + Math.sin(time * 7) * 0.15;
      } else {
        mouthRef.current.scale.y = 1;
        mouthRef.current.scale.x = 1;
      }
    }
    
    const shoulderSwing = { left: 0, right: 0 };
    const elbowBend = { left: 0, right: 0 };
    const wristRotation = { left: 0, right: 0 };
    const hipSwing = { left: 0, right: 0 };
    const kneeBend = { left: 0, right: 0 };
    
    switch (animation) {
      case 'idle':
        shoulderSwing.left = Math.sin(time * 1.2) * 0.05;
        shoulderSwing.right = Math.sin(time * 1.2 + Math.PI) * 0.05;
        elbowBend.left = -0.2 + Math.sin(time * 0.8) * 0.05;
        elbowBend.right = -0.2 + Math.sin(time * 0.8 + Math.PI) * 0.05;
        break;
        
      case 'wave':
        shoulderSwing.right = -2.8;
        elbowBend.right = -2.2 + Math.sin(time * 12) * 0.4;
        wristRotation.right = Math.sin(time * 15) * 0.6;
        shoulderSwing.left = 0.1;
        elbowBend.left = -0.3;
        break;
        
      case 'point':
        shoulderSwing.right = -1.8;
        elbowBend.right = -0.3;
        shoulderSwing.left = 0.2;
        elbowBend.left = -0.4;
        break;
        
      case 'pickup':
        const pickPhase = (Math.sin(time * 3) + 1) / 2;
        shoulderSwing.left = -1.0 - pickPhase * 0.6;
        shoulderSwing.right = -1.0 - pickPhase * 0.6;
        elbowBend.left = -1.3 - pickPhase * 0.4;
        elbowBend.right = -1.3 - pickPhase * 0.4;
        if (torsoRef.current) {
          torsoRef.current.rotation.x = pickPhase * 0.12;
        }
        break;
        
      case 'place':
        const placePhase = (Math.sin(time * 2.5) + 1) / 2;
        shoulderSwing.left = -0.6 - placePhase * 0.5;
        shoulderSwing.right = -0.6 - placePhase * 0.5;
        elbowBend.left = -1.0 - placePhase * 0.3;
        elbowBend.right = -1.0 - placePhase * 0.3;
        break;
        
      case 'explain':
        shoulderSwing.left = -0.9 + Math.sin(time * 2.5) * 0.5;
        shoulderSwing.right = -0.9 + Math.sin(time * 2.5 + 1.5) * 0.5;
        elbowBend.left = -1.4 + Math.sin(time * 3) * 0.4;
        elbowBend.right = -1.4 + Math.sin(time * 3 + 1) * 0.4;
        wristRotation.left = Math.sin(time * 4) * 0.4;
        wristRotation.right = Math.sin(time * 4 + 1) * 0.4;
        break;
        
      case 'walk':
        const walkCycle = time * 8;
        shoulderSwing.left = Math.sin(walkCycle) * 0.5;
        shoulderSwing.right = Math.sin(walkCycle + Math.PI) * 0.5;
        elbowBend.left = -0.4 - Math.abs(Math.sin(walkCycle)) * 0.4;
        elbowBend.right = -0.4 - Math.abs(Math.sin(walkCycle + Math.PI)) * 0.4;
        hipSwing.left = Math.sin(walkCycle + Math.PI) * 0.6;
        hipSwing.right = Math.sin(walkCycle) * 0.6;
        kneeBend.left = Math.max(0, Math.sin(walkCycle + Math.PI)) * 1.0;
        kneeBend.right = Math.max(0, Math.sin(walkCycle)) * 1.0;
        if (hipsRef.current) {
          hipsRef.current.rotation.y = Math.sin(walkCycle) * 0.1;
          hipsRef.current.rotation.z = Math.sin(walkCycle) * 0.03;
        }
        if (torsoRef.current) {
          torsoRef.current.rotation.y = Math.sin(walkCycle + Math.PI) * 0.06;
        }
        break;
    }
    
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = shoulderSwing.left;
      leftShoulderRef.current.rotation.z = 0.1;
    }
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.x = shoulderSwing.right;
      rightShoulderRef.current.rotation.z = -0.1;
    }
    if (leftElbowRef.current) leftElbowRef.current.rotation.x = elbowBend.left;
    if (rightElbowRef.current) rightElbowRef.current.rotation.x = elbowBend.right;
    if (leftWristRef.current) leftWristRef.current.rotation.z = wristRotation.left;
    if (rightWristRef.current) rightWristRef.current.rotation.z = wristRotation.right;
    if (leftHipRef.current) leftHipRef.current.rotation.x = hipSwing.left;
    if (rightHipRef.current) rightHipRef.current.rotation.x = hipSwing.right;
    if (leftKneeRef.current) leftKneeRef.current.rotation.x = kneeBend.left;
    if (rightKneeRef.current) rightKneeRef.current.rotation.x = kneeBend.right;
  });

  const skin = '#FFDAB9';
  const skinDark = '#DEB887';
  const hair = '#8B4513';
  const hairHighlight = '#A0522D';
  const shirt = '#FF69B4';
  const pants = '#4169E1';
  const shoes = '#2F2F2F';
  const eyeWhite = '#FFFFFF';
  const iris = '#6495ED';
  const pupil = '#000000';
  const lips = '#DB7093';
  const blush = '#FFB6C1';
  
  return (
    <group ref={bodyRef}>
      <group ref={hipsRef} position={[0, 0.95, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color={pants} />
        </mesh>
        <mesh position={[0, -0.05, 0]} scale={[1.25, 0.55, 0.85]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color={pants} />
        </mesh>
        
        <group ref={leftHipRef} position={[-0.11, -0.1, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.09, 0.25, 12, 16]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -0.38, 0]}>
            <mesh>
              <sphereGeometry args={[0.075, 16, 12]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.07, 0.25, 12, 16]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            <group position={[0, -0.38, 0]}>
              <mesh>
                <sphereGeometry args={[0.055, 12, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.05, 0.05]} rotation={[0.25, 0, 0]}>
                <boxGeometry args={[0.09, 0.05, 0.15]} />
                <meshStandardMaterial color={shoes} />
              </mesh>
            </group>
          </group>
        </group>
        
        <group ref={rightHipRef} position={[0.11, -0.1, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.09, 0.25, 12, 16]} />
            <meshStandardMaterial color={pants} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -0.38, 0]}>
            <mesh>
              <sphereGeometry args={[0.075, 16, 12]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.07, 0.25, 12, 16]} />
              <meshStandardMaterial color={pants} />
            </mesh>
            <group position={[0, -0.38, 0]}>
              <mesh>
                <sphereGeometry args={[0.055, 12, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.05, 0.05]} rotation={[0.25, 0, 0]}>
                <boxGeometry args={[0.09, 0.05, 0.15]} />
                <meshStandardMaterial color={shoes} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      
      <group ref={torsoRef} position={[0, 1.15, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.18, 0.32, 16, 24]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, 0.32, 0]} scale={[1.1, 0.45, 0.8]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.02, 0]} scale={[0.9, 0.35, 0.75]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        
        <group ref={leftShoulderRef} position={[-0.26, 0.3, 0]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <capsuleGeometry args={[0.06, 0.16, 10, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <group ref={leftElbowRef} position={[0, -0.26, 0]}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <capsuleGeometry args={[0.045, 0.14, 10, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group ref={leftWristRef} position={[0, -0.22, 0]}>
              <mesh>
                <sphereGeometry args={[0.035, 10, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.05, 0.01]} scale={[0.75, 0.9, 0.45]}>
                <boxGeometry args={[0.07, 0.08, 0.05]} />
                <meshStandardMaterial color={skin} />
              </mesh>
            </group>
          </group>
        </group>
        
        <group ref={rightShoulderRef} position={[0.26, 0.3, 0]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <capsuleGeometry args={[0.06, 0.16, 10, 12]} />
            <meshStandardMaterial color={shirt} />
          </mesh>
          <group ref={rightElbowRef} position={[0, -0.26, 0]}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <capsuleGeometry args={[0.045, 0.14, 10, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <group ref={rightWristRef} position={[0, -0.22, 0]}>
              <mesh>
                <sphereGeometry args={[0.035, 10, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              <mesh position={[0, -0.05, 0.01]} scale={[0.75, 0.9, 0.45]}>
                <boxGeometry args={[0.07, 0.08, 0.05]} />
                <meshStandardMaterial color={skin} />
              </mesh>
              {holdingBlock && (
                <mesh position={[0, -0.15, 0.12]}>
                  <boxGeometry args={[Math.min(holdingBlock.width * 0.2, 0.6), 0.2, 0.28]} />
                  <meshStandardMaterial 
                    color={holdingBlock.color} 
                    emissive={holdingBlock.color}
                    emissiveIntensity={0.4}
                    metalness={0.5}
                    roughness={0.2}
                  />
                </mesh>
              )}
            </group>
          </group>
        </group>
        
        <group position={[0, 0.46, 0]}>
          <mesh>
            <cylinderGeometry args={[0.055, 0.065, 0.1, 16]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          
          <group ref={headRef} position={[0, 0.2, 0]}>
            <mesh scale={[0.95, 1.05, 0.95]}>
              <sphereGeometry args={[0.16, 32, 24]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.03, 0.1]} scale={[0.65, 0.5, 0.35]}>
              <sphereGeometry args={[0.13, 24, 16]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.1, 0.08]} scale={[0.45, 0.3, 0.3]}>
              <sphereGeometry args={[0.1, 16, 12]} />
              <meshStandardMaterial color={skin} />
            </mesh>
            
            <group ref={hairRef}>
              <mesh position={[0, 0.06, 0]} scale={[1.06, 0.9, 1.02]}>
                <sphereGeometry args={[0.165, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                <meshStandardMaterial color={hair} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.1, -0.02]} scale={[1.08, 0.45, 1.08]}>
                <sphereGeometry args={[0.16, 32, 16]} />
                <meshStandardMaterial color={hair} />
              </mesh>
              {[-0.11, 0.11].map((x, i) => (
                <group key={i}>
                  <mesh position={[x, 0, -0.1]} scale={[0.35, 0.75, 0.55]}>
                    <sphereGeometry args={[0.11, 16, 12]} />
                    <meshStandardMaterial color={hair} />
                  </mesh>
                  <mesh position={[x * 1.2, -0.15, 0.04]} rotation={[0.15, x > 0 ? -0.2 : 0.2, x > 0 ? 0.15 : -0.15]}>
                    <capsuleGeometry args={[0.022, 0.4, 8, 12]} />
                    <meshStandardMaterial color={hair} />
                  </mesh>
                  <mesh position={[x * 1.1, -0.25, 0.06]} rotation={[0.1, x > 0 ? -0.15 : 0.15, x > 0 ? 0.1 : -0.1]}>
                    <capsuleGeometry args={[0.018, 0.35, 8, 12]} />
                    <meshStandardMaterial color={hairHighlight} />
                  </mesh>
                </group>
              ))}
              <mesh position={[0, 0.14, 0.06]} rotation={[0.25, 0, 0]} scale={[0.75, 0.25, 0.45]}>
                <sphereGeometry args={[0.1, 16, 12]} />
                <meshStandardMaterial color={hairHighlight} />
              </mesh>
            </group>
            
            <group ref={eyesRef}>
              {[-0.048, 0.048].map((x, i) => (
                <group key={i} position={[x, 0.03, 0.13]}>
                  <mesh scale={[1, 0.85, 0.55]}>
                    <sphereGeometry args={[0.03, 16, 12]} />
                    <meshStandardMaterial color={eyeWhite} />
                  </mesh>
                  <mesh position={[0, 0, 0.016]} scale={[0.65, 0.65, 0.45]}>
                    <sphereGeometry args={[0.024, 16, 12]} />
                    <meshStandardMaterial color={iris} />
                  </mesh>
                  <mesh position={[0, 0, 0.024]}>
                    <sphereGeometry args={[0.01, 12, 8]} />
                    <meshStandardMaterial color={pupil} />
                  </mesh>
                  <mesh position={[0.004, 0.005, 0.026]}>
                    <sphereGeometry args={[0.003, 8, 6]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
                  </mesh>
                </group>
              ))}
            </group>
            
            {[-0.048, 0.048].map((x, i) => (
              <mesh key={i} position={[x, 0.07, 0.12]} rotation={[0.08, i === 0 ? 0.08 : -0.08, i === 0 ? -0.12 : 0.12]}>
                <boxGeometry args={[0.042, 0.01, 0.016]} />
                <meshStandardMaterial color={hair} />
              </mesh>
            ))}
            
            <mesh position={[0, -0.02, 0.145]} rotation={[0.15, 0, 0]}>
              <sphereGeometry args={[0.018, 12, 8]} />
              <meshStandardMaterial color={skinDark} />
            </mesh>
            
            <mesh ref={mouthRef} position={[0, -0.065, 0.12]} rotation={[0.08, 0, 0]} scale={[1, 0.5, 0.4]}>
              <capsuleGeometry args={[0.016, 0.025, 8, 12]} />
              <meshStandardMaterial color={lips} />
            </mesh>
            
            {[-0.085, 0.085].map((x, i) => (
              <mesh key={i} position={[x, -0.015, 0.125]} scale={[0.75, 0.45, 0.25]}>
                <sphereGeometry args={[0.03, 12, 8]} />
                <meshStandardMaterial color={blush} transparent opacity={0.35} />
              </mesh>
            ))}
            
            {[-0.115, 0.115].map((x, i) => (
              <mesh key={i} position={[x, 0, 0.065]} scale={[0.25, 0.45, 0.18]}>
                <sphereGeometry args={[0.035, 12, 8]} />
                <meshStandardMaterial color={skin} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

export function Character3D({ position, targetPosition, animation, holdingBlock, onReachedTarget }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...position));
  const isWalking = useRef(false);
  const currentRotation = useRef(0);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const target = new THREE.Vector3(...targetPosition);
    const current = currentPos.current;
    const distance = current.distanceTo(target);
    
    if (distance > 0.1) {
      isWalking.current = true;
      const speed = 3.5;
      const direction = target.clone().sub(current).normalize();
      const movement = direction.multiplyScalar(Math.min(speed * delta, distance));
      current.add(movement);
      
      const targetAngle = Math.atan2(-direction.x, -direction.z);
      let angleDiff = targetAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * 0.1;
      groupRef.current.rotation.y = currentRotation.current;
    } else {
      if (isWalking.current) {
        isWalking.current = false;
        onReachedTarget?.();
      }
      const targetAngle = 0;
      let angleDiff = targetAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * 0.05;
      groupRef.current.rotation.y = currentRotation.current;
    }
    
    groupRef.current.position.copy(current);
  });
  
  const effectiveAnimation = isWalking.current ? 'walk' : animation;
  
  return (
    <group ref={groupRef} position={position} scale={[1.4, 1.4, 1.4]}>
      <RealisticHumanBody animation={effectiveAnimation} holdingBlock={holdingBlock} />
      <pointLight position={[0, 2.5, 2]} intensity={0.5} color="#FFE8E0" distance={5} />
    </group>
  );
}

interface SpeechBubbleProps {
  text: string;
  position: [number, number, number];
  visible: boolean;
}

export function SpeechBubble({ text, position, visible }: SpeechBubbleProps) {
  if (!visible || !text) return null;
  
  return (
    <Html 
      position={[position[0], position[1] + 4.5, position[2]]} 
      center 
      distanceFactor={10}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[100, 0]}
    >
      <div className="relative animate-fadeIn" style={{ transform: 'translateY(-100%)' }}>
        <div 
          className="bg-gradient-to-br from-white via-white to-pink-50 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-2xl border-2 border-pink-300/50"
          style={{ 
            minWidth: '320px',
            maxWidth: '450px',
            boxShadow: '0 10px 40px rgba(236, 72, 153, 0.3), 0 0 20px rgba(255, 255, 255, 0.5)'
          }}
        >
          <p className="text-gray-800 text-sm font-medium leading-relaxed text-center">{text}</p>
        </div>
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: '-12px',
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '14px solid white',
            filter: 'drop-shadow(0 2px 4px rgba(236, 72, 153, 0.2))'
          }}
        />
      </div>
    </Html>
  );
}

export interface AlgorithmStep {
  type: 'intro' | 'explain' | 'walk_to_pickup' | 'pickup' | 'walk_to_place' | 'place' | 'complete';
  message: string;
  blockIndex?: number;
  processId?: string;
  targetPosition?: [number, number, number];
  duration: number;
}

export function generateAlgorithmSteps(
  ganttChart: GanttBlock[],
  processes: Process[],
  algorithm: string,
  totalTime: number
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const startX = -12;
  const centerZ = (processes.length - 1) * 1.25;
  
  steps.push({
    type: 'intro',
    message: `Hello! I'm your AI guide. Let me explain how ${algorithm} scheduling works!`,
    targetPosition: [startX, 0, centerZ],
    duration: 3500
  });
  
  const explanations: Record<string, string> = {
    'FCFS': 'First Come First Serve executes processes in arrival order. Simple but can cause convoy effect!',
    'SJF': 'Shortest Job First picks the smallest burst time. Optimal average waiting but needs prediction!',
    'SRTF': 'Shortest Remaining Time First preempts if a shorter job arrives. Truly optimal!',
    'Priority': 'Priority Scheduling runs highest priority first. Watch for starvation!',
    'Round Robin': 'Round Robin gives each process a time quantum. Fair and responsive!',
    'First Come First Serve (FCFS)': 'FCFS executes in arrival order. Simple and fair, but convoy effect possible!',
    'Shortest Job First (SJF)': 'SJF picks smallest burst time. Minimizes average waiting time!',
    'Shortest Remaining Time First (SRTF)': 'SRTF preempts for shorter jobs. Optimal average waiting!',
    'Priority Scheduling': 'Priority runs important processes first. Use aging to prevent starvation!',
    'default': 'This algorithm determines CPU allocation. Watch as I demonstrate!'
  };
  
  steps.push({
    type: 'explain',
    message: explanations[algorithm] || explanations['default'],
    targetPosition: [startX, 0, centerZ],
    duration: 5000
  });
  
  steps.push({
    type: 'explain',
    message: "Now watch me walk through the graph and place each process block on the timeline!",
    targetPosition: [startX, 0, centerZ],
    duration: 3000
  });
  
  ganttChart.forEach((block, index) => {
    const process = processes.find(p => p.id === block.processId);
    if (!process) return;
    
    const rowIndex = processes.findIndex(p => p.id === block.processId);
    const pickupZ = rowIndex * 2.5;
    const blockX = ((block.startTime + block.endTime) / 2 / totalTime) * 16 - 8;
    
    steps.push({
      type: 'walk_to_pickup',
      message: `Walking to get ${block.processId}...`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [-11, 0, pickupZ],
      duration: 2500
    });
    
    steps.push({
      type: 'pickup',
      message: `Picking up ${block.processId}! Burst: ${block.endTime - block.startTime} units`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [-11, 0, pickupZ],
      duration: 1500
    });
    
    steps.push({
      type: 'walk_to_place',
      message: `Carrying ${block.processId} to position ${block.startTime}-${block.endTime}...`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [blockX, 0, pickupZ + 3],
      duration: 3000
    });
    
    steps.push({
      type: 'place',
      message: `Placed ${block.processId} at time ${block.startTime} to ${block.endTime}!`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [blockX, 0, pickupZ + 3],
      duration: 1500
    });
  });
  
  const avgWait = processes.length > 0 
    ? processes.reduce((s, p) => s + (p.waitingTime || 0), 0) / processes.length 
    : 0;
  const avgTurn = processes.length > 0 
    ? processes.reduce((s, p) => s + (p.turnaroundTime || 0), 0) / processes.length 
    : 0;
  
  steps.push({
    type: 'complete',
    message: `Done! Avg Wait: ${avgWait.toFixed(1)} | Avg Turnaround: ${avgTurn.toFixed(1)}. Great learning ${algorithm}!`,
    targetPosition: [startX, 0, centerZ],
    duration: 5000
  });
  
  return steps;
}
