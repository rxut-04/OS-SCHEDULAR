"use client";

import { useRef, useMemo } from 'react';
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

function UltraRealisticFemaleBody({ animation, holdingBlock }: { animation: string; holdingBlock?: { color: string; width: number } | null }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const waistRef = useRef<THREE.Group>(null);
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
  const leftAnkleRef = useRef<THREE.Group>(null);
  const rightAnkleRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Group>(null);
  const eyelashesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (bodyRef.current) {
      if (animation === 'walk') {
        bodyRef.current.position.y = Math.abs(Math.sin(time * 6)) * 0.03;
      } else {
        bodyRef.current.position.y = Math.sin(time * 1.2) * 0.01;
      }
    }
    
    if (waistRef.current) {
      if (animation === 'idle') {
        waistRef.current.rotation.y = Math.sin(time * 0.5) * 0.03;
        waistRef.current.rotation.z = Math.sin(time * 0.3) * 0.015;
      } else if (animation === 'walk') {
        const walkCycle = time * 6;
        waistRef.current.rotation.y = Math.sin(walkCycle) * 0.08;
        waistRef.current.rotation.z = Math.sin(walkCycle) * 0.02;
      }
    }
    
    if (chestRef.current) {
      if (animation === 'idle') {
        chestRef.current.rotation.x = Math.sin(time * 1.5) * 0.01;
      } else if (animation === 'walk') {
        chestRef.current.rotation.y = Math.sin(time * 6 + Math.PI) * 0.04;
      }
    }
    
    if (headRef.current) {
      if (animation === 'walk') {
        headRef.current.rotation.y = Math.sin(time * 3) * 0.02;
        headRef.current.rotation.x = Math.sin(time * 6) * 0.015;
      } else if (animation === 'idle') {
        headRef.current.rotation.y = Math.sin(time * 0.4) * 0.06;
        headRef.current.rotation.x = Math.sin(time * 0.3) * 0.03;
        headRef.current.rotation.z = Math.sin(time * 0.25) * 0.02;
      } else if (animation === 'explain') {
        headRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
        headRef.current.rotation.x = Math.sin(time * 2) * 0.04;
      }
    }
    
    if (hairRef.current) {
      if (animation === 'walk') {
        hairRef.current.rotation.x = Math.sin(time * 6) * 0.06;
        hairRef.current.rotation.z = Math.sin(time * 3) * 0.03;
      } else {
        hairRef.current.rotation.x = Math.sin(time * 0.8) * 0.02;
      }
    }
    
    if (eyesRef.current) {
      const blinkCycle = time % 4;
      eyesRef.current.scale.y = blinkCycle < 0.12 ? 0.1 : 1;
    }
    
    if (eyelashesRef.current) {
      const blinkCycle = time % 4;
      eyelashesRef.current.scale.y = blinkCycle < 0.12 ? 0.3 : 1;
    }
    
    if (mouthRef.current) {
      if (animation === 'explain' || animation === 'wave') {
        mouthRef.current.scale.y = 0.6 + Math.sin(time * 8) * 0.5;
        mouthRef.current.scale.x = 1 + Math.sin(time * 6) * 0.2;
      } else if (animation === 'idle') {
        mouthRef.current.scale.y = 1 + Math.sin(time * 0.5) * 0.1;
      } else {
        mouthRef.current.scale.y = 1;
        mouthRef.current.scale.x = 1;
      }
    }
    
    const shoulderSwing = { left: 0, right: 0 };
    const elbowBend = { left: -0.1, right: -0.1 };
    const wristRotation = { left: 0, right: 0 };
    const hipSwing = { left: 0, right: 0 };
    const kneeBend = { left: 0, right: 0 };
    const ankleBend = { left: 0, right: 0 };
    
    switch (animation) {
      case 'idle':
        shoulderSwing.left = Math.sin(time * 0.8) * 0.03;
        shoulderSwing.right = Math.sin(time * 0.8 + Math.PI) * 0.03;
        elbowBend.left = -0.15 + Math.sin(time * 0.6) * 0.03;
        elbowBend.right = -0.15 + Math.sin(time * 0.6 + Math.PI) * 0.03;
        hipSwing.left = Math.sin(time * 0.4) * 0.02;
        hipSwing.right = Math.sin(time * 0.4 + Math.PI) * 0.02;
        break;
        
      case 'wave':
        shoulderSwing.right = -2.6;
        elbowBend.right = -2.0 + Math.sin(time * 10) * 0.35;
        wristRotation.right = Math.sin(time * 12) * 0.5;
        shoulderSwing.left = 0.15;
        elbowBend.left = -0.25;
        if (hipsRef.current) {
          hipsRef.current.rotation.z = 0.05;
        }
        break;
        
      case 'point':
        shoulderSwing.right = -1.6;
        elbowBend.right = -0.2;
        shoulderSwing.left = 0.2;
        elbowBend.left = -0.35;
        break;
        
      case 'pickup':
        const pickPhase = (Math.sin(time * 2.5) + 1) / 2;
        shoulderSwing.left = -0.8 - pickPhase * 0.5;
        shoulderSwing.right = -0.8 - pickPhase * 0.5;
        elbowBend.left = -1.2 - pickPhase * 0.3;
        elbowBend.right = -1.2 - pickPhase * 0.3;
        if (torsoRef.current) {
          torsoRef.current.rotation.x = pickPhase * 0.1;
        }
        kneeBend.left = pickPhase * 0.2;
        kneeBend.right = pickPhase * 0.2;
        break;
        
      case 'place':
        const placePhase = (Math.sin(time * 2) + 1) / 2;
        shoulderSwing.left = -0.5 - placePhase * 0.4;
        shoulderSwing.right = -0.5 - placePhase * 0.4;
        elbowBend.left = -0.9 - placePhase * 0.25;
        elbowBend.right = -0.9 - placePhase * 0.25;
        break;
        
      case 'explain':
        const gestureTime = time * 2;
        shoulderSwing.left = -0.7 + Math.sin(gestureTime) * 0.4;
        shoulderSwing.right = -0.7 + Math.sin(gestureTime + 1.2) * 0.4;
        elbowBend.left = -1.2 + Math.sin(gestureTime * 1.3) * 0.35;
        elbowBend.right = -1.2 + Math.sin(gestureTime * 1.3 + 0.8) * 0.35;
        wristRotation.left = Math.sin(gestureTime * 1.5) * 0.35;
        wristRotation.right = Math.sin(gestureTime * 1.5 + 1) * 0.35;
        if (hipsRef.current) {
          hipsRef.current.rotation.y = Math.sin(gestureTime * 0.5) * 0.04;
        }
        break;
        
      case 'walk':
        const walkCycle = time * 6;
        shoulderSwing.left = Math.sin(walkCycle) * 0.35;
        shoulderSwing.right = Math.sin(walkCycle + Math.PI) * 0.35;
        elbowBend.left = -0.3 - Math.abs(Math.sin(walkCycle)) * 0.25;
        elbowBend.right = -0.3 - Math.abs(Math.sin(walkCycle + Math.PI)) * 0.25;
        hipSwing.left = Math.sin(walkCycle + Math.PI) * 0.45;
        hipSwing.right = Math.sin(walkCycle) * 0.45;
        kneeBend.left = Math.max(0, Math.sin(walkCycle + Math.PI)) * 0.8;
        kneeBend.right = Math.max(0, Math.sin(walkCycle)) * 0.8;
        ankleBend.left = Math.sin(walkCycle + Math.PI) * 0.2;
        ankleBend.right = Math.sin(walkCycle) * 0.2;
        if (hipsRef.current) {
          hipsRef.current.rotation.y = Math.sin(walkCycle) * 0.12;
          hipsRef.current.rotation.z = Math.sin(walkCycle) * 0.04;
          hipsRef.current.rotation.x = Math.sin(walkCycle * 2) * 0.015;
        }
        break;
    }
    
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = shoulderSwing.left;
      leftShoulderRef.current.rotation.z = 0.08;
    }
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.x = shoulderSwing.right;
      rightShoulderRef.current.rotation.z = -0.08;
    }
    if (leftElbowRef.current) leftElbowRef.current.rotation.x = elbowBend.left;
    if (rightElbowRef.current) rightElbowRef.current.rotation.x = elbowBend.right;
    if (leftWristRef.current) {
      leftWristRef.current.rotation.z = wristRotation.left;
      leftWristRef.current.rotation.x = wristRotation.left * 0.3;
    }
    if (rightWristRef.current) {
      rightWristRef.current.rotation.z = wristRotation.right;
      rightWristRef.current.rotation.x = wristRotation.right * 0.3;
    }
    if (leftHipRef.current) leftHipRef.current.rotation.x = hipSwing.left;
    if (rightHipRef.current) rightHipRef.current.rotation.x = hipSwing.right;
    if (leftKneeRef.current) leftKneeRef.current.rotation.x = kneeBend.left;
    if (rightKneeRef.current) rightKneeRef.current.rotation.x = kneeBend.right;
    if (leftAnkleRef.current) leftAnkleRef.current.rotation.x = ankleBend.left;
    if (rightAnkleRef.current) rightAnkleRef.current.rotation.x = ankleBend.right;
  });

  const skin = '#FFE4D0';
  const skinLight = '#FFF0E6';
  const skinDark = '#E8C4B0';
  const skinBlush = '#FFCDC4';
  const hair = '#1A0A00';
  const hairHighlight = '#3D1F0D';
  const hairShine = '#5C3A21';
  const dress = '#E91E63';
  const dressLight = '#F48FB1';
  const dressDark = '#AD1457';
  const heels = '#212121';
  const heelAccent = '#D4AF37';
  const eyeWhite = '#FFFAFA';
  const iris = '#4A6741';
  const irisLight = '#6B8E5A';
  const pupil = '#0A0A0A';
  const lips = '#E57373';
  const lipsGloss = '#FF8A80';
  const blush = '#FFAB91';
  const eyeshadow = '#CE93D8';
  const eyeliner = '#1A1A1A';
  const nailColor = '#E91E63';
  
  return (
    <group ref={bodyRef}>
      <group ref={hipsRef} position={[0, 0.92, 0]}>
        <mesh scale={[1.15, 0.65, 0.9]}>
          <sphereGeometry args={[0.22, 32, 24]} />
          <meshStandardMaterial color={dress} metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[0.08, -0.02, 0]} scale={[0.55, 0.6, 0.5]}>
          <sphereGeometry args={[0.2, 24, 20]} />
          <meshStandardMaterial color={dress} metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[-0.08, -0.02, 0]} scale={[0.55, 0.6, 0.5]}>
          <sphereGeometry args={[0.2, 24, 20]} />
          <meshStandardMaterial color={dress} metalness={0.1} roughness={0.6} />
        </mesh>
        
        <group ref={leftHipRef} position={[-0.1, -0.08, 0]}>
          <mesh position={[0, -0.18, 0]} scale={[1, 1, 0.95]}>
            <capsuleGeometry args={[0.085, 0.22, 16, 20]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          <mesh position={[-0.01, -0.1, 0]} scale={[1.1, 0.5, 1]}>
            <sphereGeometry args={[0.09, 20, 16]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          
          <group ref={leftKneeRef} position={[0, -0.36, 0]}>
            <mesh scale={[0.9, 1.1, 0.9]}>
              <sphereGeometry args={[0.065, 20, 16]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.18, 0]} scale={[0.95, 1, 0.95]}>
              <capsuleGeometry args={[0.058, 0.22, 14, 18]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.12, 0.02]} scale={[0.6, 0.8, 0.5]}>
              <sphereGeometry args={[0.06, 16, 12]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            
            <group ref={leftAnkleRef} position={[0, -0.36, 0]}>
              <mesh scale={[0.75, 0.9, 0.8]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.06, 0.04]} rotation={[0.3, 0, 0]} scale={[0.7, 0.4, 1.3]}>
                <boxGeometry args={[0.08, 0.06, 0.14]} />
                <meshStandardMaterial color={heels} metalness={0.4} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.11, -0.03]} scale={[0.3, 0.12, 0.3]}>
                <cylinderGeometry args={[0.03, 0.02, 0.08, 12]} />
                <meshStandardMaterial color={heelAccent} metalness={0.6} roughness={0.2} />
              </mesh>
            </group>
          </group>
        </group>
        
        <group ref={rightHipRef} position={[0.1, -0.08, 0]}>
          <mesh position={[0, -0.18, 0]} scale={[1, 1, 0.95]}>
            <capsuleGeometry args={[0.085, 0.22, 16, 20]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          <mesh position={[0.01, -0.1, 0]} scale={[1.1, 0.5, 1]}>
            <sphereGeometry args={[0.09, 20, 16]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          
          <group ref={rightKneeRef} position={[0, -0.36, 0]}>
            <mesh scale={[0.9, 1.1, 0.9]}>
              <sphereGeometry args={[0.065, 20, 16]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.18, 0]} scale={[0.95, 1, 0.95]}>
              <capsuleGeometry args={[0.058, 0.22, 14, 18]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.12, 0.02]} scale={[0.6, 0.8, 0.5]}>
              <sphereGeometry args={[0.06, 16, 12]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            
            <group ref={rightAnkleRef} position={[0, -0.36, 0]}>
              <mesh scale={[0.75, 0.9, 0.8]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.06, 0.04]} rotation={[0.3, 0, 0]} scale={[0.7, 0.4, 1.3]}>
                <boxGeometry args={[0.08, 0.06, 0.14]} />
                <meshStandardMaterial color={heels} metalness={0.4} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.11, -0.03]} scale={[0.3, 0.12, 0.3]}>
                <cylinderGeometry args={[0.03, 0.02, 0.08, 12]} />
                <meshStandardMaterial color={heelAccent} metalness={0.6} roughness={0.2} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      
      <group ref={waistRef} position={[0, 1.08, 0]}>
        <mesh scale={[0.85, 0.55, 0.7]}>
          <sphereGeometry args={[0.18, 28, 22]} />
          <meshStandardMaterial color={dress} metalness={0.1} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, 0]} scale={[0.75, 0.4, 0.6]}>
          <sphereGeometry args={[0.16, 24, 18]} />
          <meshStandardMaterial color={dressDark} metalness={0.15} roughness={0.5} />
        </mesh>
      </group>
      
      <group ref={torsoRef} position={[0, 1.18, 0]}>
        <group ref={chestRef}>
          <mesh position={[0, 0.12, 0]} scale={[1.05, 0.7, 0.85]}>
            <capsuleGeometry args={[0.15, 0.18, 20, 28]} />
            <meshStandardMaterial color={dress} metalness={0.1} roughness={0.6} />
          </mesh>
          <mesh position={[0.06, 0.1, 0.08]} scale={[0.45, 0.42, 0.38]}>
            <sphereGeometry args={[0.14, 24, 20]} />
            <meshStandardMaterial color={dressLight} metalness={0.05} roughness={0.65} />
          </mesh>
          <mesh position={[-0.06, 0.1, 0.08]} scale={[0.45, 0.42, 0.38]}>
            <sphereGeometry args={[0.14, 24, 20]} />
            <meshStandardMaterial color={dressLight} metalness={0.05} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.22, 0]} scale={[0.95, 0.4, 0.75]}>
            <sphereGeometry args={[0.16, 24, 20]} />
            <meshStandardMaterial color={dress} metalness={0.1} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.28, 0.06]} scale={[0.8, 0.25, 0.5]}>
            <sphereGeometry args={[0.12, 20, 16]} />
            <meshStandardMaterial color={skinLight} metalness={0.05} roughness={0.75} />
          </mesh>
        </group>
        
        <group ref={leftShoulderRef} position={[-0.22, 0.26, 0]}>
          <mesh scale={[1.1, 0.9, 0.95]}>
            <sphereGeometry args={[0.055, 18, 14]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[0.95, 1, 0.95]}>
            <capsuleGeometry args={[0.042, 0.1, 12, 14]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          
          <group ref={leftElbowRef} position={[0, -0.2, 0]}>
            <mesh scale={[0.85, 1, 0.85]}>
              <sphereGeometry args={[0.035, 14, 10]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.1, 0]} scale={[0.9, 1, 0.9]}>
              <capsuleGeometry args={[0.032, 0.1, 12, 14]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            
            <group ref={leftWristRef} position={[0, -0.18, 0]}>
              <mesh scale={[0.7, 0.85, 0.65]}>
                <sphereGeometry args={[0.028, 12, 10]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.04, 0.01]} scale={[0.65, 0.8, 0.4]}>
                <boxGeometry args={[0.055, 0.065, 0.035]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
              {[0, 1, 2, 3, 4].map((i) => (
                <group key={i} position={[(i - 2) * 0.012, -0.075, 0.012]}>
                  <mesh scale={[0.4, i === 0 ? 0.6 : 0.8, 0.4]}>
                    <capsuleGeometry args={[0.006, i === 0 ? 0.015 : 0.02, 6, 8]} />
                    <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
                  </mesh>
                  <mesh position={[0, i === 0 ? -0.02 : -0.025, 0]} scale={[0.5, 0.3, 0.5]}>
                    <sphereGeometry args={[0.005, 8, 6]} />
                    <meshStandardMaterial color={nailColor} metalness={0.3} roughness={0.4} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        </group>
        
        <group ref={rightShoulderRef} position={[0.22, 0.26, 0]}>
          <mesh scale={[1.1, 0.9, 0.95]}>
            <sphereGeometry args={[0.055, 18, 14]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[0.95, 1, 0.95]}>
            <capsuleGeometry args={[0.042, 0.1, 12, 14]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          
          <group ref={rightElbowRef} position={[0, -0.2, 0]}>
            <mesh scale={[0.85, 1, 0.85]}>
              <sphereGeometry args={[0.035, 14, 10]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.1, 0]} scale={[0.9, 1, 0.9]}>
              <capsuleGeometry args={[0.032, 0.1, 12, 14]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            
            <group ref={rightWristRef} position={[0, -0.18, 0]}>
              <mesh scale={[0.7, 0.85, 0.65]}>
                <sphereGeometry args={[0.028, 12, 10]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.04, 0.01]} scale={[0.65, 0.8, 0.4]}>
                <boxGeometry args={[0.055, 0.065, 0.035]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
              {[0, 1, 2, 3, 4].map((i) => (
                <group key={i} position={[(i - 2) * 0.012, -0.075, 0.012]}>
                  <mesh scale={[0.4, i === 0 ? 0.6 : 0.8, 0.4]}>
                    <capsuleGeometry args={[0.006, i === 0 ? 0.015 : 0.02, 6, 8]} />
                    <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
                  </mesh>
                  <mesh position={[0, i === 0 ? -0.02 : -0.025, 0]} scale={[0.5, 0.3, 0.5]}>
                    <sphereGeometry args={[0.005, 8, 6]} />
                    <meshStandardMaterial color={nailColor} metalness={0.3} roughness={0.4} />
                  </mesh>
                </group>
              ))}
              {holdingBlock && (
                <mesh position={[0, -0.12, 0.1]}>
                  <boxGeometry args={[Math.min(holdingBlock.width * 0.18, 0.5), 0.18, 0.25]} />
                  <meshStandardMaterial 
                    color={holdingBlock.color} 
                    emissive={holdingBlock.color}
                    emissiveIntensity={0.35}
                    metalness={0.45}
                    roughness={0.25}
                  />
                </mesh>
              )}
            </group>
          </group>
        </group>
        
        <group position={[0, 0.38, 0]}>
          <mesh scale={[0.6, 0.7, 0.55]}>
            <cylinderGeometry args={[0.042, 0.048, 0.08, 18]} />
            <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
          </mesh>
          
          <group ref={headRef} position={[0, 0.14, 0]}>
            <mesh scale={[0.88, 1, 0.9]}>
              <sphereGeometry args={[0.13, 40, 32]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0.045, -0.02, 0.05]} scale={[0.35, 0.45, 0.25]}>
              <sphereGeometry args={[0.08, 24, 20]} />
              <meshStandardMaterial color={skinBlush} metalness={0.02} roughness={0.8} />
            </mesh>
            <mesh position={[-0.045, -0.02, 0.05]} scale={[0.35, 0.45, 0.25]}>
              <sphereGeometry args={[0.08, 24, 20]} />
              <meshStandardMaterial color={skinBlush} metalness={0.02} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.025, 0.085]} scale={[0.5, 0.45, 0.35]}>
              <sphereGeometry args={[0.08, 24, 20]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.035, 0.105]} scale={[0.25, 0.18, 0.15]}>
              <sphereGeometry args={[0.04, 16, 12]} />
              <meshStandardMaterial color={skinDark} metalness={0.05} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.055, 0.095]} scale={[0.38, 0.25, 0.28]}>
              <sphereGeometry args={[0.055, 20, 16]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.08, 0.08]} scale={[0.55, 0.28, 0.35]}>
              <sphereGeometry args={[0.06, 20, 16]} />
              <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
            </mesh>
            
            <group ref={hairRef}>
              <mesh position={[0, 0.04, 0]} scale={[1.02, 0.85, 0.98]}>
                <sphereGeometry args={[0.135, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                <meshStandardMaterial color={hair} metalness={0.3} roughness={0.5} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.065, 0]} scale={[1.04, 0.4, 1.02]}>
                <sphereGeometry args={[0.13, 36, 28]} />
                <meshStandardMaterial color={hair} metalness={0.3} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.08, 0.02]} scale={[0.7, 0.2, 0.6]}>
                <sphereGeometry args={[0.1, 24, 18]} />
                <meshStandardMaterial color={hairShine} metalness={0.35} roughness={0.45} />
              </mesh>
              {[-0.1, 0.1].map((x, i) => (
                <group key={i}>
                  <mesh position={[x, -0.02, -0.06]} scale={[0.35, 0.8, 0.55]}>
                    <sphereGeometry args={[0.1, 20, 16]} />
                    <meshStandardMaterial color={hair} metalness={0.3} roughness={0.5} />
                  </mesh>
                  {[0, 1, 2].map((j) => (
                    <mesh 
                      key={j} 
                      position={[x * (1.15 + j * 0.08), -0.1 - j * 0.12, 0.02 + j * 0.015]} 
                      rotation={[0.1, x > 0 ? -0.15 : 0.15, x > 0 ? 0.12 - j * 0.04 : -0.12 + j * 0.04]}
                      scale={[0.85 - j * 0.08, 1, 0.85 - j * 0.08]}
                    >
                      <capsuleGeometry args={[0.018 - j * 0.002, 0.32 - j * 0.06, 10, 14]} />
                      <meshStandardMaterial color={j === 1 ? hairHighlight : hair} metalness={0.3} roughness={0.5} />
                    </mesh>
                  ))}
                </group>
              ))}
              <mesh position={[0, 0.1, 0.045]} rotation={[0.3, 0, 0]} scale={[0.6, 0.18, 0.4]}>
                <sphereGeometry args={[0.08, 18, 14]} />
                <meshStandardMaterial color={hairHighlight} metalness={0.35} roughness={0.45} />
              </mesh>
            </group>
            
            <group ref={eyesRef}>
              {[-0.038, 0.038].map((x, i) => (
                <group key={i} position={[x, 0.02, 0.1]}>
                  <mesh position={[0, 0.012, 0]} scale={[1.1, 0.35, 0.2]}>
                    <sphereGeometry args={[0.025, 16, 12]} />
                    <meshStandardMaterial color={eyeshadow} transparent opacity={0.35} metalness={0.1} roughness={0.6} />
                  </mesh>
                  <mesh scale={[1.05, 0.75, 0.5]}>
                    <sphereGeometry args={[0.024, 20, 16]} />
                    <meshStandardMaterial color={eyeWhite} metalness={0.02} roughness={0.9} />
                  </mesh>
                  <mesh position={[0, 0, 0.012]} scale={[0.7, 0.7, 0.45]}>
                    <sphereGeometry args={[0.018, 20, 16]} />
                    <meshStandardMaterial color={iris} metalness={0.1} roughness={0.6} />
                  </mesh>
                  <mesh position={[x > 0 ? 0.003 : -0.003, 0.002, 0.014]} scale={[0.5, 0.5, 0.35]}>
                    <sphereGeometry args={[0.014, 16, 12]} />
                    <meshStandardMaterial color={irisLight} metalness={0.1} roughness={0.6} />
                  </mesh>
                  <mesh position={[0, 0, 0.018]}>
                    <sphereGeometry args={[0.007, 14, 10]} />
                    <meshStandardMaterial color={pupil} metalness={0} roughness={0.95} />
                  </mesh>
                  <mesh position={[0.003, 0.003, 0.02]}>
                    <sphereGeometry args={[0.002, 8, 6]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
                  </mesh>
                  <mesh position={[-0.002, -0.002, 0.019]}>
                    <sphereGeometry args={[0.001, 6, 4]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
                  </mesh>
                </group>
              ))}
            </group>
            
            <group ref={eyelashesRef}>
              {[-0.038, 0.038].map((x, i) => (
                <group key={i} position={[x, 0.032, 0.105]}>
                  {[0, 1, 2, 3, 4].map((j) => (
                    <mesh 
                      key={j} 
                      position={[(j - 2) * 0.008, 0.002 - Math.abs(j - 2) * 0.001, 0.005]}
                      rotation={[0.4 - Math.abs(j - 2) * 0.08, 0, (j - 2) * 0.12 * (x > 0 ? 1 : -1)]}
                    >
                      <capsuleGeometry args={[0.001, 0.012 - Math.abs(j - 2) * 0.002, 4, 6]} />
                      <meshStandardMaterial color={eyeliner} />
                    </mesh>
                  ))}
                </group>
              ))}
            </group>
            
            {[-0.038, 0.038].map((x, i) => (
              <mesh 
                key={i} 
                position={[x, 0.052, 0.095]} 
                rotation={[0.1, i === 0 ? 0.06 : -0.06, i === 0 ? -0.1 : 0.1]}
                scale={[1.2, 0.18, 0.15]}
              >
                <capsuleGeometry args={[0.005, 0.032, 8, 12]} />
                <meshStandardMaterial color={hair} metalness={0.2} roughness={0.6} />
              </mesh>
            ))}
            
            <mesh ref={mouthRef} position={[0, -0.048, 0.09]} rotation={[0.12, 0, 0]} scale={[1, 0.45, 0.4]}>
              <capsuleGeometry args={[0.012, 0.018, 12, 16]} />
              <meshStandardMaterial color={lips} metalness={0.15} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.044, 0.095]} scale={[0.7, 0.25, 0.2]}>
              <capsuleGeometry args={[0.008, 0.012, 10, 12]} />
              <meshStandardMaterial color={lipsGloss} metalness={0.25} roughness={0.35} />
            </mesh>
            
            {[-0.065, 0.065].map((x, i) => (
              <mesh key={i} position={[x, 0, 0.055]} scale={[0.2, 0.35, 0.15]}>
                <sphereGeometry args={[0.028, 14, 10]} />
                <meshStandardMaterial color={skin} metalness={0.05} roughness={0.7} />
              </mesh>
            ))}
            
            <mesh position={[0.065, 0.01, 0.04]} rotation={[0, 0.3, 0.2]} scale={[0.1, 0.15, 0.02]}>
              <torusGeometry args={[0.012, 0.002, 8, 16, Math.PI * 1.2]} />
              <meshStandardMaterial color={heelAccent} metalness={0.7} roughness={0.2} />
            </mesh>
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
      const speed = 3.0;
      const direction = target.clone().sub(current).normalize();
      const movement = direction.multiplyScalar(Math.min(speed * delta, distance));
      current.add(movement);
      
      const targetAngle = Math.atan2(direction.x, direction.z);
      let angleDiff = targetAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * 0.12;
      groupRef.current.rotation.y = currentRotation.current;
    } else {
      if (isWalking.current) {
        isWalking.current = false;
        onReachedTarget?.();
      }
      const targetAngle = Math.PI;
      let angleDiff = targetAngle - currentRotation.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentRotation.current += angleDiff * 0.06;
      groupRef.current.rotation.y = currentRotation.current;
    }
    
    groupRef.current.position.copy(current);
  });
  
  const effectiveAnimation = isWalking.current ? 'walk' : animation;
  
  return (
    <group ref={groupRef} position={position} scale={[1.5, 1.5, 1.5]}>
      <UltraRealisticFemaleBody animation={effectiveAnimation} holdingBlock={holdingBlock} />
      <pointLight position={[0, 2, 1.5]} intensity={0.6} color="#FFF5F0" distance={6} />
      <pointLight position={[-1, 1.5, 1]} intensity={0.3} color="#FFE4EC" distance={4} />
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
      position={[position[0], position[1] + 4.8, position[2]]} 
      center 
      distanceFactor={10}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[100, 0]}
    >
      <div className="relative animate-fadeIn" style={{ transform: 'translateY(-100%)' }}>
        <div 
          className="bg-gradient-to-br from-white via-white to-pink-50 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-2xl border-2 border-pink-300/50"
          style={{ 
            minWidth: '340px',
            maxWidth: '480px',
            boxShadow: '0 12px 48px rgba(233, 30, 99, 0.35), 0 0 24px rgba(255, 255, 255, 0.6)'
          }}
        >
          <p className="text-gray-800 text-sm font-medium leading-relaxed text-center">{text}</p>
        </div>
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: '-14px',
            borderLeft: '16px solid transparent',
            borderRight: '16px solid transparent',
            borderTop: '16px solid white',
            filter: 'drop-shadow(0 3px 6px rgba(233, 30, 99, 0.25))'
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
      message: `Picking up ${block.processId}! Duration: ${block.endTime - block.startTime} units`,
      blockIndex: index,
      processId: block.processId,
      targetPosition: [-11, 0, pickupZ],
      duration: 1500
    });
    
    steps.push({
      type: 'walk_to_place',
      message: `Carrying ${block.processId} to timeline position ${block.startTime}-${block.endTime}...`,
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
  
  let totalWait = 0;
  let totalTurnaround = 0;
  let validProcessCount = 0;
  
  processes.forEach(p => {
    if (typeof p.waitingTime === 'number' && !isNaN(p.waitingTime)) {
      totalWait += p.waitingTime;
      validProcessCount++;
    }
    if (typeof p.turnaroundTime === 'number' && !isNaN(p.turnaroundTime)) {
      totalTurnaround += p.turnaroundTime;
    }
  });
  
  const avgWait = validProcessCount > 0 ? totalWait / validProcessCount : 0;
  const avgTurn = validProcessCount > 0 ? totalTurnaround / validProcessCount : 0;
  
  const completionMessage = avgWait > 0 || avgTurn > 0
    ? `All done! Average Waiting Time: ${avgWait.toFixed(1)} | Average Turnaround: ${avgTurn.toFixed(1)}. Great job learning ${algorithm}!`
    : `All done! I've placed all ${ganttChart.length} blocks. Great job learning ${algorithm}!`;
  
  steps.push({
    type: 'complete',
    message: completionMessage,
    targetPosition: [startX, 0, centerZ],
    duration: 5000
  });
  
  return steps;
}
